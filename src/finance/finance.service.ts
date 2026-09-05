import {
  Injectable,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Currency } from './entities/currency.entity';
import { PaymentMethodType } from './entities/payment-method-type.entity';
import { UserPaymentMethod } from './entities/user-payment-method.entity';
import { Bank } from './entities/bank.entity';
import { CreateUserPaymentMethodDto, UpdateUserPaymentMethodDto } from './dto/finance.dto';
import { HttpResponse } from 'src/utils/http-response.util';
import { TryCatch } from 'src/utils/try-catch.decorator';

@Injectable()
export class FinanceService {
  constructor(
    @InjectRepository(Currency)
    private readonly currencyRepository: Repository<Currency>,

    @InjectRepository(PaymentMethodType)
    private readonly paymentMethodTypeRepository: Repository<PaymentMethodType>,

    @InjectRepository(UserPaymentMethod)
    private readonly userPaymentMethodRepository: Repository<UserPaymentMethod>,

    @InjectRepository(Bank)
    private readonly bankRepository: Repository<Bank>,
  ) {}

  // ─────────────────────────────────────────────
  // CATÁLOGOS (lectura pública)
  // ─────────────────────────────────────────────

  @TryCatch()
  async getCurrencies() {
    const currencies = await this.currencyRepository.find();
    return { data: currencies, status: HttpStatus.OK };
  }

  @TryCatch()
  async getPaymentMethodTypes() {
    const types = await this.paymentMethodTypeRepository.find();
    return { data: types, status: HttpStatus.OK };
  }

  @TryCatch()
  async getBanks() {
    const banks = await this.bankRepository.find({ order: { code: 'ASC' } });
    return { data: banks, status: HttpStatus.OK };
  }

  // ─────────────────────────────────────────────
  // MÉTODOS DE PAGO DEL USUARIO (CRUD autenticado)
  // ─────────────────────────────────────────────

  @TryCatch()
  async getMyPaymentMethods(userId: number) {
    const methods = await this.userPaymentMethodRepository.find({
      where: { idUser: userId },
      relations: ['paymentMethodType'],
    });
    return { data: methods, status: HttpStatus.OK };
  }

  @TryCatch()
  async getPaymentMethodById(userId: number, id: number) {
    const method = await this.findOwnedPaymentMethod(userId, id);
    return { data: method, status: HttpStatus.OK };
  }

  @TryCatch()
  async createPaymentMethod(
    userId: number,
    dto: CreateUserPaymentMethodDto,
  ) {
    // Validar que el tipo de método existe en el catálogo
    const methodType = await this.paymentMethodTypeRepository.findOne({
      where: { id: dto.idPaymentMethodType },
    });
    if (!methodType) {
      HttpResponse({
        status: HttpStatus.NOT_FOUND,
        data: `Tipo de método de pago con ID ${dto.idPaymentMethodType} no encontrado en el catálogo`,
      });
    }

    // Validación de campos requeridos según el tipo de método
    this.validateFieldsByMethodType(methodType.name, dto);

    // Validar que el código bancario exista en el catálogo de bancos (cuando aplica)
    if (dto.bankCode) {
      const bank = await this.bankRepository.findOne({
        where: { code: dto.bankCode },
      });
      if (!bank) {
        HttpResponse({
          status: HttpStatus.BAD_REQUEST,
          data: `El código bancario '${dto.bankCode}' no corresponde a ningún banco autorizado en el catálogo`,
        });
      }
    }

    // Validar límite de máximo 3 métodos por tipo por usuario
    const existingCount = await this.userPaymentMethodRepository.count({
      where: {
        idUser: userId,
        idPaymentMethodType: dto.idPaymentMethodType,
      },
    });
    if (existingCount >= 3) {
      HttpResponse({
        status: HttpStatus.BAD_REQUEST,
        data: `Ya tienes el máximo de 3 métodos de pago registrados para el tipo "${methodType.name}". Elimina uno existente para agregar otro.`,
      });
    }

    const paymentMethod = this.userPaymentMethodRepository.create({
      idUser: userId,
      idPaymentMethodType: dto.idPaymentMethodType,
      bankCode: dto.bankCode ?? null,
      phoneNumber: dto.phoneNumber ?? null,
      accountNumber: dto.accountNumber ?? null,
      walletAddress: dto.walletAddress ?? null,
    });

    const saved = await this.userPaymentMethodRepository.save(paymentMethod);
    return { data: saved, status: HttpStatus.CREATED };
  }

  @TryCatch()
  async updatePaymentMethod(
    userId: number,
    id: number,
    dto: UpdateUserPaymentMethodDto,
  ) {
    const paymentMethod = await this.findOwnedPaymentMethod(userId, id);

    // Validar código bancario si se está actualizando
    if (dto.bankCode !== undefined) {
      const bank = await this.bankRepository.findOne({
        where: { code: dto.bankCode },
      });
      if (!bank) {
        HttpResponse({
          status: HttpStatus.BAD_REQUEST,
          data: `El código bancario '${dto.bankCode}' no corresponde a ningún banco autorizado en el catálogo`,
        });
      }
      paymentMethod.bankCode = dto.bankCode;
    }

    if (dto.phoneNumber !== undefined) paymentMethod.phoneNumber = dto.phoneNumber;
    if (dto.accountNumber !== undefined) paymentMethod.accountNumber = dto.accountNumber;
    if (dto.walletAddress !== undefined) paymentMethod.walletAddress = dto.walletAddress;

    const saved = await this.userPaymentMethodRepository.save(paymentMethod);
    return { data: saved, status: HttpStatus.OK };
  }

  @TryCatch()
  async deletePaymentMethod(userId: number, id: number) {
    const paymentMethod = await this.findOwnedPaymentMethod(userId, id);
    await this.userPaymentMethodRepository.remove(paymentMethod);
    return { data: 'Método de pago eliminado exitosamente', type: 'success' as const, status: HttpStatus.OK };
  }

  // ─────────────────────────────────────────────
  // HELPERS PRIVADOS
  // ─────────────────────────────────────────────

  /**
   * Verifica que el método de pago exista y pertenezca al usuario autenticado.
   * Lanza HttpResponse NOT_FOUND si no existe, FORBIDDEN si no es del usuario.
   */
  private async findOwnedPaymentMethod(
    userId: number,
    id: number,
  ): Promise<UserPaymentMethod> {
    const paymentMethod = await this.userPaymentMethodRepository.findOne({
      where: { id },
      relations: ['paymentMethodType'],
    });

    if (!paymentMethod) {
      HttpResponse({ status: HttpStatus.NOT_FOUND, data: `Método de pago con ID ${id} no encontrado` });
    }

    if (paymentMethod.idUser !== userId) {
      HttpResponse({ status: HttpStatus.FORBIDDEN, data: 'No tienes permiso para modificar este método de pago' });
    }

    return paymentMethod;
  }

  /**
   * Valida que se hayan proporcionado los campos correctos según el tipo de método de pago.
   * Las validaciones se basan en el nombre normalizado del tipo (en mayúsculas).
   */
  private validateFieldsByMethodType(
    methodTypeName: string,
    dto: CreateUserPaymentMethodDto,
  ): void {
    const name = methodTypeName.toUpperCase();

    if (name.includes('MOVIL') || name.includes('MÓVIL') || name.includes('PAGO_MOVIL')) {
      // Pago Móvil: requiere banco y teléfono
      if (!dto.bankCode) {
        HttpResponse({
          status: HttpStatus.BAD_REQUEST,
          data: 'El código bancario (bankCode) es requerido para Pago Móvil',
        });
      }
      if (!dto.phoneNumber) {
        HttpResponse({
          status: HttpStatus.BAD_REQUEST,
          data: 'El número de teléfono (phoneNumber) es requerido para Pago Móvil',
        });
      }
    } else if (name.includes('TRANSFERENCIA') || name.includes('BANCARIA')) {
      // Transferencia Bancaria: requiere banco y número de cuenta
      if (!dto.bankCode) {
        HttpResponse({
          status: HttpStatus.BAD_REQUEST,
          data: 'El código bancario (bankCode) es requerido para Transferencia Bancaria',
        });
      }
      if (!dto.accountNumber) {
        HttpResponse({
          status: HttpStatus.BAD_REQUEST,
          data: 'El número de cuenta (accountNumber) es requerido para Transferencia Bancaria',
        });
      }
    } else if (name.includes('BINANCE')) {
      // Binance Pay: requiere correo o dirección de billetera
      if (!dto.walletAddress) {
        HttpResponse({
          status: HttpStatus.BAD_REQUEST,
          data: 'La dirección de billetera o correo (walletAddress) es requerida para Binance Pay',
        });
      }
    }
    // Efectivo: no requiere campos adicionales
  }
}
