import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { AccountPanel } from './components/AccountPanel';
import { Dashboard } from './pages/Dashboard';
import { Alerts } from './pages/Alerts';
import { Investigation } from './pages/Investigation';
import { Accounts } from './pages/Accounts';
import { AccountDetails } from './pages/AccountDetails';
import { Transactions } from './pages/Transactions';
import { Cases } from './pages/Cases';
import { LiveMonitoring } from './pages/LiveMonitoring';

export const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>('/dashboard');
  const [selectedDrawerAccount, setSelectedDrawerAccount] = useState<string | null>(null);

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectAccount = (accountId: string) => {
    setSelectedDrawerAccount(accountId);
  };

  const handleNavigateToAccountDetail = (accountId: string) => {
    setSelectedDrawerAccount(null);
    setCurrentPath(`/accounts/${accountId}`);
  };

  const renderCurrentPage = () => {
    if (currentPath === '/dashboard') {
      return (
        <Dashboard
          onNavigate={handleNavigate}
          onSelectAccount={handleSelectAccount}
        />
      );
    }
    if (currentPath === '/alerts') {
      return (
        <Alerts
          onInvestigate={(alertId) => handleNavigate(`/investigation/${alertId}`)}
        />
      );
    }
    if (currentPath.startsWith('/investigation')) {
      const alertId = currentPath.split('/')[2] || 'ALT-DEMO-001';
      return (
        <Investigation
          alertId={alertId}
          onSelectAccount={handleSelectAccount}
          onNavigateToCases={() => handleNavigate('/cases')}
          onNavigateToTransactions={() => handleNavigate('/transactions')}
          onNavigateToAlerts={() => handleNavigate('/alerts')}
        />
      );
    }
    if (currentPath === '/accounts') {
      return (
        <Accounts
          onSelectAccount={(accId) => handleNavigateToAccountDetail(accId)}
        />
      );
    }
    if (currentPath.startsWith('/accounts/')) {
      const accountId = currentPath.split('/')[2] || 'Vikram Malhotra';
      return (
        <AccountDetails
          accountId={accountId}
          onSelectAccount={handleSelectAccount}
        />
      );
    }
    if (currentPath === '/transactions') {
      return (
        <Transactions
          onSelectAccount={handleSelectAccount}
        />
      );
    }
    if (currentPath === '/cases') {
      return (
        <Cases
          onSelectAccount={handleSelectAccount}
        />
      );
    }
    if (currentPath === '/live') {
      return (
        <LiveMonitoring
          onInvestigate={(alertId) => handleNavigate(`/investigation/${alertId}`)}
          onSelectAccount={handleSelectAccount}
        />
      );
    }

    return (
      <Dashboard
        onNavigate={handleNavigate}
        onSelectAccount={handleSelectAccount}
      />
    );
  };

  let pageTitle = 'Overview';
  if (currentPath === '/alerts') pageTitle = 'Alerts';
  else if (currentPath.startsWith('/investigation')) pageTitle = 'Investigate Network';
  else if (currentPath === '/accounts') pageTitle = 'Accounts';
  else if (currentPath.startsWith('/accounts/')) pageTitle = 'Account Intelligence Profile';
  else if (currentPath === '/transactions') pageTitle = 'Transactions';
  else if (currentPath === '/cases') pageTitle = 'Cases';
  else if (currentPath === '/live') pageTitle = 'Live Monitoring';

  return (
    <div className="min-h-screen bg-[#F5F6F8] text-slate-900 flex font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Sidebar */}
      <Sidebar
        currentPath={currentPath}
        onNavigate={handleNavigate}
        onDemoInjected={() => {}}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header title={pageTitle} />
        <main className="flex-1 overflow-y-auto">{renderCurrentPage()}</main>
      </div>

      {/* Slide-over Account Intelligence Drawer */}
      <AccountPanel
        accountId={selectedDrawerAccount}
        onClose={() => setSelectedDrawerAccount(null)}
        onNavigateToAccount={handleNavigateToAccountDetail}
      />
    </div>
  );
};

export default App;
