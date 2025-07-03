
export interface EmailProvider {
  name: string;
  domains: string[];
  imapHost: string;
  imapPort: number;
  imapSecurity: 'ssl' | 'tls' | 'none';
  requiresAppPassword: boolean;
  setupInstructions?: string;
  logo?: string;
}

export const EMAIL_PROVIDERS: EmailProvider[] = [
  {
    name: 'Gmail',
    domains: ['gmail.com', 'googlemail.com'],
    imapHost: 'imap.gmail.com',
    imapPort: 993,
    imapSecurity: 'ssl',
    requiresAppPassword: true,
    setupInstructions: 'You need to enable 2-factor authentication and create an App Password',
    logo: '📧'
  },
  {
    name: 'Outlook/Hotmail',
    domains: ['outlook.com', 'hotmail.com', 'live.com', 'msn.com'],
    imapHost: 'outlook.office365.com',
    imapPort: 993,
    imapSecurity: 'ssl',
    requiresAppPassword: false,
    logo: '📫'
  },
  {
    name: 'Yahoo Mail',
    domains: ['yahoo.com', 'yahoo.co.uk', 'ymail.com'],
    imapHost: 'imap.mail.yahoo.com',
    imapPort: 993,
    imapSecurity: 'ssl',
    requiresAppPassword: true,
    setupInstructions: 'Generate an App Password in your Yahoo account settings',
    logo: '📮'
  },
  {
    name: 'iCloud Mail',
    domains: ['icloud.com', 'me.com', 'mac.com'],
    imapHost: 'imap.mail.me.com',
    imapPort: 993,
    imapSecurity: 'ssl',
    requiresAppPassword: true,
    setupInstructions: 'Generate an App-Specific Password in your Apple ID settings',
    logo: '☁️'
  },
  {
    name: 'Other Provider',
    domains: [],
    imapHost: '',
    imapPort: 993,
    imapSecurity: 'ssl',
    requiresAppPassword: false,
    logo: '✉️'
  }
];

export const detectEmailProvider = (email: string): EmailProvider => {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return EMAIL_PROVIDERS[EMAIL_PROVIDERS.length - 1]; // Other Provider
  
  const provider = EMAIL_PROVIDERS.find(p => 
    p.domains.some(d => d === domain)
  );
  
  return provider || EMAIL_PROVIDERS[EMAIL_PROVIDERS.length - 1];
};
