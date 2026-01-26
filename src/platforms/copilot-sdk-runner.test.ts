import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PassThrough } from 'stream';
import { CopilotSdkRunner } from './copilot-sdk-runner.js';
import type { ExecutionRequest } from '../types/platforms.js';

describe('CopilotSdkRunner', () => {
  let capabilityService: { getCached: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    capabilityService = {
      getCached: vi.fn().mockResolvedValue(null),
    };
  });

  it('tracks custom tools via setter/getter', () => {
    const runner = new CopilotSdkRunner(capabilityService as never);
    runner.setCustomTools([{ name: 'tool', description: 'test', handler: async () => ({ ok: true }) }]);

    const tools = runner.getCustomTools();
    expect(tools).toHaveLength(1);
    expect(tools[0].name).toBe('tool');
  });

  it('spawns virtual process with streams', async () => {
    const runner = new CopilotSdkRunner(capabilityService as never);
    const request: ExecutionRequest = {
      prompt: 'hello',
      workingDirectory: '/tmp',
      nonInteractive: true,
    };

    const process = await runner.spawnFreshProcess(request);
    expect(process.pid).toBeGreaterThan(0);
    expect(process.stdout).toBeInstanceOf(PassThrough);
    expect(process.stderr).toBeInstanceOf(PassThrough);
    expect(process.stdin).toBeInstanceOf(PassThrough);
  });

  it('returns defaults when no cached capabilities', async () => {
    const runner = new CopilotSdkRunner(capabilityService as never);
    const capabilities = await runner.getCapabilities();
    expect(capabilities.streaming).toBe(true);
    expect(capabilities.fileAccess).toBe(true);
  });

  it('returns cached quota and cooldown when available', async () => {
    const cached = {
      quotaInfo: { remaining: 5, limit: 10, resetsAt: 'now', period: 'hour' },
      cooldownInfo: { active: true, endsAt: 'later', reason: 'rate limit' },
    };
    capabilityService.getCached.mockResolvedValue(cached);
    const runner = new CopilotSdkRunner(capabilityService as never);

    const quota = await runner.checkQuota();
    const cooldown = await runner.checkCooldown();

    expect(quota.remaining).toBe(5);
    expect(cooldown.active).toBe(true);
  });
});
