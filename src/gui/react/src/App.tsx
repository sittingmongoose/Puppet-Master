import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes';
import { Header } from '@/components/layout';
import { ToastProvider } from '@/components/ui';
import { ErrorBoundary } from '@/components/shared';
import { useUIStore } from '@/stores';

export function App() {
  const { theme, toggleTheme } = useUIStore();

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
        </BrowserRouter>
      </ToastProvider>
    </ErrorBoundary>
  );
}
