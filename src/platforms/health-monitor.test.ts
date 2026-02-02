import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { HealthMonitor } from './health-monitor.js';
import { PlatformRegistry } from './registry.js';
import type { PlatformHealthChecker } from './health-check.js';

describe('HealthMonitor', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('tracks consecutive failures and transitions to unhealthy at threshold', async () => {
    const registry = new PlatformRegistry();
    const checkPlatform = vi.fn();
    const checker = { checkPlatform } as unknown as PlatformHealthChecker;

    // 3 consecutive failures => unhealthy
    checkPlatform.mockResolvedValue({ healthy: false, message: 'nope' });

    const monitor = new HealthMonitor({
      registry,
      checker,
      config: { unhealthyThreshold: 3, checkIntervalMs: 10_000, checkTimeoutMs: 5_000 },
    });

    const s1 = await monitor.checkNow('cursor');
    expect(s1.status).toBe('degraded');
    expect(s1.consecutiveFailures).toBe(1);

    const s2 = await monitor.checkNow('cursor');
    expect(s2.status).toBe('degraded');
    expect(s2.consecutiveFailures).toBe(2);

    const s3 = await monitor.checkNow('cursor');
    expect(s3.status).toBe('unhealthy');
    expect(s3.consecutiveFailures).toBe(3);
  });

  it('resets failures on success', async () => {
    const registry = new PlatformRegistry();
    const checkPlatform = vi.fn()
      .mockResolvedValueOnce({ healthy: false, message: 'fail' })
      .mockResolvedValueOnce({ healthy: true, message: 'ok' });
    const checker = { checkPlatform } as unknown as PlatformHealthChecker;

    const monitor = new HealthMonitor({
      registry,
      checker,
      config: { unhealthyThreshold: 3, checkIntervalMs: 10_000, checkTimeoutMs: 5_000 },
    });

    const degraded = await monitor.checkNow('cursor');
    expect(degraded.status).toBe('degraded');
    expect(degraded.consecutiveFailures).toBe(1);

    const healthy = await monitor.checkNow('cursor');
    expect(healthy.status).toBe('healthy');
    expect(healthy.consecutiveFailures).toBe(0);
  });

  it('runs an initial check and periodic checks, and stops cleanly', async () => {
    const registry = new PlatformRegistry();
    const checkPlatform = vi.fn().mockResolvedValue({ healthy: true, message: 'ok' });
    const checker = { checkPlatform } as unknown as PlatformHealthChecker;

    const monitor = new HealthMonitor({
      registry,
      checker,
      config: { checkIntervalMs: 1_000, checkTimeoutMs: 5_000, unhealthyThreshold: 3 },
    });

    await monitor.startMonitoring(['cursor']);
    // Let the initial (fire-and-forget) check complete.
    await vi.advanceTimersByTimeAsync(0);
    expect(checkPlatform).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1_000);
    expect(checkPlatform).toHaveBeenCalledTimes(2);

    monitor.stopMonitoring();
    await vi.advanceTimersByTimeAsync(5_000);

    // No additional calls after stop.
    expect(checkPlatform).toHaveBeenCalledTimes(2);
  });
});

