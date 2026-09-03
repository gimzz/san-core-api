import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'juan.perez@example.com', description: 'Correo electrónico / usuario' })
  @IsEmail({}, { message: 'Debe ser un correo electrónico válido' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Password123!', minLength: 6, description: 'Contraseña de acceso' })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @ApiProperty({ example: 'Juan', description: 'Primer nombre' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Carlos', required: false, description: 'Segundo nombre (opcional)' })
  @IsString()
  @IsOptional()
  secondName?: string;

  @ApiProperty({ example: 'Pérez', description: 'Primer apellido' })
  @IsString()
  @IsNotEmpty()
  firstLastName: string;

  @ApiProperty({ example: 'Gómez', required: false, description: 'Segundo apellido (opcional)' })
  @IsString()
  @IsOptional()
  secondLastName?: string;

  @ApiProperty({ example: '1995-08-20', description: 'Fecha de nacimiento (YYYY-MM-DD)' })
  @IsDateString({}, { message: 'La fecha de nacimiento debe tener formato YYYY-MM-DD' })
  @IsNotEmpty()
  birthDate: string;

  @ApiProperty({ example: 1, description: 'ID del tipo de documento (1: Cédula, 2: Pasaporte, 3: RIF)' })
  @IsNumber()
  @IsNotEmpty()
  idDocumentType: number;

  @ApiProperty({ example: 'V-12345678', description: 'Número de documento de identidad' })
  @IsString()
  @IsNotEmpty()
  documentNumber: string;

  @ApiProperty({
    example: 'juan.invitador@example.com',
    required: false,
    description: 'Código de referido o correo del usuario que lo invitó a la plataforma',
  })
  @IsString()
  @IsOptional()
  referralCode?: string;
}