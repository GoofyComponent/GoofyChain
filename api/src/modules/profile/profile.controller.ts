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
  @ApiOperation({ summary: "Retrieve user's wallets" })
  @ApiResponse({
    status: 200,
    description: 'Wallet list retrieved successfully',
  })
  async getWallets(@Req() req) {
    return this.profileService.getWallets(req.user.id);
  }

  @Put('wallets')
  @ApiOperation({ summary: "Update user's wallets" })
  @ApiResponse({
    status: 200,
    description: 'Wallets updated successfully',
  })
  async updateWallets(@Req() req, @Body() updateWalletsDto: UpdateWalletsDto) {
    return this.profileService.updateWallets(
      req.user.id,
      updateWalletsDto.addresses,
    );
  }

  @Get('data')
  @ApiOperation({ summary: 'Retrieve profile data' })
  @ApiResponse({
    status: 200,
    description: 'Profile data retrieved successfully',
  })
  async getProfileData(@Req() req) {
    return this.profileService.getProfileData(req.user.id);
  }

  @Put('data/preferences')
  @ApiOperation({ summary: 'Update profile data' })
  @ApiResponse({
    status: 200,
    description: 'Profile data updated successfully',
  })
  async updateProfileData(@Req() req, @Body() data: any) {
    const { walletId, preferedCurrency } = data;

    if (!walletId && !preferedCurrency) {
      throw new BadRequestException('No data to update');
    }

    return this.profileService.updatePrefProfileData(req.user.id, {
      initialWalletId: walletId,
      preferedCurrency,
    });
  }

  @Put('data/password')
  @ApiOperation({ summary: 'Update profile password' })
  @ApiResponse({
    status: 200,
    description: 'Password updated successfully',
  })
  async updateProfilePassword(@Req() req, @Body() data: any) {
    const { password, newPassword } = data;

    if (!password || !newPassword) {
      throw new BadRequestException('Please provide both passwords');
    }

    return this.profileService.updateProfilePassword(req.user.id, {
      password,
      newPassword,
    });
  }
}
