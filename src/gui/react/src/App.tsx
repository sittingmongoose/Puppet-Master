import { BrowserRouter, useNavigate } from 'react-router-dom';
import { AppRoutes } from './routes';
import { Header } from '@/components/layout';
import { ToastProvider } from '@/components/ui';
import { ErrorBoundary } from '@/components/shared';
import { PlatformSetupWizard } from '@/components/wizard';
import { useUIStore } from '@/stores';
import { useFirstBoot } from '@/hooks';
import { useState, useEffect } from 'react';

/** Check if URL has platformSetup=1 (works on first paint before router) */
function hasPlatformSetupParam(): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('platformSetup') === '1';
}

function AppContent() {
  const { theme, toggleTheme } = useUIStore();
  const firstBoot = useFirstBoot();
  const navigate = useNavigate();
  const [showWizard, setShowWizard] = useState(hasPlatformSetupParam);
  const [wizardCompleted, setWizardCompleted] = useState(false);

  // Show wizard on first boot or when first-boot check failed (e.g. server not ready)
  useEffect(() => {
    if (showWizard) return; // Already open via URL param
    if (!firstBoot.isLoading && !wizardCompleted) {
      if (firstBoot.isFirstBoot || firstBoot.error) {
        setShowWizard(true);
      }
    }
  }, [firstBoot.isLoading, firstBoot.isFirstBoot, firstBoot.error, wizardCompleted, showWizard]);

  const handleWizardComplete = () => {
    setWizardCompleted(true);
    setShowWizard(false);
    if (hasPlatformSetupParam()) {
      // Clear URL param without full reload
      navigate(window.location.pathname || '/', { replace: true });
    }
    // Reload page to refresh config
    window.location.reload();
  };

  const handleWizardSkip = () => {
    setWizardCompleted(true);
    setShowWizard(false);
    if (hasPlatformSetupParam()) {
      navigate(window.location.pathname || '/', { replace: true });
    }
  };

  return (
    <>
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
        connectionError={firstBoot.error}
        onRetryConnection={firstBoot.retry}
      />
    </>
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </ToastProvider>
    </ErrorBoundary>
  );
}
