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

    // Retourne le chemin relatif (le frontend reconstruira l'URL complète)
    const fileUrl = `/uploads/${file.filename}`;

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
