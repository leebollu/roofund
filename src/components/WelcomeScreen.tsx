
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onGetStarted }) => {
  const features = [
    {
      icon: '📧',
      title: 'Connect Your Email',
      description: 'Securely connect any email account to automatically find your purchases'
    },
    {
      icon: '📦',
      title: 'Track Purchases',
      description: 'All your online orders in one place, automatically organized'
    },
    {
      icon: '↩️',
      title: 'Manage Returns',
      description: 'Never miss a return deadline again with smart tracking'
    },
    {
      icon: '💰',
      title: 'Track Refunds',
      description: 'Get notified when refunds should arrive and track status'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50 flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12">
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl gradient-primary flex items-center justify-center shadow-lg">
            <span className="text-3xl text-white font-bold">RT</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Welcome to<br />
            <span className="text-transparent bg-clip-text gradient-primary">ReturnTracker</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-sm mx-auto leading-relaxed">
            Never lose track of your online purchases and returns again
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 gap-4 mb-12">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="bg-white/80 backdrop-blur-sm border-0 shadow-sm animate-slide-in-right"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">{feature.icon}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 mb-1">{feature.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{feature.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Button */}
        <div className="px-4 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <Button 
            onClick={onGetStarted}
            className="w-full gradient-primary text-white font-semibold py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
          >
            Get Started
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 pb-8 text-center">
        <p className="text-xs text-slate-500">
          Your email credentials are encrypted and stored securely on your device
        </p>
      </div>
    </div>
  );
};

export default WelcomeScreen;
