import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CryptoPriceService } from './crypto-price.service';

@Module({
  imports: [ConfigModule],
  providers: [CryptoPriceService],
  exports: [CryptoPriceService],
})
export class CryptoPriceModule {}
