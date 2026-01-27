/**
 * Plan Detection Integration Tests
 * 
 * Tests for PlanDetectionService.
 * 
 * These tests verify:
 * - Plan detection works for all platforms
 * - Manual config is respected
 * - API-based detection works (when mocked)
 * - Quota inference works correctly
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PlanDetectionService } from '../../src/platforms/usage/plan-detection.js';
import { UsageProvider } from '../../src/platforms/usage/usage-provider.js';

// Mock fetch for API calls
const mockFetch = vi.fn();
global.fetch = mockFetch as unknown as typeof fetch;

describe('Plan Detection Service', () => {
  let usageProvider: UsageProvider;
  let planDetection: PlanDetectionService;

  beforeEach(() => {
    vi.clearAllMocks();
    usageProvider = new UsageProvider({
      claudeApiKey: 'test-claude-key',
      copilotToken: 'test-copilot-token',
      geminiProjectId: 'test-project',
    });
    planDetection = new PlanDetectionService(usageProvider);
  });

  describe('Claude Plan Detection', () => {
    it('should detect plan from API when available', async () => {
      const mockResponse = {
        organization_id: 'org-123',
        customer_type: 'organization',
        subscription_type: 'pro',
        usage: {
          total_requests: 100,
          total_tokens: 50000,
          period_start: '2026-01-26T00:00:00Z',
          period_end: '2026-01-26T23:59:59Z',
        },
        quota: {
          request_limit: 1000,
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const plan = await planDetection.detectPlan('claude', { organizationId: 'org-123' });

      expect(plan).not.toBeNull();
      expect(plan?.platform).toBe('claude');
      expect(plan?.customerType).toBe('organization');
      expect(plan?.subscriptionType).toBe('pro');
      expect(plan?.detectedFrom).toBe('api');
    });

    it('should return null when API fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
      });

      const plan = await planDetection.detectPlan('claude');
      expect(plan).toBeNull();
    });
  });

  describe('Codex Plan Detection', () => {
    it('should use manual config when provided', async () => {
      const plan = await planDetection.detectPlan('codex', {
        manualConfig: {
          tier: 'plus',
          customerType: 'individual',
          subscriptionType: 'codex-plus',
        },
      });

      expect(plan).not.toBeNull();
      expect(plan?.platform).toBe('codex');
      expect(plan?.tier).toBe('plus');
      expect(plan?.customerType).toBe('individual');
      expect(plan?.subscriptionType).toBe('codex-plus');
      expect(plan?.detectedFrom).toBe('manual-config');
    });

    it('should return null when no manual config provided', async () => {
      const plan = await planDetection.detectPlan('codex');
      expect(plan).toBeNull();
    });
  });

  describe('Gemini Plan Detection', () => {
    it('should detect plan from quota limits', async () => {
      const mockResponse = {
        metrics: [
          {
            name: 'projects/test-project/locations/us-central1/consumerQuotaMetrics/generativelanguage.googleapis.com/requests_per_hour',
            consumerQuotaLimits: [{
              limit: 60,
              used: 10,
            }],
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const plan = await planDetection.detectPlan('gemini', { location: 'us-central1' });

      // Gemini plan detection infers from quota limits
      // Higher limits = higher tier
      expect(plan).not.toBeNull();
      expect(plan?.platform).toBe('gemini');
      expect(plan?.detectedFrom).toBe('quota-limits');
      expect(plan?.tier).toBe('free'); // 60 limit = free tier
    });

    it('should return null when quota API fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
      });

      const plan = await planDetection.detectPlan('gemini');
      expect(plan).toBeNull();
    });
  });

  describe('Copilot Plan Detection', () => {
    it('should detect plan from metrics API', async () => {
      const mockResponse = {
        organization: 'test-org',
        metrics: {
          total_requests: 200,
          premium_requests_used: 100,
          premium_requests_limit: 500,
          period_start: '2026-01-01T00:00:00Z',
          period_end: '2026-01-31T23:59:59Z',
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const plan = await planDetection.detectPlan('copilot', { org: 'test-org' });

      expect(plan).not.toBeNull();
      expect(plan?.platform).toBe('copilot');
      expect(plan?.detectedFrom).toBe('quota-limits');
      expect(plan?.tier).toBe('team'); // 500 limit = team tier
    });
  });

  describe('Cursor Plan Detection', () => {
    it('should use manual config when provided', async () => {
      const plan = await planDetection.detectPlan('cursor', {
        manualConfig: {
          tier: 'pro',
          customerType: 'individual',
        },
      });

      expect(plan).not.toBeNull();
      expect(plan?.platform).toBe('cursor');
      expect(plan?.tier).toBe('pro');
      expect(plan?.customerType).toBe('individual');
      expect(plan?.detectedFrom).toBe('manual-config');
    });

    it('should return null when no manual config provided', async () => {
      const plan = await planDetection.detectPlan('cursor');
      expect(plan).toBeNull();
    });
  });

  describe('detectAllPlans', () => {
    it('should detect plans for all platforms', async () => {
      // Mock Claude API
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          organization_id: 'org-123',
          customer_type: 'organization',
          subscription_type: 'pro',
          usage: { total_requests: 100, total_tokens: 50000, period_start: '2026-01-26T00:00:00Z', period_end: '2026-01-26T23:59:59Z' },
          quota: { request_limit: 1000 },
        }),
      });

      // Mock Copilot API
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          organization: 'test-org',
          metrics: {
            total_requests: 200,
            premium_requests_used: 100,
            premium_requests_limit: 500,
            period_start: '2026-01-01T00:00:00Z',
            period_end: '2026-01-31T23:59:59Z',
          },
        }),
      });

      // Mock Gemini API
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          metrics: [{
            name: 'projects/test-project/locations/us-central1/consumerQuotaMetrics/generativelanguage.googleapis.com/requests_per_hour',
            consumerQuotaLimits: [{
              limit: 60,
              used: 10,
            }],
          }],
        }),
      });

      const plans = await planDetection.detectAllPlans({
        claude: { organizationId: 'org-123' },
        copilot: { org: 'test-org' },
        gemini: { location: 'us-central1' },
        codex: { manualConfig: { tier: 'plus', customerType: 'individual' } },
        cursor: { manualConfig: { tier: 'pro', customerType: 'individual' } },
      });

      expect(plans.size).toBeGreaterThan(0);
      expect(plans.get('claude')).not.toBeNull();
      expect(plans.get('codex')).not.toBeNull(); // From manual config
      expect(plans.get('cursor')).not.toBeNull(); // From manual config
    });
  });
});
