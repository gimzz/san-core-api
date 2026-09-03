import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { Person } from '../core/entities/person.entity';
import { PersonDocument } from '../core/entities/person-document.entity';
import { DocumentType } from '../core/entities/document-type.entity';
import { User } from './entities/user.entity';
import { Referral } from './entities/referral.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Genera un código de referido alfanumérico único (ej: BOLSO-K9F2).
   */
  private generateReferralCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let slug = '';
    for (let i = 0; i < 4; i++) {
      slug += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `BOLSO-${slug}`;
  }

  /**
   * Genera la pareja de tokens (access + refresh).
   */
  private async generateTokenPair(userId: number, email: string) {
    const payload = { sub: userId, email };

    const accessToken = await this.jwtService.signAsync(payload);

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET', 'bolso_jwt_refresh_secret_key_2026_custom'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    return { accessToken, refreshToken };
  }

  async register(dto: RegisterDto) {
    const existingUser = await this.usersService.findByUsername(dto.email);
    if (existingUser) {
      throw new ConflictException('El correo ya se encuentra registrado');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const personRepo = queryRunner.manager.getRepository(Person);
      const docRepo = queryRunner.manager.getRepository(PersonDocument);
      const docTypeRepo = queryRunner.manager.getRepository(DocumentType);
      const userRepo = queryRunner.manager.getRepository(User);
      const referralRepo = queryRunner.manager.getRepository(Referral);

      const docType = await docTypeRepo.findOne({ where: { id: dto.idDocumentType } });
      if (!docType) {
        throw new NotFoundException('Tipo de documento inválido');
      }

      const existingDoc = await docRepo.findOne({
        where: { idDocumentType: dto.idDocumentType, documentNumber: dto.documentNumber },
      });
      if (existingDoc) {
        throw new ConflictException('El número de documento ya está registrado por otro usuario');
      }

      const newPerson = personRepo.create({
        firstName: dto.firstName,
        secondName: dto.secondName || null,
        firstLastName: dto.firstLastName,
        secondLastName: dto.secondLastName || null,
        birthDate: dto.birthDate,
      });
      const savedPerson = await personRepo.save(newPerson);

      const newDocument = docRepo.create({
        idPerson: savedPerson.id,
        idDocumentType: dto.idDocumentType,
        documentNumber: dto.documentNumber,
      });
      await docRepo.save(newDocument);

      // Generar código de referido único
      let referralCode: string;
      let codeExists = true;
      while (codeExists) {
        referralCode = this.generateReferralCode();
        const existing = await userRepo.findOne({ where: { referralCode } });
        codeExists = !!existing;
      }

      const hashedPassword = await bcrypt.hash(dto.password, 10);
      const newUser = userRepo.create({
        idPerson: savedPerson.id,
        username: dto.email,
        passwordHash: hashedPassword,
        referralCode,
      });
      const savedUser = await userRepo.save(newUser);

      // Procesar referido: buscar por código alfanumérico
      if (dto.referralCode) {
        const referrer = await userRepo.findOne({
          where: { referralCode: dto.referralCode.trim().toUpperCase() },
        });

        if (referrer && referrer.id !== savedUser.id) {
          const referralRecord = referralRepo.create({
            idReferrerUser: referrer.id,
            idReferredUser: savedUser.id,
            status: 'COMPLETED',
          });
          await referralRepo.save(referralRecord);
        }
      }

      await queryRunner.commitTransaction();

      return {
        message: 'Registro completado exitosamente. Por favor inicia sesión.',
        userId: savedUser.id,
        referralCode: savedUser.referralCode,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByUsername(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar que la cuenta esté activa (soft delete)
    if (!user.isActive) {
      throw new UnauthorizedException('Esta cuenta ha sido desactivada');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const tokens = await this.generateTokenPair(user.id, user.username);

    const { passwordHash, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async refreshTokens(dto: RefreshTokenDto) {
    try {
      const payload = await this.jwtService.verifyAsync(dto.refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET', 'bolso_jwt_refresh_secret_key_2026_custom'),
      });

      const user = await this.usersService.findById(payload.sub);
      if (!user || !user.isActive) {
        throw new UnauthorizedException('Token de refresco inválido o usuario desactivado');
      }

      const tokens = await this.generateTokenPair(user.id, user.username);

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Token de refresco inválido o expirado');
    }
  }
}