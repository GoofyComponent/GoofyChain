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
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Inscription utilisateur' })
  @ApiResponse({
    status: 201,
    description: "Email d'activation envoyé",
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req, @Res({ passthrough: true }) response: Response) {
    console.log(req.user);
    // Générer l'access token et obtenir les infos utilisateur
    const result = await this.authService.login(req.user);

    // Créer un nouveau refresh token
    const refreshToken = await this.refreshTokenService.createRefreshToken(
      req.user,
      req.headers['user-agent'],
      req.ip,
    );

    // Définir le cookie refresh token
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

    // Vérifier si le token est valide
    const isValid =
      await this.refreshTokenService.isTokenValid(tokenFromCookie);
    if (!isValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Révoquer l'ancien token
    await this.refreshTokenService.revokeToken(tokenFromCookie);

    // Créer un nouveau refresh token et access token
    const refreshToken = await this.refreshTokenService.createRefreshToken(
      req.user,
      req.headers['user-agent'],
      req.ip,
    );

    // Générer un nouveau access token
    const accessToken = await this.authService.generateAccessToken(req.user);

    // Définir le nouveau refresh token dans le cookie
    this.setRefreshTokenCookie(response, refreshToken.token);

    // Retourner le nouveau access token
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
  @ApiOperation({ summary: 'Activer le compte utilisateur' })
  @ApiResponse({
    status: 200,
    description: 'Compte activé avec succès',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirection vers le front-end',
  })
  async activateAccount(
    @Param('token') token: string,
    @Res() response: Response,
  ) {
    try {
      await this.authService.activateAccount(token);

      const frontendUrl =
        this.configService.get('FRONTEND_URL') || 'http://localhost:3000';

      response.redirect(`${frontendUrl}/auth/activation-success`);
    } catch (error) {
      const frontendUrl =
        this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
      response.redirect(
        `${frontendUrl}/auth/activation-error?message=${encodeURIComponent(error.message)}`,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req) {
    return req.user;
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
