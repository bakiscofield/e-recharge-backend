import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { SmsService } from './sms.service';
import { EmailService } from '../notifications/email.service';
import {
  RegisterDto,
  RegisterWithEmailDto,
  LoginDto,
  SendOtpDto,
  VerifyOtpDto,
  LoginWithOtpDto,
  VerifyEmailCodeDto,
} from './dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private smsService: SmsService,
    private emailService: EmailService,
  ) {}

  // Inscription classique (email + password + code de vérification)
  async register(dto: RegisterDto) {
    // Vérifier que l'email et le mot de passe sont fournis
    if (!dto.email) {
      throw new BadRequestException('L\'email est obligatoire');
    }
    if (!dto.password) {
      throw new BadRequestException('Le mot de passe est obligatoire');
    }
    if (!dto.verificationCode) {
      throw new BadRequestException('Le code de vérification est obligatoire');
    }

    // Normaliser le numéro de téléphone
    const normalizedPhone = this.normalizePhoneNumber(dto.phone);

    // Vérifier le code de vérification email
    const verificationRecord = await this.prisma.emailVerificationCode.findFirst({
      where: {
        email: dto.email,
        code: dto.verificationCode,
        verified: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!verificationRecord) {
      throw new UnauthorizedException('Code de vérification invalide ou expiré');
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email }, { phone: normalizedPhone }],
      },
    });

    if (existingUser) {
      throw new ConflictException('Email ou téléphone déjà utilisé');
    }

    // Vérifier le code promo si fourni (optionnel - ne bloque pas l'inscription)
    let validReferredBy: string | null = null;
    if (dto.referredBy) {
      // Vérifier si le code appartient à un utilisateur existant
      const referrer = await this.prisma.user.findUnique({
        where: { referralCode: dto.referredBy },
      });

      if (referrer) {
        validReferredBy = dto.referredBy;
      }
      // Si le code est invalide, on l'ignore simplement (pas d'erreur - inscription continue)
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Générer un code parrainage unique
    const referralCode = await this.generateUniqueReferralCode();

    // Créer l'utilisateur (utiliser seulement le code valide)
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        phone: normalizedPhone,
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        country: dto.country,
        referralCode,
        referredBy: validReferredBy,
        emailVerified: true, // Email vérifié via le code
        isVerified: true,
      },
    });

    // Marquer le code comme utilisé
    await this.prisma.emailVerificationCode.update({
      where: { id: verificationRecord.id },
      data: { verified: true },
    });

    // Générer les tokens JWT
    const tokens = this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  // Connexion classique (email/phone + password)
  async login(dto: LoginDto) {
    // Normaliser si c'est un numéro de téléphone
    const normalizedIdentifier = this.normalizePhoneNumber(dto.identifier);
    
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: dto.identifier },
          { phone: normalizedIdentifier },
        ],
      },
    });
    
    if (!user || !user.password) {
      throw new UnauthorizedException('Identifiants invalides');
    }
    console.log(dto);
    
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    console.log(isPasswordValid);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    console.log(user);

    const tokens = this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  // Envoyer OTP
  async sendOtp(dto: SendOtpDto) {
    // Normaliser le numéro de téléphone
    const normalizedPhone = this.normalizePhoneNumber(dto.phone);

    const code = this.generateOtpCode();
    const expiresAt = new Date(
      Date.now() + parseInt(process.env.OTP_EXPIRES_IN || '300') * 1000,
    );

    // Sauvegarder l'OTP
    await this.prisma.otpCode.create({
      data: {
        phone: normalizedPhone,
        code,
        expiresAt,
      },
    });

    // Envoyer le SMS (utiliser le numéro original pour l'envoi)
    await this.smsService.sendOtp(dto.phone, code);

    return {
      message: 'Code OTP envoyé avec succès',
      expiresIn: parseInt(process.env.OTP_EXPIRES_IN || '300'),
    };
  }

  // Vérifier OTP
  async verifyOtp(dto: VerifyOtpDto) {
    // Normaliser le numéro de téléphone
    const normalizedPhone = this.normalizePhoneNumber(dto.phone);

    const otpRecord = await this.prisma.otpCode.findFirst({
      where: {
        phone: normalizedPhone,
        code: dto.code,
        verified: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!otpRecord) {
      throw new UnauthorizedException('Code OTP invalide ou expiré');
    }

    // Marquer comme vérifié
    await this.prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { verified: true },
    });

    return { message: 'Code OTP vérifié avec succès' };
  }

  // Connexion avec OTP (après vérification)
  async loginWithOtp(dto: LoginWithOtpDto) {
    // Normaliser le numéro de téléphone
    const normalizedPhone = this.normalizePhoneNumber(dto.phone);

    // Vérifier que l'OTP a été vérifié
    const otpRecord = await this.prisma.otpCode.findFirst({
      where: {
        phone: normalizedPhone,
        code: dto.code,
        verified: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!otpRecord) {
      throw new UnauthorizedException('Code OTP non vérifié');
    }

    // Récupérer ou créer l'utilisateur
    let user = await this.prisma.user.findUnique({
      where: { phone: normalizedPhone },
    });

    if (!user) {
      // Créer un nouvel utilisateur (inscription via OTP)
      if (!dto.firstName || !dto.lastName || !dto.country) {
        throw new BadRequestException(
          'Informations utilisateur requises pour l\'inscription',
        );
      }

      // Vérifier le code promo si fourni (optionnel)
      let validReferredBy: string | null = null;
      if (dto.referredBy) {
        const referrer = await this.prisma.user.findUnique({
          where: { referralCode: dto.referredBy },
        });
        if (referrer) {
          validReferredBy = dto.referredBy;
        }
      }

      const referralCode = await this.generateUniqueReferralCode();

      user = await this.prisma.user.create({
        data: {
          phone: normalizedPhone,
          email: `${normalizedPhone}@sms.local`,
          firstName: dto.firstName,
          lastName: dto.lastName,
          country: dto.country,
          referralCode,
          referredBy: validReferredBy, // Seulement si valide
          isVerified: true,
        },
      });
    }

    const tokens = this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  // Générer token JWT (access token - courte durée)
  private generateToken(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
    };

    return this.jwtService.sign(payload);
  }

  // Générer refresh token (longue durée - 90 jours)
  private generateRefreshToken(user: any) {
    const payload = {
      sub: user.id,
      type: 'refresh',
    };

    return this.jwtService.sign(payload, {
      expiresIn: '90d',
    });
  }

  // Générer les deux tokens
  private generateTokens(user: any) {
    return {
      accessToken: this.generateToken(user),
      refreshToken: this.generateRefreshToken(user),
    };
  }

  // Rafraîchir le token d'accès
  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Token invalide');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('Utilisateur non trouvé');
      }

      // Générer un nouveau access token
      const newAccessToken = this.generateToken(user);

      return {
        accessToken: newAccessToken,
        user: this.sanitizeUser(user),
      };
    } catch (error) {
      throw new UnauthorizedException('Refresh token invalide ou expiré');
    }
  }

  // Retirer les infos sensibles
  private sanitizeUser(user: any) {
    const { password, ...sanitized } = user;
    return sanitized;
  }

  // Générer code OTP
  private generateOtpCode(): string {
    const length = parseInt(process.env.OTP_LENGTH || '6');
    return Math.floor(Math.random() * Math.pow(10, length))
      .toString()
      .padStart(length, '0');
  }

  // Générer code parrainage unique
  private async generateUniqueReferralCode(): Promise<string> {
    let code: string = '';
    let exists = true;

    while (exists) {
      code = this.generateRandomCode(5);
      const user = await this.prisma.user.findUnique({
        where: { referralCode: code },
      });
      exists = !!user;
    }

    return code;
  }

  private generateRandomCode(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // ==================== EMAIL VERIFICATION ====================

  // Envoyer un code de vérification par email (4 chiffres)
  async sendEmailVerificationCode(email: string) {
    // Vérifier que l'email n'est pas déjà utilisé par un compte existant
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Cet email est déjà utilisé');
    }

    // Générer un code à 4 chiffres
    const code = this.generateEmailVerificationCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // Expire dans 15 minutes

    // Supprimer les anciens codes non utilisés pour cet email
    await this.prisma.emailVerificationCode.deleteMany({
      where: {
        email,
        verified: false,
      },
    });

    // Sauvegarder le code de vérification dans la table dédiée
    await this.prisma.emailVerificationCode.create({
      data: {
        email,
        code,
        expiresAt,
      },
    });

    // Envoyer l'email avec le code
    await this.emailService.sendEmailVerificationCode(email, code);

    return {
      message: 'Code de vérification envoyé à votre email',
      expiresIn: 900, // 15 minutes en secondes
    };
  }

  // Vérifier le code et enregistrer l'utilisateur
  async verifyEmailCodeAndRegister(dto: VerifyEmailCodeDto) {
    const { email, code } = dto;

    // Trouver l'utilisateur temporaire
    const tempUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!tempUser) {
      throw new BadRequestException('Email non trouvé. Veuillez d\'abord envoyer un code.');
    }

    // Vérifier le code et l'expiration
    if (tempUser.emailVerificationCode !== code) {
      throw new UnauthorizedException('Code de vérification invalide');
    }

    if (!tempUser.emailVerificationCodeExpiresAt || tempUser.emailVerificationCodeExpiresAt < new Date()) {
      throw new UnauthorizedException('Code de vérification expiré');
    }

    // Marquer l'email comme vérifié
    await this.prisma.user.update({
      where: { id: tempUser.id },
      data: {
        emailVerified: true,
        emailVerificationCode: null,
        emailVerificationCodeExpiresAt: null,
      },
    });

    return {
      message: 'Email vérifié avec succès',
    };
  }

  // Inscription complète avec email vérifié
  async registerWithEmail(dto: RegisterWithEmailDto) {
    // Normaliser le numéro de téléphone
    const normalizedPhone = this.normalizePhoneNumber(dto.phone);

    // Vérifier que l'email est déjà vérifié
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.emailVerified) {
      throw new BadRequestException('Email non vérifié. Veuillez vérifier votre email d\'abord.');
    }

    // Vérifier que le téléphone n'existe pas
    const existingPhone = await this.prisma.user.findUnique({
      where: { phone: normalizedPhone },
    });

    if (existingPhone) {
      throw new ConflictException('Ce numéro de téléphone est déjà utilisé');
    }

    // Vérifier le code promo si fourni (optionnel)
    let validReferredBy: string | null = null;
    if (dto.referredBy) {
      const referrer = await this.prisma.user.findUnique({
        where: { referralCode: dto.referredBy },
      });
      if (referrer) {
        validReferredBy = dto.referredBy;
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Générer un code parrainage unique
    const referralCode = await this.generateUniqueReferralCode();

    // Mettre à jour l'utilisateur avec les infos complètes
    const updatedUser = await this.prisma.user.update({
      where: { email: dto.email },
      data: {
        phone: normalizedPhone,
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        country: dto.country,
        referralCode,
        referredBy: validReferredBy, // Seulement si valide
        isVerified: true, // Email est déjà vérifié
      },
    });

    // Générer les tokens JWT
    const tokens = this.generateTokens(updatedUser);

    return {
      user: this.sanitizeUser(updatedUser),
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  // Générer un code à 4 chiffres pour l'email
  private generateEmailVerificationCode(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  // Normaliser un numéro de téléphone (enlever +228 et 228)
  private normalizePhoneNumber(phone: string): string {
    if (!phone) return phone;

    // Enlever tous les espaces et caractères non numériques sauf le +
    let normalized = phone.replace(/[\s\-\(\)]/g, '');

    // Enlever le +228 au début
    if (normalized.startsWith('+228')) {
      normalized = normalized.substring(4);
    }
    // Enlever le 228 au début (sans le +)
    else if (normalized.startsWith('228')) {
      normalized = normalized.substring(3);
    }

    return normalized;
  }
}
