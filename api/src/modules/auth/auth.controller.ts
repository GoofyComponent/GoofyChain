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
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, TokenResponse } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

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
