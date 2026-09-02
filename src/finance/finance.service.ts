import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Currency } from './entities/currency.entity';
import { PaymentMethodType } from './entities/payment-method-type.entity';
import { UserPaymentMethod } from './entities/user-payment-method.entity';
import { CreateUserPaymentMethodDto, UpdateUserPaymentMethodDto } from './dto/finance.dto';

@Injectable()
export class FinanceService {
  constructor(
    @InjectRepository(Currency)
    private readonly currencyRepository: Repository<Currency>,

    @InjectRepository(PaymentMethodType)
    private readonly paymentMethodTypeRepository: Repository<PaymentMethodType>,

    @InjectRepository(UserPaymentMethod)
    private readonly userPaymentMethodRepository: Repository<UserPaymentMethod>,
  ) {}

  // ─────────────────────────────────────────────
  // CATÁLOGOS (lectura pública)
  // ─────────────────────────────────────────────

  async getCurrencies(): Promise<Currency[]> {
    return this.currencyRepository.find();
  }

  async getPaymentMethodTypes(): Promise<PaymentMethodType[]> {
    return this.paymentMethodTypeRepository.find();
  }

  // ─────────────────────────────────────────────
  // MÉTODOS DE PAGO DEL USUARIO (CRUD autenticado)
  // ─────────────────────────────────────────────

  async getMyPaymentMethods(userId: number): Promise<UserPaymentMethod[]> {
    return this.userPaymentMethodRepository.find({
      where: { idUser: userId },
      relations: ['paymentMethodType'],
    });
  }

  async createPaymentMethod(
    userId: number,
    dto: CreateUserPaymentMethodDto,
  ): Promise<UserPaymentMethod> {
    // Validar que el tipo de método existe en el catálogo
    const methodType = await this.paymentMethodTypeRepository.findOne({
      where: { id: dto.idPaymentMethodType },
    });
    if (!methodType) {
      throw new NotFoundException(
        `Tipo de método de pago con ID ${dto.idPaymentMethodType} no encontrado en el catálogo`,
      );
    }

    // Validación de campos requeridos según el tipo de método
    this.validateFieldsByMethodType(methodType.name, dto);

    const paymentMethod = this.userPaymentMethodRepository.create({
      idUser: userId,
      idPaymentMethodType: dto.idPaymentMethodType,
      bankCode: dto.bankCode ?? null,
      phoneNumber: dto.phoneNumber ?? null,
      accountNumber: dto.accountNumber ?? null,
      walletAddress: dto.walletAddress ?? null,
    });

    return this.userPaymentMethodRepository.save(paymentMethod);
  }

  async updatePaymentMethod(
    userId: number,
    id: number,
    dto: UpdateUserPaymentMethodDto,
  ): Promise<UserPaymentMethod> {
    const paymentMethod = await this.findOwnedPaymentMethod(userId, id);

    if (dto.bankCode !== undefined) paymentMethod.bankCode = dto.bankCode;
    if (dto.phoneNumber !== undefined) paymentMethod.phoneNumber = dto.phoneNumber;
    if (dto.accountNumber !== undefined) paymentMethod.accountNumber = dto.accountNumber;
    if (dto.walletAddress !== undefined) paymentMethod.walletAddress = dto.walletAddress;

    return this.userPaymentMethodRepository.save(paymentMethod);
  }

  async deletePaymentMethod(userId: number, id: number): Promise<{ message: string }> {
    const paymentMethod = await this.findOwnedPaymentMethod(userId, id);
    await this.userPaymentMethodRepository.remove(paymentMethod);
    return { message: 'Método de pago eliminado exitosamente' };
  }

  // ─────────────────────────────────────────────
  // HELPERS PRIVADOS
  // ─────────────────────────────────────────────

  /**
   * Verifica que el método de pago exista y pertenezca al usuario autenticado.
   * Lanza NotFoundException si no existe, ForbiddenException si no es del usuario.
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
      throw new NotFoundException(`Método de pago con ID ${id} no encontrado`);
    }

    if (paymentMethod.idUser !== userId) {
      throw new ForbiddenException('No tienes permiso para modificar este método de pago');
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
        throw new BadRequestException(
          'El código bancario (bankCode) es requerido para Pago Móvil',
        );
      }
      if (!dto.phoneNumber) {
        throw new BadRequestException(
          'El número de teléfono (phoneNumber) es requerido para Pago Móvil',
        );
      }
    } else if (name.includes('TRANSFERENCIA') || name.includes('BANCARIA')) {
      // Transferencia Bancaria: requiere banco y número de cuenta
      if (!dto.bankCode) {
        throw new BadRequestException(
          'El código bancario (bankCode) es requerido para Transferencia Bancaria',
        );
      }
      if (!dto.accountNumber) {
        throw new BadRequestException(
          'El número de cuenta (accountNumber) es requerido para Transferencia Bancaria',
        );
      }
    } else if (name.includes('BINANCE')) {
      // Binance Pay: requiere correo o dirección de billetera
      if (!dto.walletAddress) {
        throw new BadRequestException(
          'La dirección de billetera o correo (walletAddress) es requerida para Binance Pay',
        );
      }
    }
    // Efectivo: no requiere campos adicionales
  }
}
