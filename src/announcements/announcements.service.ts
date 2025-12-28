import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AnnouncementsService {
  private readonly appUrl: string;

  constructor(private prisma: PrismaService) {
    // Utiliser l'URL de l'application depuis les variables d'environnement
    this.appUrl = process.env.APP_URL || 'http://localhost:3001';
  }

  async create(
    createAnnouncementDto: CreateAnnouncementDto,
    file: Express.Multer.File,
  ) {
    if (!file) {
      throw new NotFoundException('Aucun fichier fourni');
    }

    // Déterminer le type de fichier
    const fileType = file.mimetype.startsWith('image/') ? 'IMAGE' : 'PDF';

    // Créer l'URL complète du fichier (avec l'URL du backend)
    const fileUrl = `${this.appUrl}/uploads/announcements/${file.filename}`;

    // Créer l'annonce dans la base de données
    const announcement = await this.prisma.announcement.create({
      data: {
        title: createAnnouncementDto.title,
        fileUrl,
        fileType,
        fileName: file.originalname,
        fileSize: file.size,
        displayType: createAnnouncementDto.displayType,
      },
    });

    return announcement;
  }

  async findAll() {
    return this.prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findActive() {
    // Récupérer l'annonce active la plus récente
    const announcement = await this.prisma.announcement.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    return announcement;
  }

  async findOne(id: string) {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id },
    });

    if (!announcement) {
      throw new NotFoundException('Annonce non trouvée');
    }

    return announcement;
  }

  async update(id: string, updateAnnouncementDto: UpdateAnnouncementDto) {
    const announcement = await this.findOne(id);

    return this.prisma.announcement.update({
      where: { id },
      data: updateAnnouncementDto,
    });
  }

  async remove(id: string) {
    const announcement = await this.findOne(id);

    // Supprimer le fichier du disque
    try {
      const filePath = path.join(
        process.cwd(),
        'public',
        announcement.fileUrl,
      );
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du fichier:', error);
    }

    // Supprimer de la base de données
    return this.prisma.announcement.delete({
      where: { id },
    });
  }
}
