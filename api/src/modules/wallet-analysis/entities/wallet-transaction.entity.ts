import { Exclude } from 'class-transformer';
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
  value: number; // Valeur en ETH

  @Column('numeric', { precision: 78, scale: 0 })
  brutValue: string; // Valeur brute en Wei (stockée comme string car trop grand pour number)

  @Column('numeric', { precision: 78, scale: 0 })
  gasPrice: string; // Prix du gas en Wei

  @Column('int')
  gasUsed: number;

  @Column('decimal', { precision: 36, scale: 18 })
  netValue: number; // Valeur nette en ETH (après soustraction des frais)

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
  balance: number; // Solde en ETH après la transaction

  @Column('decimal', { precision: 36, scale: 18 })
  previousBalance: number; // Solde en ETH avant la transaction

  @Column('numeric', { precision: 78, scale: 0 })
  balanceWei: string; // Solde en Wei après la transaction

  @Column('numeric', { precision: 78, scale: 0 })
  previousBalanceWei: string; // Solde en Wei avant la transaction

  @ManyToOne(() => WalletAnalysis, (analysis) => analysis.transactions)
  @Exclude()
  analysis: WalletAnalysis;

  @CreateDateColumn()
  createdAt: Date;
}
