
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useEmailStore } from '@/store/useEmailStore';

interface ConnectionSuccessScreenProps {
  onContinue: () => void;
}

const ConnectionSuccessScreen: React.FC<ConnectionSuccessScreenProps> = ({ onContinue }) => {
  const { accounts } = useEmailStore();
  const connectedAccount = accounts[accounts.length - 1]; // Get the most recently added account

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex flex-col justify-center px-6 py-12">
      <div className="max-w-md mx-auto text-center">
        {/* Success Animation */}
        <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-emerald-100 flex items-center justify-center animate-pulse">
          <div className="w-16 h-16 rounded-full gradient-success flex items-center justify-center">
            <span className="text-2xl text-white">✓</span>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-slate-900 mb-4 animate-fade-in-up">
          Email Connected Successfully!
        </h1>
        
        <p className="text-lg text-slate-600 mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          We're now scanning your email for purchase confirmations. This might take a few minutes.
        </p>

        {/* Connected Account Info */}
        {connectedAccount && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm mb-8 animate-slide-in-right" style={{ animationDelay: '0.2s' }}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">📧</span>
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-slate-900">{connectedAccount.email}</h3>
                  <p className="text-sm text-slate-600">{connectedAccount.provider}</p>
                </div>
                <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* What's Next */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 mb-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <h3 className="font-semibold text-slate-900 mb-4">What happens next?</h3>
          <div className="space-y-3 text-left">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="text-xs">1</span>
              </div>
              <p className="text-sm text-slate-600">We'll scan your recent emails for purchases</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="text-xs">2</span>
              </div>
              <p className="text-sm text-slate-600">Your purchases will appear in your dashboard</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="text-xs">3</span>
              </div>
              <p className="text-sm text-slate-600">Swipe to manage returns and track refunds</p>
            </div>
          </div>
        </div>

        <Button 
          onClick={onContinue}
          className="w-full gradient-primary text-white font-semibold py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] animate-fade-in-up"
          style={{ animationDelay: '0.4s' }}
        >
          Continue to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default ConnectionSuccessScreen;
