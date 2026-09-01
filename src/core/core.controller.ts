import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CoreService } from './core.service';
import {
  UpdatePersonProfileDto,
  AddDocumentDto,
  AddContactDto,
  AddAddressDto,
} from './dto/core.dto';

@ApiTags('Identidad y KYC (Core)')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('core')
export class CoreController {
  constructor(private readonly coreService: CoreService) {}

  @ApiOperation({
    summary: 'Consultar expediente KYC unificado',
    description:
      'Obtiene el perfil biográfico completo de la persona, incluyendo sus documentos, canales de contacto y domicilios.',
  })
  @ApiResponse({
    status: 200,
    description: 'Expediente de identidad recuperado correctamente.',
  })
  @ApiResponse({
    status: 404,
    description: 'No se encontró la persona física asociada al usuario.',
  })
  @Get('profile')
  getProfile(@Request() req) {
    return this.coreService.getPersonFullProfile(req.user.idPerson);
  }

  @ApiOperation({
    summary: 'Actualizar datos biográficos',
    description:
      'Permite modificar nombres, apellidos y registrar la fecha de nacimiento de la persona física.',
  })
  @ApiBody({ type: UpdatePersonProfileDto })
  @ApiResponse({
    status: 200,
    description: 'Datos biográficos actualizados exitosamente.',
  })
  @Put('person/profile')
  updateProfile(@Request() req, @Body() dto: UpdatePersonProfileDto) {
    return this.coreService.updateProfile(req.user.idPerson, dto);
  }

  @ApiOperation({
    summary: 'Registrar documento de identidad',
    description:
      'Asocia un documento oficial (Cédula, Pasaporte, RIF) validando la unicidad del número registrado.',
  })
  @ApiBody({ type: AddDocumentDto })
  @ApiResponse({
    status: 201,
    description: 'Documento registrado y vinculado exitosamente.',
  })
  @ApiResponse({
    status: 409,
    description: 'Este número de documento ya está registrado por otro individuo.',
  })
  @Post('documents')
  addDocument(@Request() req, @Body() dto: AddDocumentDto) {
    return this.coreService.addDocument(req.user.idPerson, dto);
  }

  @ApiOperation({
    summary: 'Registrar canal de comunicación',
    description:
      'Agrega una vía de contacto para notificaciones y cobranza (WhatsApp, Teléfono móvil o Correo electrónico).',
  })
  @ApiBody({ type: AddContactDto })
  @ApiResponse({
    status: 201,
    description: 'Canal de contacto agregado satisfactoriamente.',
  })
  @Post('contacts')
  addContact(@Request() req, @Body() dto: AddContactDto) {
    return this.coreService.addContact(req.user.idPerson, dto);
  }

  @ApiOperation({
    summary: 'Registrar dirección domiciliaria',
    description:
      'Guarda la ubicación física y dirección residencial de la persona física.',
  })
  @ApiBody({ type: AddAddressDto })
  @ApiResponse({
    status: 201,
    description: 'Dirección física registrada satisfactoriamente.',
  })
  @Post('addresses')
  addAddress(@Request() req, @Body() dto: AddAddressDto) {
    return this.coreService.addAddress(req.user.idPerson, dto);
  }

  @ApiOperation({
    summary: 'Listar catálogo de tipos de documento',
    description:
      'Retorna las opciones oficiales disponibles para registrar identificaciones (Cédula, Pasaporte, RIF).',
  })
  @ApiResponse({
    status: 200,
    description: 'Catálogo de tipos de documento recuperado.',
  })
  @Get('document-types')
  getDocumentTypes() {
    return this.coreService.getDocumentTypes();
  }

  @ApiOperation({
    summary: 'Listar catálogo de tipos de contacto',
    description:
      'Retorna los canales de comunicación admitidos por el sistema (WhatsApp, Teléfono, Correo).',
  })
  @ApiResponse({
    status: 200,
    description: 'Catálogo de tipos de contacto recuperado.',
  })
  @Get('contact-types')
  getContactTypes() {
    return this.coreService.getContactTypes();
  }
}