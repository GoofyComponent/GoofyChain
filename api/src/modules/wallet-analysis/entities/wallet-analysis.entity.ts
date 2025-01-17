import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { User } from '../../users/entities/user.entity';
import { WalletTransaction } from './wallet-transaction.entity';

@Entity('wallet_analyses')
export class WalletAnalysis {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  walletAddress: string;

  @Column()
  currency: string;

  @Column('decimal', { precision: 36, scale: 18 })
  totalGasFees: number;

  @Column('decimal', { precision: 36, scale: 18 })
  totalIncoming: number;

  @Column('decimal', { precision: 36, scale: 18 })
  totalOutgoing: number;

  @Column('decimal', { precision: 36, scale: 18 })
  netBalance: number;

  @Column('jsonb', { nullable: true })
  currencyValues: {
    [key: string]: {
      totalGasFees: number;
      totalIncoming: number;
      totalOutgoing: number;
      netBalance: number;
      exchangeRate: number;
    };
  };

  @Column('int')
  totalTransactions: number;

  @ManyToOne(() => User)
  @Exclude()
  user: User;

  @OneToMany(() => WalletTransaction, (transaction) => transaction.analysis)
  @Exclude()
  transactions: WalletTransaction[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
