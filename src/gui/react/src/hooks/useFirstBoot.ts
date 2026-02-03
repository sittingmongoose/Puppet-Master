/**
 * First Boot Detection Hook
 * 
 * Checks if this is the first time the GUI is being used.
 * Shows setup wizard if config or capabilities are missing.
 */

import { useState, useEffect } from 'react';
import { api } from '@/lib';

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
}

/**
 * Hook to detect first boot status
 * 
 * @returns First boot status object
 */
export function useFirstBoot(): FirstBootResult {
  const [status, setStatus] = useState<FirstBootResult>({
    isFirstBoot: false,
    missingConfig: false,
    missingCapabilities: false,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    const checkFirstBoot = async () => {
      try {
        const data = await api.getFirstBootStatus();

        if (!cancelled) {
          setStatus({
            isFirstBoot: data.isFirstBoot,
            missingConfig: data.missingConfig,
            missingCapabilities: data.missingCapabilities,
            isLoading: false,
            error: null,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setStatus({
            isFirstBoot: false,
            missingConfig: false,
            missingCapabilities: false,
            isLoading: false,
            error: err instanceof Error ? err.message : 'Failed to check first boot status',
          });
        }
      }
    };

    checkFirstBoot();

    return () => {
      cancelled = true;
    };
  }, []);

  return status;
}
