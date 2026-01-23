import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { diskStorage } from 'multer';
import { extname } from 'path';

// Configuration de stockage commune
const storage = diskStorage({
  destination: './public/uploads',
  filename: (req, file, cb) => {
    const randomName = Array(32)
      .fill(null)
      .map(() => Math.round(Math.random() * 16).toString(16))
      .join('');
    cb(null, `${randomName}${extname(file.originalname)}`);
  },
});

@ApiTags('Upload')
@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  private readonly appUrl: string;

  constructor() {
    // Utiliser l'URL de l'application depuis les variables d'environnement
    this.appUrl = process.env.APP_URL || 'http://localhost:3001';
  }

  @Post('image')
  @ApiOperation({ summary: 'Upload une image (logo, favicon, etc.)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage,
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|svg\+xml|webp|ico)$/)) {
          return cb(new Error('Seules les images sont autorisées!'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max
      },
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    // Retourne l'URL complète (avec le domaine du backend)
    const fileUrl = `${this.appUrl}/uploads/${file.filename}`;

    console.log(`✅ Image uploaded: ${file.filename} → ${fileUrl}`);
    console.log(`📂 Saved to: ${file.path}`);

    return {
      url: fileUrl,
      filename: file.filename,
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  @Post('document')
  @ApiOperation({ summary: 'Upload un document (PDF, Word, Excel, images)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage,
      fileFilter: (req, file, cb) => {
        // Accepter les images, PDF, Word, Excel
        const allowedMimes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ];
        if (!allowedMimes.includes(file.mimetype)) {
          return cb(
            new Error(
              'Type de fichier non supporté. Utilisez: images, PDF, Word ou Excel.',
            ),
            false,
          );
        }
        cb(null, true);
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max pour les documents
      },
    }),
  )
  async uploadDocument(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    // Retourne l'URL complète (avec le domaine du backend)
    const fileUrl = `${this.appUrl}/uploads/${file.filename}`;

    console.log(`✅ Document uploaded: ${file.filename} → ${fileUrl}`);
    console.log(`📂 Saved to: ${file.path}`);

    return {
      url: fileUrl,
      filename: file.filename,
      size: file.size,
      mimetype: file.mimetype,
    };
  }
}
