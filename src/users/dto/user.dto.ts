import { ApiProperty } from "@nestjs/swagger";
import {IsNotEmpty, IsString, IsOptional, IsUrl} from "class-validator";

export class AddSocialProfileDto{
    @ApiProperty({
        example:'INSTAGRAM',
        description:'Nombre de la red social o proveedor (ej: Instagram, Facebook, X, Linkdin)',
    })

    @IsString()
    @IsNotEmpty({message: 'El nombre del proveedor es obligatorio'})
    provider: string;

    @ApiProperty({
        example:'usuario_bolso',
        description:'Identificador único, usuario o handle en la red social.',
    })

    @IsString()
    @IsNotEmpty({message:'El ID o handle de usuario es obligatorio'})
    providerUserId: string;

    @ApiProperty({
    example: 'https://instagram.com/usuario_bolso',
    required: false,
    description: 'Enlace web directo al perfil público',
  })
  @IsUrl({}, { message: 'Debe ser una URL válida' })
  @IsOptional()
  profileUrl?: string;
        
}