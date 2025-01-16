import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountLockoutModule } from '../auth/services/account-lockout.module';
import { CryptoPriceModule } from '../crypto-price/crypto-price.module';
import { UsersModule } from '../users/users.module';
import { WalletAnalysis } from './entities/wallet-analysis.entity';
import { WalletTransaction } from './entities/wallet-transaction.entity';
import { WalletAnalysisController } from './wallet-analysis.controller';
import { WalletAnalysisService } from './wallet-analysis.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([WalletAnalysis, WalletTransaction]),
    ConfigModule,
    CryptoPriceModule,
    UsersModule,
    AccountLockoutModule,
  ],
  controllers: [WalletAnalysisController],
  providers: [WalletAnalysisService],
})
export class WalletAnalysisModule {}
