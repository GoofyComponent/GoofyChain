import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateWalletsDto } from './dto/wallet.dto';
import { ProfileService } from './profile.service';

@Controller({ path: 'profile', version: '1' })
@UseGuards(JwtAuthGuard)
@ApiTags('Profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('wallets')
  @ApiOperation({ summary: "Récupérer les wallets de l'utilisateur" })
  @ApiResponse({
    status: 200,
    description: 'Liste des wallets récupérée avec succès',
  })
  async getWallets(@Req() req) {
    return this.profileService.getWallets(req.user.id);
  }

  @Put('wallets')
  @ApiOperation({ summary: "Mettre à jour les wallets de l'utilisateur" })
  @ApiResponse({
    status: 200,
    description: 'Wallets mis à jour avec succès',
  })
  async updateWallets(@Req() req, @Body() updateWalletsDto: UpdateWalletsDto) {
    return this.profileService.updateWallets(
      req.user.id,
      updateWalletsDto.addresses,
    );
  }

  @Get('data')
  @ApiOperation({ summary: 'Récupérer les données du profil' })
  @ApiResponse({
    status: 200,
    description: 'Données du profil récupérées avec succès',
  })
  async getProfileData(@Req() req) {
    return this.profileService.getProfileData(req.user.id);
  }

  @Put('data/preferences')
  @ApiOperation({ summary: 'Mettre a jour les donnees du profil' })
  @ApiResponse({
    status: 200,
    description: 'DonnÃ©es du profil mises a jour avec succes',
  })
  async updateProfileData(@Req() req, @Body() data: any) {
    const { walletId, preferedCurrency } = data;

    if (!walletId && !preferedCurrency) {
      throw new BadRequestException('Aucune donnee a mettre a jour');
    }

    return this.profileService.updatePrefProfileData(req.user.id, {
      initialWalletId: walletId,
      preferedCurrency,
    });
  }

  @Put('data/password')
  @ApiOperation({ summary: 'Mettre a jour le mot de passe du profil' })
  @ApiResponse({
    status: 200,
    description: 'Mot de passe mis a jour avec succes',
  })
  async updateProfilePassword(@Req() req, @Body() data: any) {
    const { password, newPassword } = data;

    if (!password || !newPassword) {
      throw new BadRequestException(
        'Veuillez renseigner les deux mots de passe',
      );
    }

    return this.profileService.updateProfilePassword(req.user.id, {
      password,
      newPassword,
    });
  }
}
