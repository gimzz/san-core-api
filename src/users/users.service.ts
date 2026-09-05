import {
  Injectable,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { UserSocialProfile } from '../auth/entities/user-social-profile.entity';
import { Referral } from '../auth/entities/referral.entity';
import { AddSocialProfileDto } from './dto/user.dto';
import { HttpResponse } from 'src/utils/http-response.util';
import { TryCatch } from 'src/utils/try-catch.decorator';

/**
 * Enmascara un correo electrónico para proteger la privacidad.
 * Ejemplo: "carlos@ejemplo.com" → "c***s@ejemplo.com"
 */
function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return email;

  if (local.length <= 2) {
    return `${local[0]}***@${domain}`;
  }

  return `${local[0]}***${local[local.length - 1]}@${domain}`;
}

/**
 * Calcula el estado de reputación dinámico basado en score y participaciones.
 */
function calculateReputationStatus(score: number, sampleSize: number) {
  if (sampleSize === 0) {
    return { status: 'UNRATED', label: 'Sin historial suficiente' };
  }
  if (score < 40) {
    return { status: 'DEFAULTED', label: 'Historial con incumplimientos críticos' };
  }
  if (sampleSize >= 5 && score >= 80) {
    return { status: 'TRUSTED', label: 'Usuario confiable con historial verificado' };
  }
  return { status: 'ACTIVE', label: 'Usuario activo en proceso de construir reputación' };
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserSocialProfile)
    private readonly socialProfileRepository: Repository<UserSocialProfile>,
    @InjectRepository(Referral)
    private readonly referralRepository: Repository<Referral>,
  ) {}

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { username } });
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  @TryCatch()
  async getMyProfile(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['person'],
    });

    if (!user) {
      HttpResponse({ status: HttpStatus.NOT_FOUND, data: 'Usuario no encontrado' });
    }

    const socialProfiles = await this.socialProfileRepository.find({
      where: { idUser: userId },
    });

    // Cálculo dinámico de reputación
    // sampleSize se calculará cuando existan las tablas de rondas/pagos
    // Por ahora, se usa 0 como valor de muestra (UNRATED)
    const sampleSize = 0;
    const reputationInfo = calculateReputationStatus(user.reputationScore, sampleSize);

    const { passwordHash, ...safeUser } = user;
    return {
      data: {
        ...safeUser,
        reputation: {
          score: user.reputationScore,
          sampleSize,
          status: reputationInfo.status,
          label: reputationInfo.label,
        },
        socialProfiles,
      },
      status: HttpStatus.OK,
    };
  }

  @TryCatch()
  async searchByUsername(username: string) {
    const user = await this.userRepository.findOne({
      where: { username },
      relations: ['person'],
    });

    if (!user) {
      HttpResponse({ status: HttpStatus.NOT_FOUND, data: `Usuario "${username}" no encontrado` });
    }

    // Cálculo dinámico de reputación para la búsqueda
    const sampleSize = 0;
    const reputationInfo = calculateReputationStatus(user.reputationScore, sampleSize);

    return {
      data: {
        id: user.id,
        maskedUsername: maskEmail(user.username),
        fullName: user.person
          ? `${user.person.firstName} ${user.person.firstLastName}`
          : 'Usuario Bolso',
        reputationStatus: reputationInfo.status,
      },
      status: HttpStatus.OK,
    };
  }

  @TryCatch()
  async addSocialProfile(userId: number, dto: AddSocialProfileDto) {
    const existing = await this.socialProfileRepository.findOne({
      where: {
        provider: dto.provider.toUpperCase(),
        providerUserId: dto.providerUserId,
      },
    });

    if (existing) {
      HttpResponse({ status: HttpStatus.CONFLICT, data: 'Este perfil social ya se encuentra vinculado' });
    }

    const profile = this.socialProfileRepository.create({
      idUser: userId,
      provider: dto.provider.toUpperCase(),
      providerUserId: dto.providerUserId,
      profileUrl: dto.profileUrl || null,
    });

    const saved = await this.socialProfileRepository.save(profile);
    return { data: saved, status: HttpStatus.CREATED };
  }

  @TryCatch()
  async getMyReferrals(userId: number) {
    const referrals = await this.referralRepository.find({
      where: { idReferrerUser: userId },
      relations: ['referredUser', 'referredUser.person'],
    });
    return { data: referrals, status: HttpStatus.OK };
  }

  @TryCatch()
  async getReferralInfo(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      HttpResponse({ status: HttpStatus.NOT_FOUND, data: 'Usuario no encontrado' });
    }

    const referralsCount = await this.referralRepository.count({
      where: { idReferrerUser: userId },
    });

    return {
      data: {
        referralCode: user.referralCode,
        shareMessage: `¡Hola! Únete a Bolso App para ahorrar en grupo sin riesgos. Regístrate usando mi código: ${user.referralCode}`,
        totalReferrals: referralsCount,
      },
      status: HttpStatus.OK,
    };
  }
}