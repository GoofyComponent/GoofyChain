import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { CryptoPriceModule } from '../crypto-price/crypto-price.module';
import { WalletAnalysis } from './entities/wallet-analysis.entity';
import { WalletTransaction } from './entities/wallet-transaction.entity';
import { WalletAnalysisController } from './wallet-analysis.controller';
import { WalletAnalysisService } from './wallet-analysis.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([WalletAnalysis, WalletTransaction]),
    AuthModule,
    CryptoPriceModule,
  ],
  providers: [WalletAnalysisService],
  controllers: [WalletAnalysisController],
})
export class WalletAnalysisModule {}
