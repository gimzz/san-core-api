import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { Person } from '../core/entities/person.entity';
import { PersonDocument } from '../core/entities/person-document.entity';
import { DocumentType } from '../core/entities/document-type.entity';
import { User } from './entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource,
  ) {}

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

      const hashedPassword = await bcrypt.hash(dto.password, 10);
      const newUser = userRepo.create({
        idPerson: savedPerson.id,
        username: dto.email,
        passwordHash: hashedPassword,
      });
      await userRepo.save(newUser);

      await queryRunner.commitTransaction();

      return {
        message: 'Registro completado exitosamente. Por favor inicia sesión.',
        userId: newUser.id,
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

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const token = await this.jwtService.signAsync({
      sub: user.id,
      email: user.username,
    });

    const { passwordHash, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      access_token: token,
    };
  }
}