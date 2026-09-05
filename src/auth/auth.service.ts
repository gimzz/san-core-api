import {
  Injectable,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '../jwt/jwt.service';
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
import { TryCatch } from 'src/utils/try-catch.decorator';
import { HttpResponse } from 'src/utils/http-response.util';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
  ) { }

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

  @TryCatch()
  async register(dto: RegisterDto) {
    const existingUser = await this.usersService.findByUsername(dto.email);
    if (existingUser) {
      HttpResponse({ status: HttpStatus.CONFLICT, data: 'El correo ya se encuentra registrado' });
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
        HttpResponse({ status: HttpStatus.NOT_FOUND, data: 'Tipo de documento inválido' });
      }

      const existingDoc = await docRepo.findOne({
        where: { idDocumentType: dto.idDocumentType, documentNumber: dto.documentNumber },
      });
      if (existingDoc) {
        HttpResponse({ status: HttpStatus.CONFLICT, data: 'El número de documento ya está registrado por otro usuario' });
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
        data: {
          message: 'Registro completado exitosamente. Por favor inicia sesión.',
          userId: savedUser.id,
          referralCode: savedUser.referralCode,
        },
        status: HttpStatus.CREATED,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  @TryCatch()
  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByUsername(loginDto.email);
    if (!user) {
      HttpResponse({ status: HttpStatus.UNAUTHORIZED, data: 'Credenciales inválidas' });
    }

    // Verificar que la cuenta esté activa (soft delete)
    if (!user.isActive) {
      HttpResponse({ status: HttpStatus.UNAUTHORIZED, data: 'Esta cuenta ha sido desactivada' });
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!isPasswordValid) {
      HttpResponse({ status: HttpStatus.UNAUTHORIZED, data: 'Credenciales inválidas' });
    }

    const tokens = await this.jwtService.generateToken({ sub: user.id, username: user.username });

    return {
      data: {
        accessToken: tokens
      },
      status: HttpStatus.OK,
    };
  }

  @TryCatch()
  async refreshTokens(token: string) {
    const isVerify = await this.jwtService.verifyToken(token);
    if (!isVerify) {
      HttpResponse({
        status: HttpStatus.UNAUTHORIZED,
        data: 'Token de refresco inválido o expirado',
      });
    }

    const user = await this.usersService.findById(isVerify.sub);
    if (!user || !user.isActive) {
      HttpResponse({
        status: HttpStatus.UNAUTHORIZED,
        data: 'Token de refresco inválido o usuario desactivado',
      });
    }

    const tokens = await this.jwtService.generateToken({ sub: user.id, username: user.username });

    return {
      data: {
        accessToken: tokens
      },
      status: HttpStatus.OK,
    };
  }
}