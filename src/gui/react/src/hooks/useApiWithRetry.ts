/**
 * Utility for API calls with retry on network errors.
 *
 * Retries transient network errors (e.g. "Failed to fetch", "NetworkError")
 * with exponential backoff. Use in page fetch logic.
 */

const MAX_RETRIES = 4;
const RETRY_DELAYS_MS = [500, 1000, 2000, 2000];

function isRetryableNetworkError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  const lower = msg.toLowerCase();
  return (
    lower.includes('failed to fetch') ||
    lower.includes('networkerror') ||
    lower.includes('load failed') ||
    lower.includes('econnrefused') ||
    lower.includes('backend not reachable')
  );
}

/**
 * Executes an async fetch with retry on network errors.
 *
 * @param fetchFn - Async function that returns the data
 * @param opts - Optional maxRetries (default 4)
 * @returns Promise that resolves with the data or throws after retries exhausted
 */
export async function fetchWithRetry<T>(
  fetchFn: () => Promise<T>,
  opts?: { maxRetries?: number }
): Promise<T> {
  const maxRetries = opts?.maxRetries ?? MAX_RETRIES;
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fetchFn();
    } catch (err) {
      lastError = err;
      const isRetryable = isRetryableNetworkError(err);
      if (isRetryable && attempt < maxRetries) {
        const delay = RETRY_DELAYS_MS[attempt - 1] ?? 2000;
        await new Promise((r) => setTimeout(r, delay));
      } else {
        throw err;
      }
    }
  }
  throw lastError;
}
