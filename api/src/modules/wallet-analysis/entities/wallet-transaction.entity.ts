import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { WalletAnalysis } from './wallet-analysis.entity';

@Entity('wallet_transactions')
@Index(['hash', 'walletAddress'], { unique: true })
export class WalletTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  hash: string;

  @Column()
  walletAddress: string;

  @Column()
  from: string;

  @Column()
  to: string;

  @Column('int')
  blockNumber: number;

  @Column('decimal', { precision: 36, scale: 18 })
  value: number;

  @Column('decimal', { precision: 36, scale: 18 })
  gasUsed: number;

  @Column('decimal', { precision: 36, scale: 18 })
  gasPrice: number;

  @Column('decimal', { precision: 36, scale: 18 })
  netValue: number; // Valeur après soustraction des frais

  @Column('decimal', { precision: 36, scale: 18 })
  ethPrice: number; // Prix de l'ETH au moment de la transaction

  @Column('decimal', { precision: 36, scale: 18 })
  valueInCurrency: number; // Valeur en devise

  @Column()
  currency: string; // Devise utilisée

  @Column()
  timestamp: Date;

  @Column()
  isIncoming: boolean;

  @Column('decimal', { precision: 36, scale: 18 })
  balance: number; // Solde du wallet après cette transaction

  @Column('decimal', { precision: 36, scale: 18 })
  previousBalance: number; // Solde du wallet avant cette transaction

  @ManyToOne(() => WalletAnalysis, (analysis) => analysis.transactions)
  analysis: WalletAnalysis;

  @CreateDateColumn()
  createdAt: Date;
}
