import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

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
      throw new NotFoundException('Utilisateur non trouvé');
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
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Vérifier chaque adresse individuellement pour donner un message d'erreur plus précis
    addresses.forEach((address) => {
      if (!address.startsWith('0x')) {
        throw new Error(`L'adresse ${address} doit commencer par '0x'`);
      }

      const addressWithout0x = address.slice(2);
      if (addressWithout0x.length > 40) {
        throw new Error(
          `L'adresse ${address} semble être une clé privée. Veuillez fournir une adresse Ethereum publique (40 caractères après '0x')`,
        );
      }

      if (addressWithout0x.length < 40) {
        throw new Error(
          `L'adresse ${address} est trop courte. Une adresse Ethereum doit avoir exactement 40 caractères après '0x'`,
        );
      }

      if (!/^[a-fA-F0-9]{40}$/.test(addressWithout0x)) {
        throw new Error(
          `L'adresse ${address} contient des caractères invalides. Seuls les caractères hexadécimaux (0-9, a-f, A-F) sont autorisés`,
        );
      }
    });

    await this.userRepository.update(userId, { wallets: addresses });

    return {
      message: 'Wallets mis à jour avec succès',
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
      throw new NotFoundException('Utilisateur non trouvé');
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
}
