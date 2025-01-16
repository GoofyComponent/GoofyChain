import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../users/entities/user.entity';
import { AccountLockoutService } from './account-lockout.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [AccountLockoutService],
  exports: [AccountLockoutService],
})
export class AccountLockoutModule {}
