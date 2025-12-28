import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateAnnouncementDto {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
