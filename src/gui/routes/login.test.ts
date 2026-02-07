import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const spawnMock = vi.fn();
const execSyncMock = vi.fn();

vi.mock('node:child_process', () => ({
  spawn: (...args: unknown[]) => spawnMock(...args),
  execSync: (...args: unknown[]) => execSyncMock(...args),
}));

import { createLoginRoutes } from './login.js';

function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use('/api', createLoginRoutes());
  return app;
}

function mockWhichAvailability(commands: string[]) {
  execSyncMock.mockImplementation((cmd: string) => {
    const parts = cmd.trim().split(/\s+/);
    const checkCmd = parts[0];
    const target = parts[1];
    if ((checkCmd === 'which' || checkCmd === 'where') && target) {
      if (commands.includes(target)) return '/mock/path';
      throw new Error(`not found: ${target}`);
    }
    if (cmd === 'gh auth status') {
      throw new Error('not authenticated');
    }
    return '';
  });
}

function createSpawnChild() {
  return {
    unref: vi.fn(),
    on: vi.fn(),
  };
}

describe('login routes', () => {
  beforeEach(() => {
    spawnMock.mockReset();
    execSyncMock.mockReset();
    spawnMock.mockImplementation(() => createSpawnChild());
  });

  it('uses Copilot CLI login command when copilot is available', async () => {
    mockWhichAvailability(['copilot']);
    const app = createTestApp();

    const res = await request(app).post('/api/login/copilot').expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.command).toBe('copilot login');
  });

  it('returns CLI_NOT_FOUND with checkedCommands when no compatible login command exists', async () => {
    mockWhichAvailability([]);
    const app = createTestApp();

    const res = await request(app).post('/api/login/copilot').expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('CLI_NOT_FOUND');
    expect(res.body.checkedCommands).toEqual(['copilot', 'gh']);
  });

  it('returns OAuth-first Gemini instructions', async () => {
    const app = createTestApp();

    const res = await request(app).get('/api/login/instructions/gemini').expect(200);

    expect(res.body.platform).toBe('gemini');
    expect(Array.isArray(res.body.instructions)).toBe(true);
    expect(res.body.instructions.join(' ')).toContain('Login with Google');
  });
});
