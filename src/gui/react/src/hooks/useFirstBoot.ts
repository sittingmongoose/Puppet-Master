/**
 * First Boot Detection Hook
 *
 * Checks if this is the first time the GUI is being used.
 * Shows setup wizard if config or capabilities are missing.
 * Retries on failure so the wizard can show even when the server is not ready yet.
 */

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib';

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 1500;

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
        if (
          lastError === 'Authentication not initialized' ||
          code === 'AUTH_NOT_INITIALIZED'
        ) {
          lastError = 'Server is starting, please wait...';
        }
        if (attempt < MAX_RETRIES) {
          await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
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

  // Defer API calls until document ready (helps Linux WebView first paint)
  useEffect(() => {
    const DOC_READY_FALLBACK_MS = 2000;
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

    const fallback = setTimeout(run, DOC_READY_FALLBACK_MS);
    if (typeof window !== 'undefined') {
      window.addEventListener('load', run);
      return () => {
        window.removeEventListener('load', run);
        clearTimeout(fallback);
      };
    }
    clearTimeout(fallback);
  }, [checkFirstBoot]);

  return {
    ...status,
    retry: checkFirstBoot,
  };
}
