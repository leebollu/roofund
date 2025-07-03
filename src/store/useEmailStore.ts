
import { create } from 'zustand';
import ImapClient from 'emailjs-imap-client';

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
      const client = new ImapClient(credentials.imapHost, credentials.imapPort, {
        auth: {
          user: credentials.email,
          pass: credentials.password,
        },
        useSecureTransport: credentials.imapSecurity === 'ssl',
        requireTLS: credentials.imapSecurity === 'tls',
        logLevel: 'warn'
      });

      await client.connect();
      
      // Test by selecting INBOX
      await client.selectMailbox('INBOX');
      
      // Try to fetch one message to verify access
      const messages = await client.search('ALL', { uid: true, limit: 1 });
      
      await client.close();
      
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
      const client = new ImapClient(account.imapHost, account.imapPort, {
        auth: {
          user: account.email,
          pass: account.credentials.password,
        },
        useSecureTransport: account.imapSecurity === 'ssl',
        requireTLS: account.imapSecurity === 'tls',
        logLevel: 'warn'
      });

      await client.connect();
      await client.selectMailbox('INBOX');
      
      // Get the latest message
      const messages = await client.search('ALL', { uid: true });
      if (messages.length === 0) {
        await client.close();
        set({ isFetchingEmail: false });
        return null;
      }

      const latestUid = Math.max(...messages);
      const messageDetails = await client.listMessages('INBOX', latestUid, ['uid', 'envelope', 'bodystructure']);
      
      if (messageDetails.length > 0) {
        const msg = messageDetails[0];
        const latestEmail: EmailMessage = {
          uid: msg.uid,
          subject: msg.envelope.subject || 'No Subject',
          from: msg.envelope.from?.[0]?.address || 'Unknown',
          date: new Date(msg.envelope.date || Date.now()),
          snippet: `Latest email from ${msg.envelope.from?.[0]?.address || 'Unknown'}`
        };

        await client.close();
        set({ latestEmail, isFetchingEmail: false });
        return latestEmail;
      }

      await client.close();
      set({ isFetchingEmail: false });
      return null;
    } catch (error) {
      console.error('Error fetching latest email:', error);
      set({ isFetchingEmail: false });
      return null;
    }
  },
}));
