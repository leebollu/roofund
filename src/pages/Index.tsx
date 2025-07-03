
import React, { useState, useEffect } from 'react';
import WelcomeScreen from '@/components/WelcomeScreen';
import EmailConnectionForm from '@/components/EmailConnectionForm';
import ConnectionSuccessScreen from '@/components/ConnectionSuccessScreen';
import Dashboard from '@/components/Dashboard';
import { useEmailStore } from '@/store/useEmailStore';

type AppState = 'welcome' | 'connect-email' | 'connection-success' | 'dashboard';

const Index = () => {
  const { accounts } = useEmailStore();
  
  // Determine initial state based on whether user has connected accounts
  const [currentState, setCurrentState] = useState<AppState>('welcome');

  // Navigate to dashboard if accounts exist
  useEffect(() => {
    if (accounts.length > 0 && currentState === 'welcome') {
      setCurrentState('dashboard');
    }
  }, [accounts.length, currentState]);

  const handleGetStarted = () => {
    setCurrentState('connect-email');
  };

  const handleEmailConnected = () => {
    setCurrentState('connection-success');
  };

  const handleContinueToDashboard = () => {
    setCurrentState('dashboard');
  };

  const handleAddEmail = () => {
    setCurrentState('connect-email');
  };

  const handleBackToWelcome = () => {
    setCurrentState('welcome');
  };

  // Render the appropriate screen based on current state
  switch (currentState) {
    case 'welcome':
      return <WelcomeScreen onGetStarted={handleGetStarted} />;
    
    case 'connect-email':
      return (
        <EmailConnectionForm 
          onSuccess={handleEmailConnected}
          onBack={handleBackToWelcome}
        />
      );
    
    case 'connection-success':
      return <ConnectionSuccessScreen onContinue={handleContinueToDashboard} />;
    
    case 'dashboard':
      return <Dashboard onAddEmail={handleAddEmail} />;
    
    default:
      return <WelcomeScreen onGetStarted={handleGetStarted} />;
  }
};

export default Index;
