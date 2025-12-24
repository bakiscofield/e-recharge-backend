import { IsString, IsNumber, IsIn, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// Enum values as constants
const ORDER_TYPES = ['DEPOT', 'RETRAIT'] as const;
const ORDER_STATES = ['COMING', 'CONFIRMED', 'CANCELLED'] as const;

export class CreateOrderDto {
  @ApiProperty({ enum: ORDER_TYPES })
  @IsIn(ORDER_TYPES, { message: 'Le type doit être DEPOT ou RETRAIT' })
  type: string;

  @ApiProperty()
  @IsNumber({}, { message: 'Le montant doit être un nombre' })
  @Min(0, { message: 'Le montant doit être supérieur ou égal à 0' })
  amount: number;

  @ApiProperty()
  @IsString({ message: 'Le bookmaker est requis' })
  bookmakerId: string;

  @ApiProperty()
  @IsString({ message: "L'agent est requis" })
  employeePaymentMethodId: string;

  @ApiProperty()
  @IsString({ message: 'Le contact client est requis' })
  clientContact: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: "L'identifiant bookmaker doit être une chaîne de caractères" })
  bookmakerIdentifier?: string;

  @ApiProperty({ required: false, description: 'Référence SMS (dépôt) ou code retrait (retrait)' })
  @IsOptional()
  @IsString({ message: 'La référence doit être une chaîne de caractères' })
  referenceId?: string;
}

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: ORDER_STATES })
  @IsIn(ORDER_STATES)
  state: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  cancellationReason?: string;
}
