import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  RegisterDto,
  RegisterWithEmailDto,
  SendEmailVerificationDto,
  VerifyEmailCodeDto,
  LoginDto,
  SendOtpDto,
  VerifyOtpDto,
  LoginWithOtpDto,
} from './dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Inscription avec email/password' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('register/send-email-code')
  @ApiOperation({ summary: 'Envoyer un code de vérification par email' })
  async sendEmailVerification(@Body() dto: SendEmailVerificationDto) {
    return this.authService.sendEmailVerificationCode(dto.email);
  }

  @Post('register/verify-email-code')
  @ApiOperation({ summary: 'Vérifier le code et enregistrer l\'utilisateur' })
  async verifyEmailCode(@Body() dto: VerifyEmailCodeDto) {
    return this.authService.verifyEmailCodeAndRegister(dto);
  }

  @Post('register-with-email')
  @ApiOperation({ summary: 'Inscription avec vérification email (complète)' })
  async registerWithEmail(@Body() dto: RegisterWithEmailDto) {
    return this.authService.registerWithEmail(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Connexion avec email/password' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('otp/send')
  @ApiOperation({ summary: 'Envoyer un code OTP par SMS' })
  async sendOtp(@Body() dto: SendOtpDto) {
    return this.authService.sendOtp(dto);
  }

  @Post('otp/verify')
  @ApiOperation({ summary: 'Vérifier un code OTP' })
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto);
  }

  @Post('otp/login')
  @ApiOperation({ summary: 'Connexion/Inscription avec OTP' })
  async loginWithOtp(@Body() dto: LoginWithOtpDto) {
    return this.authService.loginWithOtp(dto);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Rafraîchir le token d\'accès' })
  async refreshToken(@Body() body: { refreshToken: string }) {
    return this.authService.refreshToken(body.refreshToken);
  }
}
