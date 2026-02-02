/**
 * First Boot Detection Hook
 * 
 * Checks if this is the first time the GUI is being used.
 * Shows setup wizard if config or capabilities are missing.
 */

import { useState, useEffect } from 'react';

/**
 * First boot status
 */
export interface FirstBootStatus {
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
export function useFirstBoot(): FirstBootStatus {
  const [status, setStatus] = useState<FirstBootStatus>({
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
        const response = await fetch('/api/platforms/first-boot');
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json() as {
          isFirstBoot: boolean;
          missingConfig: boolean;
          missingCapabilities: boolean;
        };

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
