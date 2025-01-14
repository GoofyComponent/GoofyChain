import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getWallets(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      // select: ['wallets'],
    });
    return user;
  }

  async updateWallets(userId: string, addresses: string[]) {
    await this.userRepository.update(userId, { wallets: addresses });
    return { message: 'Wallets mis à jour avec succès' };
  }

  async getProfileData(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'email', 'wallets', 'createdAt', 'updatedAt'],
    });
    return user;
  }
}
