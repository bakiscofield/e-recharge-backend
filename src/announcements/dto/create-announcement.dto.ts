import { IsString, IsEnum, IsNotEmpty } from 'class-validator';

export enum AnnouncementDisplayType {
  ONCE = 'ONCE',
  DAILY = 'DAILY',
  EVERY_LOGIN = 'EVERY_LOGIN',
}

export class CreateAnnouncementDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsEnum(AnnouncementDisplayType)
  displayType: AnnouncementDisplayType;
}
