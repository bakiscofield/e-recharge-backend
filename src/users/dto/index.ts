import { IsString, IsOptional, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  avatar?: string;
}

export class CreateBookmakerIdDto {
  @ApiProperty()
  @IsString()
  bookmakerId: string;

  @ApiProperty()
  @IsString()
  identifier: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  label?: string;
}

export class UpdateBookmakerIdDto {
  @ApiProperty()
  @IsString()
  identifier: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  label?: string;
}
