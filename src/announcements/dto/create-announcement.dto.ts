import { IsString, IsEnum, IsNotEmpty } from 'class-validator';

export enum AnnouncementDisplayType {
  ONCE = 'ONCE',
  DAILY = 'DAILY',
}

export class CreateAnnouncementDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsEnum(AnnouncementDisplayType)
  displayType: AnnouncementDisplayType;
}
