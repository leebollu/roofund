
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  title?: string;
  headerAction?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  showHeader = true, 
  title = "ReturnTracker",
  headerAction 
}) => {
  return (
    <div className="mobile-container bg-slate-50 min-h-screen">
      {showHeader && (
        <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <span className="text-white font-bold text-sm">RT</span>
              </div>
              <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
            </div>
            {headerAction}
          </div>
        </header>
      )}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default Layout;
