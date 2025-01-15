import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { MailService } from '../mail/mail.service';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/auth.dto';
import { AccountLockoutService } from './services/account-lockout.service';
import { RefreshTokenService } from './services/refresh-token.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
    private configService: ConfigService,
    private accountLockoutService: AccountLockoutService,
    private refreshTokenService: RefreshTokenService,
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

  async register(registerDto: RegisterDto) {
    const { email, password } = registerDto;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('Cet email est déjà utilisé');
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Générer le token d'activation
    const activationToken = randomBytes(32).toString('hex');
    const activationTokenExpires = new Date();
    activationTokenExpires.setHours(activationTokenExpires.getHours() + 24);

    await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
      activationToken,
      activationTokenExpires,
      isEmailVerified: false,
    });

    // Envoyer l'email d'activation
    await this.mailService.sendActivationEmail(email, activationToken);

    return {
      message: "Un email d'activation a été envoyé à votre adresse email",
    };
  }

  async login(user: any) {
    const accessToken = await this.generateAccessToken(user);
    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
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

  async generateAccessToken(user: any): Promise<string> {
    const payload = { sub: user.id, email: user.email };
    return this.jwtService.sign(payload);
  }
}
