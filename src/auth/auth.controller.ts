import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Autenticación y Seguridad')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @ApiOperation({
    summary: 'Registrar nuevo usuario',
    description:
      'Crea la entidad física (Persona) y la cuenta digital vinculada. Valida mayoría de edad (≥18 años) y genera código de referido alfanumérico único.',
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'Usuario y persona física registrados exitosamente en el sistema.',
  })
  @ApiResponse({
    status: 400,
    description: 'El usuario debe ser mayor de 18 años para operar en la plataforma.',
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
      'Valida credenciales de acceso y genera la pareja de tokens JWT (accessToken de corta vida + refreshToken de larga vida). Protegido con rate limiting: máximo 5 intentos cada 60 segundos.',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Autenticación exitosa; retorna datos del usuario, accessToken y refreshToken.',
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciales inválidas (usuario inexistente, contraseña incorrecta o cuenta desactivada).',
  })
  @ApiResponse({
    status: 429,
    description: 'Demasiados intentos de inicio de sesión. Intente de nuevo más tarde.',
  })
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }

  @ApiOperation({
    summary: 'Renovar tokens de sesión',
    description:
      'Valida el refresh token proporcionado y re-emite una nueva pareja de tokens (access + refresh) sin solicitar credenciales.',
  })
  @ApiResponse({
    status: 200,
    description: 'Tokens renovados exitosamente.',
  })
  @ApiResponse({
    status: 401,
    description: 'Refresh token inválido, expirado o usuario desactivado.',
  })
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  async refreshTokens(@Req() req: any) {
    const authorization = req.headers.authorization;
    const token = authorization.split(' ')[1];
    return await this.authService.refreshTokens(token);
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