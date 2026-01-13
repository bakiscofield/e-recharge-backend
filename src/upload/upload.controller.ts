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
  @UseInterceptors(FileInterceptor('file'))
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
}
