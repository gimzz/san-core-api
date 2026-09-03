import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class UpdatePersonProfileDto {
  @ApiProperty({ example: 'Juan' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Carlos', required: false })
  @IsString()
  @IsOptional()
  secondName?: string;

  @ApiProperty({ example: 'Pérez' })
  @IsString()
  @IsNotEmpty()
  firstLastName: string;

  @ApiProperty({ example: 'Gómez', required: false })
  @IsString()
  @IsOptional()
  secondLastName?: string;

  @ApiProperty({ example: '1995-08-20', description: 'Fecha de nacimiento (YYYY-MM-DD)' })
  @IsDateString({}, { message: 'La fecha debe tener formato YYYY-MM-DD' })
  @IsNotEmpty()
  birthDate: string;
}

export class AddDocumentDto {
  @ApiProperty({ example: 1, description: 'ID del tipo de documento (1: CEDULA, 2: PASAPORTE, 3: RIF)' })
  @IsNumber()
  @IsNotEmpty()
  idDocumentType: number;

  @ApiProperty({ example: 'V-12345678', description: 'Número de documento de identidad' })
  @IsString()
  @IsNotEmpty()
  documentNumber: string;
}

export class AddContactDto {
  @ApiProperty({ example: 1, description: 'ID del tipo de contacto (1: WHATSAPP, 2: TELEFONO_MOVIL, 3: EMAIL)' })
  @IsNumber()
  @IsNotEmpty()
  idContactType: number;

  @ApiProperty({
    example: '+584121234567',
    description: 'Valor del canal de contacto. Para teléfonos debe usar formato internacional E.164 (ej: +584121234567)',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+[1-9]\d{1,14}$/, {
    message: 'El contacto debe tener formato internacional E.164 (ej: +584121234567)',
  })
  contactValue: string;
}

export class AddAddressDto {
  @ApiProperty({ example: 'Av. Las Delicias, Residencias El Sol, Apto 4-B' })
  @IsString()
  @IsNotEmpty()
  streetAddress: string;

  @ApiProperty({ example: 'Maracay', required: false })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({ example: 'Aragua', required: false })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiProperty({ example: '2101', required: false })
  @IsString()
  @IsOptional()
  postalCode?: string;

  @ApiProperty({ example: 'Venezuela', required: false, description: 'País (por defecto: Venezuela)' })
  @IsString()
  @IsOptional()
  country?: string;
}