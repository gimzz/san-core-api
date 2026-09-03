import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { UserSocialProfile } from '../auth/entities/user-social-profile.entity';
import { Referral } from '../auth/entities/referral.entity';
import { AddSocialProfileDto } from './dto/user.dto';

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

  
  async getMyProfile(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['person'],
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const socialProfiles = await this.socialProfileRepository.find({
      where: { idUser: userId },
    });

    const { passwordHash, ...safeUser } = user;
    return {
      ...safeUser,
      socialProfiles,
    };
  }

  async searchByUsername(username: string) {
  const user = await this.userRepository.findOne({
    where: { username },
    relations: ['person'],
  });

  if (!user) {
    throw new NotFoundException(`Usuario "${username}" no encontrado`);
  }

  return {
    id: user.id,
    username: user.username,
    reputationScore: user.reputationScore,
    fullName: user.person
      ? `${user.person.firstName} ${user.person.firstLastName}`
      : 'Usuario Bolso',
  };
}

  async addSocialProfile(userId: number, dto: AddSocialProfileDto) {
    const existing = await this.socialProfileRepository.findOne({
      where: {
        provider: dto.provider.toUpperCase(),
        providerUserId: dto.providerUserId,
      },
    });

    if (existing) {
      throw new ConflictException('Este perfil social ya se encuentra vinculado');
    }

    const profile = this.socialProfileRepository.create({
      idUser: userId,
      provider: dto.provider.toUpperCase(),
      providerUserId: dto.providerUserId,
      profileUrl: dto.profileUrl || null,
    });

    return this.socialProfileRepository.save(profile);
  }

  
  async getMyReferrals(userId: number) {
    return this.referralRepository.find({
      where: { idReferrerUser: userId },
      relations: ['referredUser', 'referredUser.person'],
    });
  }

  async getReferralInfo(userId: number) {
  const user = await this.userRepository.findOne({ where: { id: userId } });
  if (!user) {
    throw new NotFoundException('Usuario no encontrado');
  }

  const referralsCount = await this.referralRepository.count({
    where: { idReferrerUser: userId },
  });

  return {
    referralCode: user.username,
    shareMessage: `¡Hola! Únete a Bolso App para ahorrar en grupo sin riesgos. Regístrate usando mi código: ${user.username}`,
    totalReferrals: referralsCount,
  };
}
}