
import { create } from 'zustand';

export interface EmailAccount {
  id: string;
  email: string;
  provider: string;
  imapHost: string;
  imapPort: number;
  imapSecurity: 'ssl' | 'tls' | 'none';
  isConnected: boolean;
  lastSync?: Date;
  error?: string;
}

interface EmailState {
  accounts: EmailAccount[];
  isConnecting: boolean;
  connectionError: string | null;
  
  // Actions
  addAccount: (account: Omit<EmailAccount, 'id' | 'isConnected'>) => void;
  updateAccount: (id: string, updates: Partial<EmailAccount>) => void;
  removeAccount: (id: string) => void;
  setConnecting: (connecting: boolean) => void;
  setConnectionError: (error: string | null) => void;
  testConnection: (credentials: {
    email: string;
    password: string;
    imapHost: string;
    imapPort: number;
    imapSecurity: string;
  }) => Promise<boolean>;
}

export const useEmailStore = create<EmailState>((set, get) => ({
  accounts: [],
  isConnecting: false,
  connectionError: null,

  addAccount: (accountData) => {
    const newAccount: EmailAccount = {
      ...accountData,
      id: `account_${Date.now()}`,
      isConnected: false,
    };
    
    set((state) => ({
      accounts: [...state.accounts, newAccount]
    }));
  },

  updateAccount: (id, updates) => {
    set((state) => ({
      accounts: state.accounts.map(account =>
        account.id === id ? { ...account, ...updates } : account
      )
    }));
  },

  removeAccount: (id) => {
    set((state) => ({
      accounts: state.accounts.filter(account => account.id !== id)
    }));
  },

  setConnecting: (connecting) => {
    set({ isConnecting: connecting });
  },

  setConnectionError: (error) => {
    set({ connectionError: error });
  },

  testConnection: async (credentials) => {
    const { setConnecting, setConnectionError } = get();
    
    setConnecting(true);
    setConnectionError(null);
    
    try {
      // Simulate IMAP connection test
      // In a real app, this would use a proper IMAP library
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate connection success/failure
      const success = Math.random() > 0.3; // 70% success rate for demo
      
      if (!success) {
        throw new Error('Failed to connect to email server. Please check your credentials.');
      }
      
      setConnecting(false);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setConnectionError(errorMessage);
      setConnecting(false);
      return false;
    }
  },
}));
