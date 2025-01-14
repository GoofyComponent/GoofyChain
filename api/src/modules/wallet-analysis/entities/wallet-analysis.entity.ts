import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { WalletTransaction } from './wallet-transaction.entity';

@Entity('wallet_analyses')
export class WalletAnalysis {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  walletAddress: string;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column('decimal', { precision: 36, scale: 18 })
  initialBalance: number;

  @Column('decimal', { precision: 36, scale: 18 })
  finalBalance: number;

  @Column('decimal', { precision: 36, scale: 18 })
  totalGasFees: number;

  @Column('decimal', { precision: 36, scale: 18 })
  totalIncoming: number;

  @Column('decimal', { precision: 36, scale: 18 })
  totalOutgoing: number;

  @Column('decimal', { precision: 36, scale: 18 })
  netProfit: number;

  @Column()
  currency: string; // EUR/USD

  @ManyToOne(() => User)
  user: User;

  @OneToMany(() => WalletTransaction, (transaction) => transaction.analysis)
  transactions: WalletTransaction[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
