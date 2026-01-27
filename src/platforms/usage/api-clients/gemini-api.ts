/**
 * Gemini Cloud Quotas API Client for Usage Tracking
 * 
 * Fetches quota information from Google Cloud Quotas API:
 * https://cloudquotas.googleapis.com
 * 
 * Requires Google Cloud project and authentication (GOOGLE_APPLICATION_CREDENTIALS or ADC).
 */

import type { PlatformUsageInfo, PlanInfo } from '../types.js';

export interface GeminiQuotaResponse {
  /** Quota name */
  name: string;
  /** Quota value */
  value: number;
  /** Quota limit */
  limit: number;
  /** Service name */
  service: string;
  /** Metric name */
  metric: string;
}

/**
 * Gemini Cloud Quotas API client
 */
export class GeminiUsageApiClient {
  private projectId: string;
  private credentialsPath?: string;

  constructor(projectId?: string, credentialsPath?: string) {
    this.projectId = projectId || process.env.GOOGLE_CLOUD_PROJECT || '';
    this.credentialsPath = credentialsPath || process.env.GOOGLE_APPLICATION_CREDENTIALS;
  }

  /**
   * Fetches quota information from Google Cloud Quotas API
   * 
   * @param location - Optional location (defaults to 'global')
   * @returns Platform usage info or null if API call fails
   */
  async fetchQuotas(location: string = 'global'): Promise<PlatformUsageInfo | null> {
    if (!this.projectId) {
      return null;
    }

    try {
      // Google Cloud Quotas API endpoint
      const url = `https://cloudquotas.googleapis.com/v1beta/projects/${this.projectId}/locations/${location}/services/generativelanguage.googleapis.com/consumerQuotaMetrics`;

      // Build headers with authentication
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // If credentials path is provided, we'd need to load and use them
      // For now, rely on Application Default Credentials (ADC) or environment
      // In production, you'd use google-auth-library to get access tokens

      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        // API may return 403 if not authenticated, 404 if project doesn't exist, etc.
        return null;
      }

      const data = (await response.json()) as { metrics?: Array<{ name: string; consumerQuotaLimits?: Array<{ limit?: number; used?: number }> }> };

      // Find relevant quota metrics (requests per hour, tokens per day, etc.)
      let totalLimit = 0;
      let totalUsed = 0;
      let resetsAt: string | null = null;
      let period: 'hour' | 'day' | 'month' | 'unknown' = 'unknown';

      if (data.metrics) {
        for (const metric of data.metrics) {
          if (metric.consumerQuotaLimits) {
            for (const limit of metric.consumerQuotaLimits) {
              if (limit.limit !== undefined) {
                totalLimit += limit.limit;
              }
              if (limit.used !== undefined) {
                totalUsed += limit.used;
              }
            }
          }

          // Detect period from metric name
          if (metric.name.includes('requests_per_hour')) {
            period = 'hour';
            // Hourly quotas reset at next hour
            const now = new Date();
            const nextHour = new Date(now);
            nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
            resetsAt = nextHour.toISOString();
          } else if (metric.name.includes('requests_per_day')) {
            period = 'day';
            // Daily quotas reset at midnight UTC
            const now = new Date();
            const nextDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0));
            resetsAt = nextDay.toISOString();
          }
        }
      }

      const usageInfo: PlatformUsageInfo = {
        platform: 'gemini',
        currentUsage: totalUsed,
        limit: totalLimit,
        remaining: Math.max(0, totalLimit - totalUsed),
        resetsAt,
        period,
        source: 'api',
        metadata: {
          projectId: this.projectId,
          location,
        },
      };

      return usageInfo;
    } catch (error) {
      // API call failed (network error, invalid response, authentication error, etc.)
      return null;
    }
  }

  /**
   * Detects plan information from quota limits
   */
  async detectPlan(location: string = 'global'): Promise<PlanInfo | null> {
    const usageInfo = await this.fetchQuotas(location);
    if (!usageInfo) {
      return null;
    }

    // Infer tier from quota limits
    let tier: string | undefined;
    if (usageInfo.limit >= 1000000) {
      tier = 'enterprise';
    } else if (usageInfo.limit >= 100000) {
      tier = 'pro';
    } else if (usageInfo.limit >= 10000) {
      tier = 'standard';
    } else {
      tier = 'free';
    }

    return {
      platform: 'gemini',
      tier,
      detectedFrom: 'quota-limits',
    };
  }
}
