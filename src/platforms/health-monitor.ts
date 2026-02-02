/**
 * Platform Health Monitor (P2-T07)
 *
 * Periodically checks platform health and tracks per-platform status so the
 * orchestrator can avoid unhealthy platforms before executing critical tasks.
 *
 * Notes:
 * - Uses `PlatformHealthChecker` (CLI availability/version/capabilities) as the
 *   primary signal source.
 * - Tracks consecutive failures and transitions:
 *   - 0 failures: healthy
 *   - 1-2 failures: degraded
 *   - 3+ failures: unhealthy
 */
 
import type { Platform } from '../types/config.js';
import type { HealthCheckResult } from './health-check.js';
import { PlatformHealthChecker } from './health-check.js';
import { PlatformRegistry } from './registry.js';
 
export type HealthState = 'healthy' | 'degraded' | 'unhealthy';
 
export interface HealthStatus {
  platform: Platform;
  status: HealthState;
  latencyMs: number;
  lastCheck: Date;
  consecutiveFailures: number;
  lastError?: string;
}
 
export interface HealthMonitorConfig {
  /** Interval between checks (default: 30s). */
  checkIntervalMs?: number;
  /** Timeout for an individual check (default: 5s). */
  checkTimeoutMs?: number;
  /** Failures >= this => unhealthy (default: 3). */
  unhealthyThreshold?: number;
}
 
/**
 * HealthMonitor tracks platform health in-memory.
 *
 * It is designed to be long-lived (one per orchestrator run).
 */
export class HealthMonitor {
  private readonly registry: PlatformRegistry;
  private readonly checker: PlatformHealthChecker;
  private readonly config: Required<Pick<HealthMonitorConfig, 'checkIntervalMs' | 'checkTimeoutMs' | 'unhealthyThreshold'>>;
 
  private readonly health = new Map<Platform, HealthStatus>();
  private readonly timers = new Map<Platform, NodeJS.Timeout>();
  private readonly inFlightChecks = new Set<Platform>();
  private monitoring = false;
 
  constructor(params: {
    registry: PlatformRegistry;
    checker?: PlatformHealthChecker;
    config?: HealthMonitorConfig;
  }) {
    this.registry = params.registry;
    this.checker = params.checker ?? new PlatformHealthChecker();
    this.config = {
      checkIntervalMs: params.config?.checkIntervalMs ?? 30_000,
      checkTimeoutMs: params.config?.checkTimeoutMs ?? 5_000,
      unhealthyThreshold: params.config?.unhealthyThreshold ?? 3,
    };
  }
 
  async startMonitoring(platforms: Platform[]): Promise<void> {
    this.monitoring = true;
 
    for (const platform of platforms) {
      // Initialize an entry so callers can see "known but not yet checked".
      if (!this.health.has(platform)) {
        this.health.set(platform, {
          platform,
          status: 'healthy', // optimistic until first failure
          latencyMs: 0,
          lastCheck: new Date(0),
          consecutiveFailures: 0,
        });
      }
      this.scheduleChecks(platform);
    }
  }
 
  stopMonitoring(): void {
    this.monitoring = false;
    for (const timer of this.timers.values()) {
      clearInterval(timer);
    }
    this.timers.clear();
    this.inFlightChecks.clear();
  }
 
  getHealth(platform: Platform): HealthStatus | undefined {
    return this.health.get(platform);
  }
 
  getAllHealth(): Map<Platform, HealthStatus> {
    return new Map(this.health);
  }
 
  /**
   * A platform is considered routable if it is not explicitly marked unhealthy.
   * Unknown/unchecked platforms are treated as routable to avoid deadlocking.
   */
  isRoutable(platform: Platform): boolean {
    const status = this.health.get(platform);
    return status ? status.status !== 'unhealthy' : true;
  }
 
  isHealthy(platform: Platform): boolean {
    return this.health.get(platform)?.status === 'healthy';
  }
 
  /**
   * Prefer healthy, then degraded, then unknown/unseen.
   */
  pickBestPlatform(candidates: Platform[]): Platform | null {
    if (candidates.length === 0) {
      return null;
    }
 
    const byState = (p: Platform): number => {
      const s = this.health.get(p)?.status;
      if (s === 'healthy') return 0;
      if (s === 'degraded') return 1;
      if (s === 'unhealthy') return 3;
      return 2; // unknown
    };
 
    const sorted = [...candidates].sort((a, b) => byState(a) - byState(b));
    const best = sorted[0];
    return best ?? null;
  }
 
  async checkNow(platform: Platform): Promise<HealthStatus> {
    return await this.checkHealth(platform);
  }
 
  private scheduleChecks(platform: Platform): void {
    const existing = this.timers.get(platform);
    if (existing) {
      clearInterval(existing);
      this.timers.delete(platform);
    }
 
    // Do an initial check immediately.
    void this.checkHealth(platform).catch((error) => {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`[HealthMonitor] Initial check failed for ${platform}: ${message}`);
    });
 
    const timer = setInterval(() => {
      if (!this.monitoring) {
        clearInterval(timer);
        this.timers.delete(platform);
        return;
      }
      void this.checkHealth(platform).catch((error) => {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`[HealthMonitor] Periodic check failed for ${platform}: ${message}`);
      });
    }, this.config.checkIntervalMs);
 
    this.timers.set(platform, timer);
  }
 
  private async checkHealth(platform: Platform): Promise<HealthStatus> {
    // Avoid overlapping checks for the same platform.
    if (this.inFlightChecks.has(platform)) {
      return this.health.get(platform) ?? {
        platform,
        status: 'healthy',
        latencyMs: 0,
        lastCheck: new Date(0),
        consecutiveFailures: 0,
      };
    }
 
    this.inFlightChecks.add(platform);
    const start = Date.now();
 
    try {
      // Prefer runner-provided check if present (best-effort), otherwise use the checker.
      const runner = this.registry.get(platform) as unknown as { healthCheck?: () => Promise<void> } | undefined;
      const runRunnerHealthCheck = async (): Promise<HealthCheckResult> => {
        if (runner && typeof runner.healthCheck === 'function') {
          await runner.healthCheck();
          return { healthy: true, message: 'runner.healthCheck() succeeded' };
        }
        return await this.checker.checkPlatform(platform);
      };
 
      let timeoutId: NodeJS.Timeout | undefined;
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error(`Health check timed out after ${this.config.checkTimeoutMs}ms`));
        }, this.config.checkTimeoutMs);
      });

      let result: HealthCheckResult;
      try {
        result = await Promise.race([runRunnerHealthCheck(), timeoutPromise]);
      } finally {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      }
 
      const latencyMs = Date.now() - start;
      const previous = this.health.get(platform);
 
      const status: HealthStatus = result.healthy
        ? {
            platform,
            status: 'healthy',
            latencyMs,
            lastCheck: new Date(),
            consecutiveFailures: 0,
          }
        : this.buildFailureStatus(platform, previous, latencyMs, result.message);
 
      this.health.set(platform, status);
      return status;
    } catch (error) {
      const latencyMs = Date.now() - start;
      const previous = this.health.get(platform);
      const message = error instanceof Error ? error.message : String(error);
      const status = this.buildFailureStatus(platform, previous, latencyMs, message);
      this.health.set(platform, status);
      return status;
    } finally {
      this.inFlightChecks.delete(platform);
    }
  }
 
  private buildFailureStatus(
    platform: Platform,
    previous: HealthStatus | undefined,
    latencyMs: number,
    message: string
  ): HealthStatus {
    const failures = (previous?.consecutiveFailures ?? 0) + 1;
    const status: HealthState = failures >= this.config.unhealthyThreshold ? 'unhealthy' : 'degraded';
    return {
      platform,
      status,
      latencyMs,
      lastCheck: new Date(),
      consecutiveFailures: failures,
      lastError: message,
    };
  }
}

