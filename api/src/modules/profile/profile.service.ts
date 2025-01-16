import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getWallets(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'wallets'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      wallets: user.wallets || [],
    };
  }

  async updateWallets(userId: string, addresses: string[]) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check each address individually to provide a more precise error message
    addresses.forEach((address) => {
      if (!address.startsWith('0x')) {
        throw new Error(`The address ${address} must start with '0x'`);
      }

      const addressWithout0x = address.slice(2);
      if (addressWithout0x.length > 40) {
        throw new Error(
          `The address ${address} seems to be a private key. Please provide a public Ethereum address (40 characters after '0x')`,
        );
      }

      if (addressWithout0x.length < 40) {
        throw new Error(
          `The address ${address} is too short. An Ethereum address must be exactly 40 characters after '0x'`,
        );
      }

      if (!/^[a-fA-F0-9]{40}$/.test(addressWithout0x)) {
        throw new Error(
          `The address ${address} contains invalid characters. Only hexadecimal characters (0-9, a-f, A-F) are allowed`,
        );
      }
    });

    await this.userRepository.update(userId, { wallets: addresses });

    return {
      message: 'Wallets updated successfully',
      wallets: addresses,
    };
  }

  async getProfileData(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: [
        'id',
        'email',
        'firstName',
        'lastName',
        'wallets',
        'createdAt',
        'updatedAt',
      ],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      wallets: user.wallets || [],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async updatePrefProfileData(userId: string, data: Partial<User>) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Find the previous initialWalletId inside wallets and delete it
    const wallets = user.wallets || [];
    const previousInitialWalletId = user.initialWalletId;
    const toDeleteIndex = wallets.indexOf(previousInitialWalletId);
    if (toDeleteIndex > -1) {
      wallets.splice(toDeleteIndex, 1);
    }
    wallets.push(data.initialWalletId);
    data.wallets = wallets;

    await this.userRepository.update(userId, data);

    return {
      message: 'Profile data updated successfully',
      ...data,
    };
  }

  async updateProfilePassword(userId: string, data: any) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, 10);

    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      throw new Error('Incorrect password');
    }

    await this.userRepository.update(userId, {
      password: hashedPassword,
    });

    return {
      message: 'Password updated successfully',
    };
  }
}
