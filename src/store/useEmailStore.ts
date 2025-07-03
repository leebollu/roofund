
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
      // Simulate realistic connection test with validation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Basic validation - check if credentials look valid
      if (!credentials.email || !credentials.password || !credentials.imapHost) {
        throw new Error('Missing required credentials');
      }
      
      if (!credentials.email.includes('@') || credentials.email.length < 5) {
        throw new Error('Invalid email address format');
      }
      
      if (credentials.password.length < 3) {
        throw new Error('Password appears to be too short');
      }
      
      // Test known email providers with realistic validation
      const domain = credentials.email.split('@')[1]?.toLowerCase();
      if (domain === 'gmail.com' && !credentials.password.includes('-')) {
        throw new Error('Gmail requires an App Password (16 characters with dashes). Please generate one in your Google Account settings.');
      }
      
      if (domain === 'yahoo.com' && credentials.password.length < 16) {
        throw new Error('Yahoo Mail requires an App Password. Please generate one in your Yahoo Account settings.');
      }
      
      // Check if host matches email provider
      if (domain === 'gmail.com' && !credentials.imapHost.includes('gmail')) {
        throw new Error('IMAP host should be imap.gmail.com for Gmail accounts');
      }
      
      if (domain === 'outlook.com' && !credentials.imapHost.includes('outlook')) {
        throw new Error('IMAP host should be outlook.office365.com for Outlook accounts');
      }
      
      // Simulate potential connection failures
      if (credentials.password === 'wrongpassword' || credentials.password === 'test123') {
        throw new Error('Authentication failed. Please check your password.');
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
      // Simulate email fetching with realistic delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate a realistic mock email based on the account
      const mockEmails = [
        {
          uid: 12345,
          subject: 'Welcome to Amazon Prime',
          from: 'no-reply@amazon.com',
          date: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          snippet: 'Thank you for joining Amazon Prime. Your membership is now active.'
        },
        {
          uid: 12346,
          subject: 'Your order has been shipped',
          from: 'orders@shopify.com',
          date: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          snippet: 'Your order #12345 has been shipped and is on its way.'
        },
        {
          uid: 12347,
          subject: 'Payment confirmation',
          from: 'noreply@stripe.com',
          date: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
          snippet: 'Payment of $29.99 has been processed successfully.'
        }
      ];
      
      // Select a random email to simulate fetching the latest
      const latestEmail = mockEmails[Math.floor(Math.random() * mockEmails.length)];
      
      set({ latestEmail, isFetchingEmail: false });
      return latestEmail;
    } catch (error) {
      console.error('Error fetching latest email:', error);
      set({ isFetchingEmail: false });
      return null;
    }
  },
}));
