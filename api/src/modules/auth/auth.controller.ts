import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/auth.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RefreshTokenService } from './services/refresh-token.service';

@Controller({ path: 'auth', version: '1' })
@ApiTags('Authentication')
export class AuthController {
  constructor(
    private authService: AuthService,
    private refreshTokenService: RefreshTokenService,
    private configService: ConfigService,
    private userService: UsersService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'User registration' })
  @ApiResponse({
    status: 201,
    description: 'Activation email sent',
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req, @Res({ passthrough: true }) response: Response) {
    console.log(req.user);
    const result = await this.authService.login(req.user);

    const refreshToken = await this.refreshTokenService.createRefreshToken(
      req.user,
      req.headers['user-agent'],
      req.ip,
    );

    this.setRefreshTokenCookie(response, refreshToken.token);

    // Retourner l'access token et les infos utilisateur
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  async refreshToken(
    @Req() req,
    @Res({ passthrough: true }) response: Response,
  ) {
    const tokenFromCookie = req.cookies['refresh_token'];

    const isValid =
      await this.refreshTokenService.isTokenValid(tokenFromCookie);
    if (!isValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.refreshTokenService.revokeToken(tokenFromCookie);

    const refreshToken = await this.refreshTokenService.createRefreshToken(
      req.user,
      req.headers['user-agent'],
      req.ip,
    );

    const accessToken = await this.authService.generateAccessToken(req.user);

    this.setRefreshTokenCookie(response, refreshToken.token);

    return {
      accessToken,
      user: req.user,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(
    @Req() req,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    const tokenFromCookie = req.cookies['refresh_token'];
    if (tokenFromCookie) {
      await this.refreshTokenService.revokeToken(tokenFromCookie);
    }

    // Supprimer le cookie refresh token
    response.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });
  }

  @Get('activate/:token')
  @ApiOperation({ summary: 'Activate user account' })
  @ApiResponse({
    status: 200,
    description: 'Account successfully activated',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirect to front-end',
  })
  async activateAccount(
    @Param('token') token: string,
    @Res() response: Response,
  ) {
    try {
      await this.authService.activateAccount(token);

      const frontendUrl =
        this.configService.get('CLIENT_URL') || 'http://localhost:5173';

      response.redirect(`${frontendUrl}/login`);
    } catch (error) {
      const frontendUrl =
        this.configService.get('CLIENT_URL') || 'http://localhost:5173';
      response.redirect(
        `${frontendUrl}/?message=${encodeURIComponent(error.message)}`,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile/has-onboarded')
  async hasOnboarded(@Req() req) {
    const userId = req.user.id;
    const user = await this.userService.findOne(userId);
    return { hasOnboarded: user.isOnboarded };
  }

  @UseGuards(JwtAuthGuard)
  @Post('profile/onboarding-completed')
  async onboardingCompleted(@Req() req) {
    const userId = req.user.id;
    const initialWalletId = req.body.walletId;
    const preferedCurrency = req.body.preferedCurrency;

    if (!initialWalletId || !preferedCurrency) {
      throw new Error('Please provide a wallet and preferred currency');
    }

    //TODO: Check if the user already onboarded

    await this.userService.onboardingCompleted(userId, {
      initialWalletId,
      preferedCurrency,
    });

    return { message: 'Onboarding successfully completed' };
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({
    status: 200,
    description: 'Reset email sent successfully',
  })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    await this.authService.forgotPassword(forgotPasswordDto.email);
    return {
      message: 'If your email exists, you will receive a reset link',
    };
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset Password' })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully',
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    await this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.password,
    );
    return { message: 'Password reset successfully' };
  }

  @Get('verify-email/:token')
  @ApiOperation({ summary: 'Verify Email' })
  @ApiResponse({
    status: 200,
    description: 'Email verified successfully',
  })
  async verifyEmail(@Param('token') token: string) {
    await this.authService.verifyEmail(token);
    return { message: 'Email verified successfully' };
  }

  @Post('resend-activation')
  @ApiOperation({ summary: 'Resend activation email' })
  @ApiResponse({
    status: 200,
    description: 'Activation email successfully resent',
  })
  async resendActivationEmail(@Body('email') email: string) {
    return this.authService.resendActivationEmail(email);
  }

  private setRefreshTokenCookie(response: Response, token: string) {
    response.cookie('refresh_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
    });
  }
}
