import { IsString, IsNumber, Min, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestWithdrawalDto {
  @ApiProperty()
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty()
  @IsString()
  phoneNumber: string;

  @ApiProperty({ enum: ['FLOOZ', 'MIXX_BY_YAS'] })
  @IsString()
  @IsIn(['FLOOZ', 'MIXX_BY_YAS'])
  network: string;
}
