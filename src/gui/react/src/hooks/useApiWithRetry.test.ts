import { describe, it, expect, vi } from 'vitest';
import { fetchWithRetry } from './useApiWithRetry.js';

describe('fetchWithRetry', () => {
  it('returns result on first success', async () => {
    const fn = vi.fn().mockResolvedValue('data');
    const result = await fetchWithRetry(fn);
    expect(result).toBe('data');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on retryable network error and succeeds', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('Failed to fetch'))
      .mockResolvedValueOnce('data');
    const result = await fetchWithRetry(fn);
    expect(result).toBe('data');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('throws after max retries on persistent failure', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('Failed to fetch'));
    await expect(fetchWithRetry(fn, { maxRetries: 2 })).rejects.toThrow('Failed to fetch');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('does not retry on non-network errors', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('Validation error'));
    await expect(fetchWithRetry(fn)).rejects.toThrow('Validation error');
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
