
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useEmailStore } from '@/store/useEmailStore';
import { detectEmailProvider, EMAIL_PROVIDERS, EmailProvider } from '@/config/emailProviders';

interface EmailConnectionFormProps {
  onSuccess: () => void;
  onBack: () => void;
}

const EmailConnectionForm: React.FC<EmailConnectionFormProps> = ({ onSuccess, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [detectedProvider, setDetectedProvider] = useState<EmailProvider | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customHost, setCustomHost] = useState('');
  const [customPort, setCustomPort] = useState('993');

  const { isConnecting, connectionError, testConnection, addAccount, setConnectionError } = useEmailStore();

  useEffect(() => {
    if (email.includes('@')) {
      const provider = detectEmailProvider(email);
      setDetectedProvider(provider);
      if (provider.name === 'Other Provider') {
        setShowAdvanced(true);
      }
    } else {
      setDetectedProvider(null);
    }
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setConnectionError(null);

    if (!detectedProvider) {
      setConnectionError('Please enter a valid email address');
      return;
    }

    const credentials = {
      email,
      password,
      imapHost: showAdvanced ? customHost : detectedProvider.imapHost,
      imapPort: showAdvanced ? parseInt(customPort) : detectedProvider.imapPort,
      imapSecurity: detectedProvider.imapSecurity,
    };

    const success = await testConnection(credentials);
    
    if (success) {
      addAccount({
        email,
        provider: detectedProvider.name,
        imapHost: credentials.imapHost,
        imapPort: credentials.imapPort,
        imapSecurity: credentials.imapSecurity,
      }, password);
      onSuccess();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="p-2 -ml-2"
          >
            ←
          </Button>
          <h1 className="text-xl font-semibold text-slate-900">Connect Email</h1>
        </div>
      </div>

      <div className="flex-1 px-6 py-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-blue-100 flex items-center justify-center">
              <span className="text-2xl">📧</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Connect Your Email</h2>
            <p className="text-slate-600">
              We'll scan your email for purchase confirmations to help track your orders and returns.
            </p>
          </div>

          <Card className="shadow-sm border-0 bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Email Credentials</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="h-12"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your email password"
                    className="h-12"
                    required
                  />
                </div>

                {/* Provider Detection */}
                {detectedProvider && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xl">{detectedProvider.logo}</span>
                      <span className="font-medium text-slate-900">{detectedProvider.name}</span>
                    </div>
                    {detectedProvider.requiresAppPassword && (
                      <p className="text-sm text-blue-700">
                        ⚠️ {detectedProvider.setupInstructions}
                      </p>
                    )}
                  </div>
                )}

                {/* Advanced Settings */}
                {detectedProvider?.name === 'Other Provider' && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-slate-900">IMAP Settings</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="host">IMAP Host</Label>
                        <Input
                          id="host"
                          value={customHost}
                          onChange={(e) => setCustomHost(e.target.value)}
                          placeholder="imap.example.com"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="port">Port</Label>
                        <Input
                          id="port"
                          value={customPort}
                          onChange={(e) => setCustomPort(e.target.value)}
                          placeholder="993"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {connectionError && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-700">
                      {connectionError}
                    </AlertDescription>
                  </Alert>
                )}

                <Button 
                  type="submit" 
                  className="w-full gradient-primary text-white font-semibold py-3 text-base rounded-xl"
                  disabled={isConnecting}
                >
                  {isConnecting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Testing Connection...
                    </div>
                  ) : (
                    'Connect Email Account'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Security Note */}
          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-start gap-3">
              <span className="text-green-600">🔒</span>
              <div>
                <h4 className="font-medium text-green-900 mb-1">Your Privacy is Protected</h4>
                <p className="text-sm text-green-700">
                  Your email credentials are encrypted and stored securely on your device. 
                  We only read purchase confirmation emails to help track your orders.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailConnectionForm;
