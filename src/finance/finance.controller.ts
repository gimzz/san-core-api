import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
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
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FinanceService } from './finance.service';
import { CreateUserPaymentMethodDto, UpdateUserPaymentMethodDto } from './dto/finance.dto';

@ApiTags('Finanzas y Métodos de Pago')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  // ─────────────────────────────────────────────
  // CATÁLOGOS
  // ─────────────────────────────────────────────

  @ApiOperation({
    summary: 'Listar catálogo de divisas',
    description:
      'Retorna las monedas soportadas por el sistema (USD, VES, USDT) para operaciones multimoneda.',
  })
  @ApiResponse({
    status: 200,
    description: 'Catálogo de divisas recuperado exitosamente.',
  })
  @Get('currencies')
  getCurrencies() {
    return this.financeService.getCurrencies();
  }

  @ApiOperation({
    summary: 'Listar catálogo de tipos de método de pago',
    description:
      'Retorna las pasarelas de pago habilitadas en el sistema (Pago Móvil, Binance Pay, Transferencia Bancaria, Efectivo).',
  })
  @ApiResponse({
    status: 200,
    description: 'Catálogo de métodos de pago recuperado exitosamente.',
  })
  @Get('payment-method-types')
  getPaymentMethodTypes() {
    return this.financeService.getPaymentMethodTypes();
  }

  @ApiOperation({
    summary: 'Listar catálogo de bancos nacionales autorizados',
    description:
      'Retorna el listado maestro de instituciones bancarias autorizadas por SUDEBAN con sus códigos oficiales (ej: 0102 - Banco de Venezuela).',
  })
  @ApiResponse({
    status: 200,
    description: 'Catálogo de bancos recuperado exitosamente.',
  })
  @Get('banks')
  getBanks() {
    return this.financeService.getBanks();
  }

  // ─────────────────────────────────────────────
  // MÉTODOS DE PAGO DEL USUARIO
  // ─────────────────────────────────────────────

  @ApiOperation({
    summary: 'Listar mis métodos de cobro',
    description:
      'Retorna todas las cuentas bancarias, Pago Móvil o billeteras Binance Pay registradas por el usuario autenticado.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de métodos de cobro del usuario recuperada exitosamente.',
  })
  @Get('my-payment-methods')
  getMyPaymentMethods(@Request() req) {
    return this.financeService.getMyPaymentMethods(req.user.id);
  }

  @ApiOperation({
    summary: 'Obtener método de cobro por ID',
    description:
      'Retorna el detalle de un método de cobro específico del usuario autenticado. Solo el propietario puede consultarlo.',
  })
  @ApiParam({ name: 'id', description: 'ID del método de cobro a consultar', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Método de cobro recuperado exitosamente.',
  })
  @ApiResponse({
    status: 403,
    description: 'No tienes permiso para consultar este método de pago.',
  })
  @ApiResponse({
    status: 404,
    description: 'Método de cobro no encontrado.',
  })
  @Get('my-payment-methods/:id')
  getPaymentMethodById(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.financeService.getPaymentMethodById(req.user.id, id);
  }

  @ApiOperation({
    summary: 'Registrar nuevo método de cobro',
    description:
      'Agrega una cuenta de Pago Móvil, transferencia bancaria o billetera Binance Pay al perfil del usuario autenticado. Máximo 3 cuentas por tipo. El código bancario se valida contra el catálogo de bancos autorizados.',
  })
  @ApiBody({ type: CreateUserPaymentMethodDto })
  @ApiResponse({
    status: 201,
    description: 'Método de cobro registrado exitosamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'Campos requeridos faltantes, código bancario no autorizado, o límite de 3 métodos por tipo alcanzado.',
  })
  @ApiResponse({
    status: 404,
    description: 'Tipo de método de pago no encontrado en el catálogo.',
  })
  @Post('my-payment-methods')
  createPaymentMethod(@Request() req, @Body() dto: CreateUserPaymentMethodDto) {
    return this.financeService.createPaymentMethod(req.user.id, dto);
  }

  @ApiOperation({
    summary: 'Actualizar método de cobro',
    description:
      'Modifica los datos de un método de cobro existente del usuario autenticado. Solo el propietario puede editarlo.',
  })
  @ApiParam({ name: 'id', description: 'ID del método de cobro a actualizar', example: 1 })
  @ApiBody({ type: UpdateUserPaymentMethodDto })
  @ApiResponse({
    status: 200,
    description: 'Método de cobro actualizado exitosamente.',
  })
  @ApiResponse({
    status: 403,
    description: 'No tienes permiso para modificar este método de pago.',
  })
  @ApiResponse({
    status: 404,
    description: 'Método de cobro no encontrado.',
  })
  @Put('my-payment-methods/:id')
  updatePaymentMethod(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserPaymentMethodDto,
  ) {
    return this.financeService.updatePaymentMethod(req.user.id, id, dto);
  }

  @ApiOperation({
    summary: 'Eliminar método de cobro',
    description:
      'Elimina permanentemente un método de cobro del perfil del usuario autenticado. Solo el propietario puede eliminarlo.',
  })
  @ApiParam({ name: 'id', description: 'ID del método de cobro a eliminar', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Método de cobro eliminado exitosamente.',
  })
  @ApiResponse({
    status: 403,
    description: 'No tienes permiso para eliminar este método de pago.',
  })
  @ApiResponse({
    status: 404,
    description: 'Método de cobro no encontrado.',
  })
  @HttpCode(HttpStatus.OK)
  @Delete('my-payment-methods/:id')
  deletePaymentMethod(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.financeService.deletePaymentMethod(req.user.id, id);
  }
}
