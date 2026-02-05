/**
 * First Boot Detection Hook
 *
 * Checks if this is the first time the GUI is being used.
 * Shows setup wizard if config or capabilities are missing.
 * Retries on failure so the wizard can show even when the server is not ready yet.
 */

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib';

const MAX_RETRIES = 8;
const INITIAL_RETRY_DELAY_MS = 500;

/**
 * First boot status
 */
export interface FirstBootResult {
  /** Whether this is first boot */
  isFirstBoot: boolean;
  /** Whether config file is missing */
  missingConfig: boolean;
  /** Whether capabilities file is missing */
  missingCapabilities: boolean;
  /** Whether status is still loading */
  isLoading: boolean;
  /** Error message if check failed */
  error: string | null;
  /** Re-run the first-boot check (e.g. after "Retry" in wizard) */
  retry: () => void;
}

/**
 * Hook to detect first boot status
 *
 * @returns First boot status object
 */
type FirstBootState = Omit<FirstBootResult, 'retry'>;

export function useFirstBoot(): FirstBootResult {
  const [status, setStatus] = useState<FirstBootState>({
    isFirstBoot: false,
    missingConfig: false,
    missingCapabilities: false,
    isLoading: true,
    error: null,
  });

  const checkFirstBoot = useCallback(async () => {
    setStatus((prev) => (prev.isLoading ? prev : { ...prev, isLoading: true, error: null }));
    let lastError: string | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const data = await api.getFirstBootStatus();

        setStatus({
          isFirstBoot: data.isFirstBoot,
          missingConfig: data.missingConfig,
          missingCapabilities: data.missingCapabilities,
          isLoading: false,
          error: null,
        });
        return;
      } catch (err) {
        lastError = err instanceof Error ? err.message : 'Failed to check first boot status';
        const code = err && typeof err === 'object' ? (err as { code?: string }).code : undefined;
        // Treat "Load failed", network errors, and AUTH_NOT_INITIALIZED as transient
        const isTransient =
          lastError === 'Authentication not initialized' ||
          code === 'AUTH_NOT_INITIALIZED' ||
          lastError === 'Load failed' ||
          lastError === 'Failed to fetch' ||
          lastError.includes('NetworkError') ||
          lastError.includes('ECONNREFUSED');
        if (isTransient) {
          lastError = 'Server is starting, please wait...';
        }
        if (attempt < MAX_RETRIES) {
          // Exponential backoff: 500, 1000, 2000, 2000, 2000, ...
          const delay = Math.min(INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt - 1), 2000);
          await new Promise((r) => setTimeout(r, delay));
        }
      }
    }

    setStatus({
      isFirstBoot: true,
      missingConfig: true,
      missingCapabilities: false,
      isLoading: false,
      error: lastError,
    });
  }, []);

  // Defer first-boot check until document is ready (helps Linux/macOS WebView first paint).
  // Falls back to a short timeout so we don't wait indefinitely.
  useEffect(() => {
    const DEFER_FALLBACK_MS = 300;
    let done = false;

    const run = () => {
      if (done) return;
      done = true;
      checkFirstBoot();
    };

    if (typeof document !== 'undefined' && document.readyState === 'complete') {
      run();
      return;
    }

    const fallback = setTimeout(run, DEFER_FALLBACK_MS);
    if (typeof window !== 'undefined') {
      window.addEventListener('load', run);
      return () => {
        window.removeEventListener('load', run);
        clearTimeout(fallback);
      };
    }
    return () => clearTimeout(fallback);
  }, [checkFirstBoot]);

  return {
    ...status,
    retry: checkFirstBoot,
  };
}
