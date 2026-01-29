import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes';
import { Header } from '@/components/layout';
import { ToastProvider } from '@/components/ui';
import { ErrorBoundary } from '@/components/shared';
import { PlatformSetupWizard } from '@/components/wizard';
import { useUIStore } from '@/stores';
import { useFirstBoot } from '@/hooks';
import { useState, useEffect } from 'react';

export function App() {
  const { theme, toggleTheme } = useUIStore();
  const firstBoot = useFirstBoot();
  const [showWizard, setShowWizard] = useState(false);
  const [wizardCompleted, setWizardCompleted] = useState(false);

  // Show wizard on first boot
  useEffect(() => {
    if (!firstBoot.isLoading && firstBoot.isFirstBoot && !wizardCompleted) {
      setShowWizard(true);
    }
  }, [firstBoot.isLoading, firstBoot.isFirstBoot, wizardCompleted]);

  const handleWizardComplete = () => {
    setWizardCompleted(true);
    setShowWizard(false);
    // Reload page to refresh config
    window.location.reload();
  };

  const handleWizardSkip = () => {
    setWizardCompleted(true);
    setShowWizard(false);
  };

  return (
    <ErrorBoundary>
      <ToastProvider>
        <BrowserRouter>
          <div className="min-h-screen">
            <Header
              isDark={theme === 'dark'}
              onThemeToggle={toggleTheme}
            />
            <main className="p-xl pt-0">
              <AppRoutes />
            </main>
          </div>
          <PlatformSetupWizard
            isOpen={showWizard}
            onComplete={handleWizardComplete}
            onSkip={handleWizardSkip}
          />
        </BrowserRouter>
      </ToastProvider>
    </ErrorBoundary>
  );
}
