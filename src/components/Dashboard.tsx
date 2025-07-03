
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Layout from './Layout';
import { useEmailStore } from '@/store/useEmailStore';

interface DashboardProps {
  onAddEmail: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onAddEmail }) => {
  const { accounts } = useEmailStore();

  return (
    <Layout 
      title="Dashboard"
      headerAction={
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onAddEmail}
          className="text-blue-600 border-blue-200 hover:bg-blue-50"
        >
          + Add Email
        </Button>
      }
    >
      <div className="px-6 py-8">
        {/* Connected Accounts */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Connected Accounts</h2>
          <div className="space-y-3">
            {accounts.map((account) => (
              <Card key={account.id} className="bg-white border-slate-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <span className="text-lg">📧</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-900">{account.email}</h3>
                      <p className="text-sm text-slate-600">{account.provider}</p>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Scanning Status */}
        <Card className="bg-gradient-to-r from-blue-50 to-emerald-50 border-0 mb-8">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Scanning Your Emails</h3>
            <p className="text-sm text-slate-600 mb-4">
              We're looking through your recent emails to find purchase confirmations. This may take a few minutes.
            </p>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '45%' }}></div>
            </div>
          </CardContent>
        </Card>

        {/* Coming Soon Features */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Coming Soon</h3>
          
          <Card className="bg-white border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <span className="text-lg">📦</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-slate-900">Purchase Tracking</h4>
                  <p className="text-sm text-slate-600">View all your recent purchases in one place</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                  <span className="text-lg">↩️</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-slate-900">Return Management</h4>
                  <p className="text-sm text-slate-600">Swipe to manage returns and track deadlines</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <span className="text-lg">💰</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-slate-900">Refund Tracking</h4>
                  <p className="text-sm text-slate-600">Get notified when refunds should arrive</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
