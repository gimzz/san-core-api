import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Autenticación y Seguridad')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: 'Registrar nuevo usuario',
    description:
      'Crea la entidad física (Persona) y la cuenta digital vinculada. No retorna token de sesión.',
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'Usuario y persona física registrados exitosamente en el sistema.',
  })
  @ApiResponse({
    status: 409,
    description: 'El correo electrónico suministrado ya se encuentra en uso.',
  })
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @ApiOperation({
    summary: 'Iniciar sesión',
    description:
      'Valida credenciales de acceso y genera el token de autenticación JWT (Bearer Token).',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Autenticación exitosa; retorna datos básicos del usuario y el token de acceso.',
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciales inválidas (usuario inexistente o contraseña incorrecta).',
  })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @ApiOperation({
    summary: 'Obtener datos de sesión',
    description:
      'Retorna el perfil digital del usuario autenticado extraído desde el token JWT activo.',
  })
  @ApiBearerAuth('access-token')
  @ApiResponse({
    status: 200,
    description: 'Datos de la cuenta digital recuperados exitosamente.',
  })
  @ApiResponse({
    status: 401,
    description: 'Token JWT ausente, expirado o con firma no autorizada.',
  })
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}