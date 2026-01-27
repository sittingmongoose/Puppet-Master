/**
 * Claude Admin API Client for Usage Tracking
 * 
 * Fetches usage data from Claude Admin API:
 * GET /v1/organizations/usage_report/claude_code
 * 
 * Requires ANTHROPIC_API_KEY with admin permissions.
 */

import type { PlatformUsageInfo, PlanInfo } from '../types.js';

export interface ClaudeUsageReportResponse {
  /** Organization ID */
  organization_id: string;
  /** Customer type */
  customer_type: 'individual' | 'organization';
  /** Subscription type */
  subscription_type: string;
  /** Usage data */
  usage: {
    /** Total requests */
    total_requests: number;
    /** Total tokens */
    total_tokens: number;
    /** Period start (ISO 8601) */
    period_start: string;
    /** Period end (ISO 8601) */
    period_end: string;
  };
  /** Quota information */
  quota?: {
    /** Request limit */
    request_limit?: number;
    /** Token limit */
    token_limit?: number;
    /** Reset time (ISO 8601) */
    resets_at?: string;
  };
}

/**
 * Claude Admin API client
 */
export class ClaudeUsageApiClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string, baseUrl: string = 'https://api.anthropic.com') {
    this.apiKey = apiKey || process.env.ANTHROPIC_API_KEY || '';
    this.baseUrl = baseUrl;
  }

  /**
   * Fetches usage report from Claude Admin API
   * 
   * @param organizationId - Optional organization ID (if not provided, uses default)
   * @returns Platform usage info or null if API call fails
   */
  async fetchUsageReport(organizationId?: string): Promise<PlatformUsageInfo | null> {
    if (!this.apiKey) {
      return null;
    }

    try {
      const url = organizationId
        ? `${this.baseUrl}/v1/organizations/${organizationId}/usage_report/claude_code`
        : `${this.baseUrl}/v1/organizations/usage_report/claude_code`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // API may return 403 if not admin, 404 if endpoint doesn't exist, etc.
        return null;
      }

      const data = (await response.json()) as ClaudeUsageReportResponse;

      // Extract usage info
      const usageInfo: PlatformUsageInfo = {
        platform: 'claude',
        currentUsage: data.usage.total_requests,
        limit: data.quota?.request_limit || 0,
        remaining: data.quota?.request_limit
          ? Math.max(0, data.quota.request_limit - data.usage.total_requests)
          : 0,
        resetsAt: data.quota?.resets_at || null,
        period: this.detectPeriod(data.usage.period_start, data.usage.period_end),
        tokens: {
          input: 0, // API doesn't break down input/output
          output: 0,
          total: data.usage.total_tokens,
        },
        source: 'api',
        metadata: {
          organizationId: data.organization_id,
          customerType: data.customer_type,
          subscriptionType: data.subscription_type,
          periodStart: data.usage.period_start,
          periodEnd: data.usage.period_end,
        },
      };

      return usageInfo;
    } catch (error) {
      // API call failed (network error, invalid response, etc.)
      return null;
    }
  }

  /**
   * Detects plan information from usage report
   */
  async detectPlan(organizationId?: string): Promise<PlanInfo | null> {
    const usageInfo = await this.fetchUsageReport(organizationId);
    if (!usageInfo || !usageInfo.metadata) {
      return null;
    }

    return {
      platform: 'claude',
      customerType: usageInfo.metadata.customerType as string,
      subscriptionType: usageInfo.metadata.subscriptionType as string,
      detectedFrom: 'api',
    };
  }

  /**
   * Detects quota period from start/end dates
   */
  private detectPeriod(start: string, end: string): 'hour' | 'day' | 'month' | 'unknown' {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffMs = endDate.getTime() - startDate.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours <= 1) {
      return 'hour';
    } else if (diffHours <= 24) {
      return 'day';
    } else if (diffHours <= 720) {
      return 'month';
    }
    return 'unknown';
  }
}
