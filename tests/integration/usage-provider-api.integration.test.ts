/**
 * UsageProvider API Clients Integration Tests
 * 
 * Tests for API clients (Claude, Copilot, Gemini) used by UsageProvider.
 * 
 * These tests verify:
 * - API clients handle successful responses correctly
 * - API clients handle errors gracefully
 * - API clients return null when credentials are missing
 * - API clients parse responses correctly
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ClaudeUsageApiClient } from '../../src/platforms/usage/api-clients/claude-api.js';
import { CopilotUsageApiClient } from '../../src/platforms/usage/api-clients/copilot-api.js';
import { GeminiUsageApiClient } from '../../src/platforms/usage/api-clients/gemini-api.js';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch as unknown as typeof fetch;

describe('UsageProvider API Clients', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset environment variables
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.GITHUB_TOKEN;
    delete process.env.GH_TOKEN;
    delete process.env.GOOGLE_CLOUD_PROJECT;
    delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
  });

  describe('ClaudeUsageApiClient', () => {
    it('should return null when API key is missing', async () => {
      const client = new ClaudeUsageApiClient();
      const result = await client.fetchUsageReport();
      expect(result).toBeNull();
    });

    it('should return null when API returns 403 (forbidden)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ error: 'Forbidden' }),
      });

      const client = new ClaudeUsageApiClient('test-key');
      const result = await client.fetchUsageReport();
      expect(result).toBeNull();
    });

    it('should return null when API returns 404 (not found)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Not Found' }),
      });

      const client = new ClaudeUsageApiClient('test-key');
      const result = await client.fetchUsageReport();
      expect(result).toBeNull();
    });

    it('should parse successful API response correctly', async () => {
      const mockResponse = {
        organization_id: 'org-123',
        customer_type: 'organization',
        subscription_type: 'pro',
        usage: {
          total_requests: 150,
          total_tokens: 50000,
          period_start: '2026-01-26T00:00:00Z',
          period_end: '2026-01-26T23:59:59Z',
        },
        quota: {
          request_limit: 1000,
          token_limit: 1000000,
          resets_at: '2026-01-27T00:00:00Z',
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const client = new ClaudeUsageApiClient('test-key');
      const result = await client.fetchUsageReport();

      expect(result).not.toBeNull();
      expect(result?.platform).toBe('claude');
      expect(result?.currentUsage).toBe(150);
      expect(result?.limit).toBe(1000);
      expect(result?.remaining).toBe(850);
      expect(result?.resetsAt).toBe('2026-01-27T00:00:00Z');
      expect(result?.period).toBe('day');
      expect(result?.source).toBe('api');
      expect(result?.tokens?.total).toBe(50000);
      expect(result?.metadata?.organizationId).toBe('org-123');
      expect(result?.metadata?.customerType).toBe('organization');
      expect(result?.metadata?.subscriptionType).toBe('pro');
    });

    it('should detect plan information correctly', async () => {
      const mockResponse = {
        organization_id: 'org-123',
        customer_type: 'individual',
        subscription_type: 'basic',
        usage: {
          total_requests: 50,
          total_tokens: 10000,
          period_start: '2026-01-26T00:00:00Z',
          period_end: '2026-01-26T23:59:59Z',
        },
        quota: {
          request_limit: 100,
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const client = new ClaudeUsageApiClient('test-key');
      const plan = await client.detectPlan();

      expect(plan).not.toBeNull();
      expect(plan?.platform).toBe('claude');
      expect(plan?.customerType).toBe('individual');
      expect(plan?.subscriptionType).toBe('basic');
      expect(plan?.detectedFrom).toBe('api');
    });

    it('should handle network errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const client = new ClaudeUsageApiClient('test-key');
      const result = await client.fetchUsageReport();
      expect(result).toBeNull();
    });
  });

  describe('CopilotUsageApiClient', () => {
    it('should return null when token is missing', async () => {
      const client = new CopilotUsageApiClient();
      const result = await client.fetchMetrics('test-org');
      expect(result).toBeNull();
    });

    it('should return null when API returns error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Unauthorized' }),
      });

      const client = new CopilotUsageApiClient('test-token');
      const result = await client.fetchMetrics('test-org');
      expect(result).toBeNull();
    });

    it('should parse successful API response correctly', async () => {
      const mockResponse = {
        organization: 'test-org',
        metrics: {
          total_requests: 100,
          premium_requests_used: 45,
          premium_requests_limit: 500,
          period_start: '2026-01-01T00:00:00Z',
          period_end: '2026-01-31T23:59:59Z',
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const client = new CopilotUsageApiClient('test-token');
      const result = await client.fetchMetrics('test-org');

      expect(result).not.toBeNull();
      expect(result?.platform).toBe('copilot');
      expect(result?.currentUsage).toBe(45);
      expect(result?.limit).toBe(500);
      expect(result?.remaining).toBe(455);
      expect(result?.resetsAt).toBeTruthy(); // Calculated from current date
      expect(result?.period).toBe('month');
      expect(result?.source).toBe('api');
      expect(result?.metadata?.organization).toBe('test-org');
    });
  });

  describe('GeminiUsageApiClient', () => {
    it('should return null when project ID is missing', async () => {
      const client = new GeminiUsageApiClient();
      const result = await client.fetchQuotas('us-central1');
      expect(result).toBeNull();
    });

    it('should return null when API returns error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ error: { message: 'Permission denied' } }),
      });

      const client = new GeminiUsageApiClient('test-project');
      const result = await client.fetchQuotas('us-central1');
      expect(result).toBeNull();
    });

    it('should parse successful API response correctly', async () => {
      const mockResponse = {
        metrics: [
          {
            name: 'projects/test-project/locations/us-central1/consumerQuotaMetrics/generativelanguage.googleapis.com/requests_per_hour',
            consumerQuotaLimits: [
              {
                limit: 60,
                used: 45,
              },
            ],
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const client = new GeminiUsageApiClient('test-project');
      const result = await client.fetchQuotas('us-central1');

      expect(result).not.toBeNull();
      expect(result?.platform).toBe('gemini');
      expect(result?.currentUsage).toBe(45);
      expect(result?.limit).toBe(60);
      expect(result?.remaining).toBe(15);
      expect(result?.resetsAt).toBeTruthy(); // Calculated from current date
      expect(result?.period).toBe('hour'); // Detected from metric name
      expect(result?.source).toBe('api');
    });
  });
});
