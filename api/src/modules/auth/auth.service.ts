import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { MailService } from '../mail/mail.service';
import { UsersService } from '../users/users.service';
import { RegisterDto, TokenResponse } from './dto/auth.dto';
import { AccountLockoutService } from './services/account-lockout.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
    private configService: ConfigService,
    private accountLockoutService: AccountLockoutService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    // Vérifier si le compte est verrouillé
    const isLocked = await this.accountLockoutService.isAccountLocked(email);
    if (isLocked) {
      throw new UnauthorizedException(
        'Compte temporairement verrouillé. Veuillez réessayer plus tard.',
      );
    }

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // Enregistrer la tentative échouée
      const isNowLocked =
        await this.accountLockoutService.recordFailedAttempt(email);
      if (isNowLocked) {
        throw new UnauthorizedException(
          'Compte temporairement verrouillé suite à trop de tentatives.',
        );
      }
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // Réinitialiser les tentatives en cas de succès
    await this.accountLockoutService.resetAttempts(email);

    const { password: _, ...result } = user;
    return result;
  }

  async register(registerDto: RegisterDto): Promise<TokenResponse> {
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const activationToken = uuidv4();
    const activationTokenExpires = new Date();
    activationTokenExpires.setHours(activationTokenExpires.getHours() + 24);

    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
      activationToken,
      activationTokenExpires,
      isEmailVerified: false,
    });

    await this.mailService.sendActivationEmail(user.email, activationToken);

    return this.generateTokens(user);
  }

  async login(user: any): Promise<TokenResponse> {
    const tokens = await this.generateTokens(user);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async refreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<TokenResponse> {
    const user = await this.usersService.findOne(userId);

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Token de rafraîchissement invalide');
    }

    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );

    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Token de rafraîchissement invalide');
    }

    if (user.refreshTokenExpires < new Date()) {
      throw new UnauthorizedException('Token de rafraîchissement expiré');
    }

    const tokens = await this.generateTokens(user);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async logout(userId: string) {
    await this.usersService.update(userId, {
      refreshToken: null,
      refreshTokenExpires: null,
    });
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return; // Ne pas révéler si l'email existe ou non
    }

    const token = randomBytes(32).toString('hex');
    const expires = new Date();
    expires.setHours(expires.getHours() + 24); // Expire dans 24h

    await this.usersService.update(user.id, {
      resetPasswordToken: token,
      resetPasswordTokenExpires: expires,
    });

    // TODO: Envoyer l'email avec le lien de réinitialisation
    // await this.mailService.sendResetPasswordEmail(user.email, token);
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.usersService.findByResetPasswordToken(token);
    if (!user || user.resetPasswordTokenExpires < new Date()) {
      throw new UnauthorizedException('Token invalide ou expiré');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersService.update(user.id, {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordTokenExpires: null,
    });
  }

  async verifyEmail(token: string) {
    const user = await this.usersService.findByActivationToken(token);
    if (!user || user.activationTokenExpires < new Date()) {
      throw new UnauthorizedException('Token invalide ou expiré');
    }

    await this.usersService.update(user.id, {
      isEmailVerified: true,
      activationToken: null,
      activationTokenExpires: null,
    });
  }

  async activateAccount(token: string) {
    const user = await this.usersService.findByActivationToken(token);

    if (!user) {
      throw new BadRequestException("Token d'activation invalide");
    }

    if (user.activationTokenExpires < new Date()) {
      throw new BadRequestException("Le token d'activation a expiré");
    }

    await this.usersService.update(user.id, {
      isEmailVerified: true,
      activationToken: null,
      activationTokenExpires: null,
    });

    return { message: 'Compte activé avec succès' };
  }

  private async generateTokens(user: any) {
    const payload = { email: user.email, sub: user.id };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: '15m',
    });

    const refreshToken = uuidv4();
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  private async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    const refreshTokenExpires = new Date();
    refreshTokenExpires.setDate(refreshTokenExpires.getDate() + 7);

    await this.usersService.update(userId, {
      refreshToken: hashedRefreshToken,
      refreshTokenExpires,
    });
  }
}
