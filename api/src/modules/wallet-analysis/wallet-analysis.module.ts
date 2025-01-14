import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletAnalysisController } from './wallet-analysis.controller';
import { WalletAnalysisService } from './wallet-analysis.service';
import { WalletAnalysis } from './entities/wallet-analysis.entity';
import { WalletTransaction } from './entities/wallet-transaction.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([WalletAnalysis, WalletTransaction]),
    ConfigModule,
  ],
  controllers: [WalletAnalysisController],
  providers: [WalletAnalysisService],
})
export class WalletAnalysisModule {}
