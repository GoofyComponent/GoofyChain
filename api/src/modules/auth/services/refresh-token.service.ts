import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { RefreshToken } from '../entities/refresh-token.entity';

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async createRefreshToken(
    user: User,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<RefreshToken> {
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expire dans 7 jours

    const refreshToken = this.refreshTokenRepository.create({
      token,
      user,
      expiresAt,
      userAgent,
      ipAddress,
    });

    return this.refreshTokenRepository.save(refreshToken);
  }

  async findByToken(token: string): Promise<RefreshToken> {
    return this.refreshTokenRepository.findOne({
      where: { token },
      relations: ['user'],
    });
  }

  async revokeToken(token: string): Promise<void> {
    await this.refreshTokenRepository.update({ token }, { isRevoked: true });
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.refreshTokenRepository.update(
      { user: { id: userId } },
      { isRevoked: true },
    );
  }

  async deleteExpiredTokens(): Promise<void> {
    const now = new Date();
    await this.refreshTokenRepository
      .createQueryBuilder()
      .delete()
      .where('expiresAt < :now', { now })
      .orWhere('isRevoked = :revoked', { revoked: true })
      .execute();
  }

  async isTokenValid(token: string): Promise<boolean> {
    const refreshToken = await this.findByToken(token);
    if (!refreshToken) return false;

    const now = new Date();
    return !refreshToken.isRevoked && refreshToken.expiresAt > now;
  }
}
