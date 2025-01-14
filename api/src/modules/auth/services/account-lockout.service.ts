import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class AccountLockoutService {
  private readonly MAX_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes en millisecondes

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async recordFailedAttempt(email: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) return false;

    user.loginAttempts = (user.loginAttempts || 0) + 1;

    if (user.loginAttempts >= this.MAX_ATTEMPTS) {
      user.lockedUntil = new Date(Date.now() + this.LOCKOUT_DURATION);
    }

    await this.userRepository.save(user);
    return user.loginAttempts >= this.MAX_ATTEMPTS;
  }

  async isAccountLocked(email: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) return false;

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return true;
    }

    // Si le verrou est expiré, réinitialiser les tentatives
    if (user.lockedUntil && user.lockedUntil <= new Date()) {
      user.loginAttempts = 0;
      user.lockedUntil = null;
      await this.userRepository.save(user);
    }

    return false;
  }

  async resetAttempts(email: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user) {
      user.loginAttempts = 0;
      user.lockedUntil = null;
      await this.userRepository.save(user);
    }
  }
}
