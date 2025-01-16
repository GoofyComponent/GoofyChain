import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, TokenResponse } from './dto/auth.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { UsersService } from '../users/users.service';

@Controller({ path: 'auth', version: '1' })
@ApiTags('Authentication')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UsersService,
  ) {}

  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<TokenResponse> {
    const result = await this.authService.register(registerDto);
    this.setRefreshTokenCookie(response, result.refreshToken);
    delete result.refreshToken;
    return result;
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Req() req,
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<TokenResponse> {
    const result = await this.authService.login(req.user);
    this.setRefreshTokenCookie(response, result.refreshToken);
    delete result.refreshToken;
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  async refreshToken(
    @Req() req,
    @Res({ passthrough: true }) response: Response,
  ): Promise<TokenResponse> {
    const refreshToken = req.cookies['refresh_token'];
    const result = await this.authService.refreshToken(
      req.user.id,
      refreshToken,
    );
    this.setRefreshTokenCookie(response, result.refreshToken);
    delete result.refreshToken;
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req, @Res({ passthrough: true }) response: Response) {
    await this.authService.logout(req.user.id);
    response.clearCookie('refresh_token');
    return { message: 'Déconnexion réussie' };
  }

  @Get('activate/:token')
  async activateAccount(@Param('token') token: string) {
    return this.authService.activateAccount(token);
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
      throw new Error(
        'Veuillez fournir un portefeuille et une devise préférée',
      );
    }

    //TODO: Check if the user already onboarded

    await this.userService.onboardingCompleted(userId, {
      initialWalletId,
      preferedCurrency,
    });

    return { message: 'Onboarding terminé avec succès' };
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Demander la réinitialisation du mot de passe' })
  @ApiResponse({
    status: 200,
    description: 'Email de réinitialisation envoyé avec succès',
  })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    await this.authService.forgotPassword(forgotPasswordDto.email);
    return {
      message:
        'Si votre email existe, vous recevrez un lien de réinitialisation',
    };
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Réinitialiser le mot de passe' })
  @ApiResponse({
    status: 200,
    description: 'Mot de passe réinitialisé avec succès',
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    await this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.password,
    );
    return { message: 'Mot de passe réinitialisé avec succès' };
  }

  @Get('verify-email/:token')
  @ApiOperation({ summary: "Vérifier l'email" })
  @ApiResponse({
    status: 200,
    description: 'Email vérifié avec succès',
  })
  async verifyEmail(@Param('token') token: string) {
    await this.authService.verifyEmail(token);
    return { message: 'Email vérifié avec succès' };
  }

  private setRefreshTokenCookie(response: Response, refreshToken: string) {
    response.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
      path: '/auth/refresh',
    });
  }
}
