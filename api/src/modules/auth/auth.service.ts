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
    const isLocked = await this.accountLockoutService.isAccountLocked(email);
    if (isLocked) {
      throw new UnauthorizedException(
        'Account temporarily locked. Please try again later.',
      );
    }

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Incorrect email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const isNowLocked =
        await this.accountLockoutService.recordFailedAttempt(email);
      if (isNowLocked) {
        throw new UnauthorizedException(
          'Account temporarily locked due to too many attempts.',
        );
      }
      throw new UnauthorizedException('Incorrect email or password');
    }

    await this.accountLockoutService.resetAttempts(email);

    const { password: _, ...result } = user;
    return result;
  }

  async register(registerDto: RegisterDto) {
    const { email, password } = registerDto;

    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('This email is already in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

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

    await this.mailService.sendActivationEmail(email, activationToken);

    return {
      message: 'An activation email has been sent to your email address',
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
        // wallets: string[];
        initialWalletId: user.initialWalletId,
        preferedCurrency: user.preferedCurrency,
        isOnboarded: user.isOnboarded,
      },
    };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return;
    }

    const token = randomBytes(32).toString('hex');
    const expires = new Date();
    expires.setHours(expires.getHours() + 24);

    await this.usersService.update(user.id, {
      resetPasswordToken: token,
      resetPasswordTokenExpires: expires,
    });

    await this.mailService.sendResetPasswordEmail(user.email, token);
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.usersService.findByResetPasswordToken(token);
    if (!user || user.resetPasswordTokenExpires < new Date()) {
      throw new UnauthorizedException(
        'The token is invalid or has expired. Please try again.',
      );
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
      throw new UnauthorizedException('Invalid or expired token');
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
      throw new BadRequestException('Invalid activation token');
    }

    if (user.activationTokenExpires < new Date()) {
      throw new BadRequestException('The activation token has expired');
    }

    await this.usersService.update(user.id, {
      isEmailVerified: true,
      activationToken: null,
      activationTokenExpires: null,
    });

    return { message: 'Account successfully activated' };
  }

  async resendActivationEmail(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return {
        message:
          'If your account exists, a new activation email will be sent to you.',
      };
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Your account is already activated.');
    }

    const activationToken = randomBytes(32).toString('hex');
    const activationTokenExpires = new Date();
    activationTokenExpires.setHours(activationTokenExpires.getHours() + 24);

    await this.usersService.update(user.id, {
      activationToken,
      activationTokenExpires,
    });

    await this.mailService.sendActivationEmail(email, activationToken);

    return {
      message:
        'If your account exists, a new activation email will be sent to you.',
    };
  }

  async generateAccessToken(user: any): Promise<string> {
    const payload = { sub: user.id, email: user.email };
    return this.jwtService.sign(payload);
  }
}
