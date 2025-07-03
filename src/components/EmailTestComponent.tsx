import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useEmailStore, EmailMessage } from '@/store/useEmailStore';

interface EmailTestComponentProps {
  accountId: string;
}

const EmailTestComponent: React.FC<EmailTestComponentProps> = ({ accountId }) => {
  const { accounts, latestEmail, isFetchingEmail, fetchLatestEmail } = useEmailStore();
  
  const account = accounts.find(acc => acc.id === accountId);

  if (!account) {
    return null;
  }

  const handleTestConnection = async () => {
    await fetchLatestEmail(accountId);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <Card className="bg-white border-slate-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-3">
          <span className="text-2xl">🧪</span>
          Test Email Connection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xl">📧</span>
            <div>
              <p className="font-medium text-slate-900">{account.email}</p>
              <p className="text-sm text-slate-600">{account.provider}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="text-sm text-emerald-700">Connected successfully</span>
          </div>
        </div>

        <Button 
          onClick={handleTestConnection}
          disabled={isFetchingEmail}
          className="w-full"
          variant="outline"
        >
          {isFetchingEmail ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              Fetching Latest Email...
            </div>
          ) : (
            'Fetch Latest Email from Inbox'
          )}
        </Button>

        {latestEmail && (
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✅</span>
                  <span className="font-medium text-green-900">Latest Email Retrieved Successfully!</span>
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-slate-600">Subject:</span>
                      <p className="text-slate-900">{latestEmail.subject}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-slate-600">From:</span>
                      <p className="text-slate-900">{latestEmail.from}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-slate-600">Date:</span>
                      <p className="text-slate-900">{formatDate(latestEmail.date)}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-slate-600">UID:</span>
                      <p className="text-slate-900">{latestEmail.uid}</p>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-green-700">
                  🎉 Your email connection is working perfectly! You can now proceed to use the app to scan for transaction emails.
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default EmailTestComponent;