import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class CreateUserPaymentMethodDto {
  @ApiProperty({
    example: 1,
    description:
      'ID del tipo de método de pago (1: Pago Móvil, 2: Binance Pay, 3: Transferencia Bancaria, 4: Efectivo)',
  })
  @IsInt({ message: 'El tipo de método de pago debe ser un número entero' })
  @IsNotEmpty()
  idPaymentMethodType: number;

  @ApiProperty({
    example: '0105',
    description:
      'Código de la institución bancaria (requerido para Pago Móvil y Transferencia Bancaria)',
    required: false,
  })
  @IsString()
  @Length(4, 4, { message: 'El código bancario debe tener exactamente 4 dígitos' })
  @Matches(/^\d{4}$/, { message: 'El código bancario debe contener solo dígitos' })
  @IsOptional()
  bankCode?: string;

  @ApiProperty({
    example: '+584121234567',
    description: 'Número de teléfono asociado al Pago Móvil',
    required: false,
  })
  @IsString()
  @Length(7, 20, { message: 'El número de teléfono debe tener entre 7 y 20 caracteres' })
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({
    example: '01050012345678901234',
    description: 'Número de cuenta bancaria formal para transferencias directas',
    required: false,
  })
  @IsString()
  @Length(10, 30, { message: 'El número de cuenta debe tener entre 10 y 30 caracteres' })
  @IsOptional()
  accountNumber?: string;

  @ApiProperty({
    example: 'usuario@correo.com',
    description: 'Correo electrónico o identificador de billetera Binance Pay',
    required: false,
  })
  @IsString()
  @Length(3, 255, { message: 'La dirección de billetera debe tener entre 3 y 255 caracteres' })
  @IsOptional()
  walletAddress?: string;
}

export class UpdateUserPaymentMethodDto {
  @ApiProperty({
    example: '0102',
    description: 'Código de la institución bancaria',
    required: false,
  })
  @IsString()
  @Length(4, 4, { message: 'El código bancario debe tener exactamente 4 dígitos' })
  @Matches(/^\d{4}$/, { message: 'El código bancario debe contener solo dígitos' })
  @IsOptional()
  bankCode?: string;

  @ApiProperty({
    example: '+584161234567',
    description: 'Número de teléfono para Pago Móvil',
    required: false,
  })
  @IsString()
  @Length(7, 20, { message: 'El número de teléfono debe tener entre 7 y 20 caracteres' })
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({
    example: '01020034567891011121',
    description: 'Número de cuenta bancaria formal',
    required: false,
  })
  @IsString()
  @Length(10, 30, { message: 'El número de cuenta debe tener entre 10 y 30 caracteres' })
  @IsOptional()
  accountNumber?: string;

  @ApiProperty({
    example: 'otro@correo.com',
    description: 'Correo electrónico o identificador de billetera Binance Pay',
    required: false,
  })
  @IsString()
  @Length(3, 255, { message: 'La dirección de billetera debe tener entre 3 y 255 caracteres' })
  @IsOptional()
  walletAddress?: string;
}
