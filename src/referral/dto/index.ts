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

  @ApiProperty({ enum: ['FLOOZ', 'TMONEY'] })
  @IsString()
  @IsIn(['FLOOZ', 'TMONEY'])
  network: string;
}
