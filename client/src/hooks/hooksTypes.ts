import { SupportedCurrencies } from "@/lib/types";

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  // wallets: string[];
  initialWalletId: string;
  preferedCurrency: SupportedCurrencies;
  isOnboarded: boolean;
};

export type AuthState = {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
};

export interface AuthFunctions {
  login: (user: User, jwt: string) => Promise<void>;
  logout: () => Promise<void>;
  update: (user: Partial<User>) => Promise<void>;
}
