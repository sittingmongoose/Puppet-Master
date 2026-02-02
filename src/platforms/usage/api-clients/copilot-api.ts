/**
 * GitHub Copilot Metrics API Client for Usage Tracking
 * 
 * Fetches usage data from GitHub Copilot Metrics API:
 * GET /orgs/{org}/copilot/metrics
 * 
 * Requires GITHUB_TOKEN with 'copilot:read' scope and organization access.
 */

import type { PlatformUsageInfo, PlanInfo } from '../types.js';

export interface CopilotMetricsResponse {
  /** Organization login */
  organization: string;
  /** Usage metrics */
  metrics: {
    /** Total requests */
    total_requests: number;
    /** Premium requests used */
    premium_requests_used: number;
    /** Premium requests limit */
    premium_requests_limit: number;
    /** Period start (ISO 8601) */
    period_start: string;
    /** Period end (ISO 8601) */
    period_end: string;
  };
}

/**
 * GitHub Copilot Metrics API client
 */
export class CopilotUsageApiClient {
  private token: string;
  private baseUrl: string;

  constructor(token?: string, baseUrl: string = 'https://api.github.com') {
    this.token = token || process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';
    this.baseUrl = baseUrl;
  }

  /**
   * Fetches usage metrics from GitHub Copilot Metrics API
   * 
   * @param org - Organization name
   * @returns Platform usage info or null if API call fails
   */
  async fetchMetrics(org: string): Promise<PlatformUsageInfo | null> {
    if (!this.token || !org) {
      return null;
    }

    try {
      const url = `${this.baseUrl}/orgs/${org}/copilot/metrics`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      });

      if (!response.ok) {
        // API may return 403 if insufficient permissions, 404 if org doesn't exist, etc.
        return null;
      }

      const data = (await response.json()) as CopilotMetricsResponse;

      // Premium requests reset monthly on the 1st at 00:00:00 UTC
      const now = new Date();
      const nextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0, 0));
      const resetsAt = nextMonth.toISOString();

      const usageInfo: PlatformUsageInfo = {
        platform: 'copilot',
        currentUsage: data.metrics.premium_requests_used,
        limit: data.metrics.premium_requests_limit,
        remaining: Math.max(0, data.metrics.premium_requests_limit - data.metrics.premium_requests_used),
        resetsAt,
        period: 'month',
        source: 'api',
        metadata: {
          organization: data.organization,
          totalRequests: data.metrics.total_requests,
          periodStart: data.metrics.period_start,
          periodEnd: data.metrics.period_end,
        },
      };

      return usageInfo;
    } catch (error) {
      // API call failed (network error, invalid response, etc.)
      return null;
    }
  }

  /**
   * Detects plan information from metrics (inferred from limits)
   */
  async detectPlan(org: string): Promise<PlanInfo | null> {
    const usageInfo = await this.fetchMetrics(org);
    if (!usageInfo) {
      return null;
    }

    // Infer tier from premium requests limit
    let tier: string | undefined;
    if (usageInfo.limit >= 1000) {
      tier = 'enterprise';
    } else if (usageInfo.limit >= 500) {
      tier = 'team';
    } else if (usageInfo.limit >= 200) {
      tier = 'pro';
    } else {
      tier = 'free';
    }

    return {
      platform: 'copilot',
      customerType: 'organization', // API is organization-level only
      tier,
      detectedFrom: 'quota-limits',
    };
  }
}
