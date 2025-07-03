
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
  // Note: In production, credentials should be encrypted and stored securely
  credentials?: {
    password: string;
  };
}

export interface EmailMessage {
  uid: number;
  subject: string;
  from: string;
  date: Date;
  body?: string;
  snippet?: string;
}

interface EmailState {
  accounts: EmailAccount[];
  isConnecting: boolean;
  connectionError: string | null;
  latestEmail: EmailMessage | null;
  isFetchingEmail: boolean;
  
  // Actions
  addAccount: (account: Omit<EmailAccount, 'id' | 'isConnected'>, password: string) => void;
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
  fetchLatestEmail: (accountId: string) => Promise<EmailMessage | null>;
}

export const useEmailStore = create<EmailState>((set, get) => ({
  accounts: [],
  isConnecting: false,
  connectionError: null,
  latestEmail: null,
  isFetchingEmail: false,

  addAccount: (accountData, password) => {
    const newAccount: EmailAccount = {
      ...accountData,
      id: `account_${Date.now()}`,
      isConnected: true,
      credentials: {
        password: password
      }
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
      const response = await fetch('http://localhost:3001/api/email/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
          imapHost: credentials.imapHost,
          imapPort: credentials.imapPort,
          imapSecurity: credentials.imapSecurity,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Connection failed');
      }

      setConnecting(false);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect to email server. Please check your credentials.';
      setConnectionError(errorMessage);
      setConnecting(false);
      return false;
    }
  },

  fetchLatestEmail: async (accountId) => {
    const { accounts } = get();
    const account = accounts.find(acc => acc.id === accountId);
    
    if (!account || !account.isConnected || !account.credentials) {
      set({ isFetchingEmail: false });
      return null;
    }

    set({ isFetchingEmail: true });

    try {
      const response = await fetch('http://localhost:3001/api/email/fetch-latest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: account.email,
          password: account.credentials.password,
          imapHost: account.imapHost,
          imapPort: account.imapPort,
          imapSecurity: account.imapSecurity,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch email');
      }

      const latestEmail = data.email ? {
        uid: data.email.uid,
        subject: data.email.subject,
        from: data.email.from,
        date: new Date(data.email.date),
        snippet: data.email.snippet
      } : null;

      set({ latestEmail, isFetchingEmail: false });
      return latestEmail;
    } catch (error) {
      console.error('Error fetching latest email:', error);
      set({ isFetchingEmail: false });
      return null;
    }
  },
}));
