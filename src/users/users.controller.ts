import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { AddSocialProfileDto } from './dto/user.dto';

@ApiTags('Usuarios y Reputación')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({
    summary: 'Consultar mi perfil digital',
    description:
      'Retorna las credenciales públicas, el puntaje de reputación crediticia y las redes sociales vinculadas.',
  })
  @ApiResponse({ status: 200, description: 'Perfil de usuario devuelto con éxito.' })
  @ApiResponse({ status: 401, description: 'Sesión no autorizada o token inválido.' })
  @Get('me')
  getMyProfile(@Request() req) {
    return this.usersService.getMyProfile(req.user.id);
  }

  @ApiOperation({
    summary: 'Buscar usuario por nombre de usuario',
    description:
      'Permite ubicar a otro participante de la plataforma para verificar su reputación antes de agregarlo a un grupo.',
  })
  @ApiQuery({ name: 'username', example: 'juan.perez@example.com', description: 'Nombre de usuario o correo' })
  @ApiResponse({ status: 200, description: 'Usuario localizado exitosamente.' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  @Get('search')
  searchUser(@Query('username') username: string) {
    return this.usersService.searchByUsername(username);
  }

  @ApiOperation({
    summary: 'Vincular red social al perfil',
    description:
      'Registra un perfil social (Instagram, Facebook o X) para aumentar la confiabilidad comunitaria del usuario.',
  })
  @ApiBody({ type: AddSocialProfileDto })
  @ApiResponse({ status: 201, description: 'Perfil social vinculado satisfactoriamente.' })
  @ApiResponse({ status: 409, description: 'Esta cuenta social ya pertenece a otro usuario registrado.' })
  @Post('social-profiles')
  addSocialProfile(@Request() req, @Body() dto: AddSocialProfileDto) {
    return this.usersService.addSocialProfile(req.user.id, dto);
  }

  @ApiOperation({
    summary: 'Listar red de usuarios referidos',
    description:
      'Consulta las personas que se unieron a la plataforma mediante el enlace o código del usuario autenticado.',
  })
  @ApiResponse({ status: 200, description: 'Listado de usuarios referidos.' })
  @Get('my-referrals')
  getMyReferrals(@Request() req) {
    return this.usersService.getMyReferrals(req.user.id);
  }

  @ApiOperation({
  summary: 'Obtener mi código y datos de invitación',
  description:
    'Retorna el código de referido del usuario autenticado, mensaje listo para compartir por WhatsApp y el conteo de invitados.',
})
@ApiResponse({ status: 200, description: 'Datos de referido devueltos con éxito.' })
@Get('my-referral-code')
getReferralCode(@Request() req) {
  return this.usersService.getReferralInfo(req.user.id);
}
}