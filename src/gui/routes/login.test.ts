import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { createLoginRoutes } from './login.js';

const spawnMock = vi.fn();
const execSyncMock = vi.fn();

vi.mock('node:child_process', () => ({
  spawn: (...args: unknown[]) => spawnMock(...args),
  execSync: (...args: unknown[]) => execSyncMock(...args),
}));

function getFirstRouteHandler(router: unknown, path: string, method: string): (req: Request, res: Response, next: NextFunction) => unknown {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stack = (router as any)?.stack as Array<any> | undefined;
  if (!Array.isArray(stack)) {
    throw new Error('Router stack not found; Express internals changed');
  }
  const layer = stack.find((l) => l?.route?.path === path && l?.route?.methods?.[method.toLowerCase()] === true);
  if (!layer?.route?.stack?.[0]?.handle) {
    throw new Error(`Route handler not found for ${method.toUpperCase()} ${path}`);
  }
  return layer.route.stack[0].handle as (req: Request, res: Response, next: NextFunction) => unknown;
}

function createMockRes() {
  const res = {
    headersSent: false,
    statusCode: 200,
    body: undefined as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.headersSent = true;
      this.body = payload;
      return this;
    },
  };
  return res as unknown as Response & { statusCode: number; body: unknown; headersSent: boolean };
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
    const router = createLoginRoutes();
    const handler = getFirstRouteHandler(router, '/login/*', 'post');

    const req = {
      method: 'POST',
      path: '/login/copilot',
      params: { 0: 'copilot' },
      body: {},
      query: {},
    } as unknown as Request;
    const res = createMockRes();
    await handler(req, res, (() => undefined) as unknown as NextFunction);

    expect(res.statusCode).toBe(200);
    expect((res.body as { success?: boolean }).success).toBe(true);
    expect((res.body as { command?: string }).command).toBe('copilot login');
  });

  it('returns CLI_NOT_FOUND with checkedCommands when no compatible login command exists', async () => {
    mockWhichAvailability([]);
    const router = createLoginRoutes();
    const handler = getFirstRouteHandler(router, '/login/*', 'post');

    const req = {
      method: 'POST',
      path: '/login/copilot',
      params: { 0: 'copilot' },
      body: {},
      query: {},
    } as unknown as Request;
    const res = createMockRes();
    await handler(req, res, (() => undefined) as unknown as NextFunction);

    expect(res.statusCode).toBe(400);
    expect((res.body as { success?: boolean }).success).toBe(false);
    expect((res.body as { code?: string }).code).toBe('CLI_NOT_FOUND');
    expect((res.body as { checkedCommands?: unknown }).checkedCommands).toEqual(['copilot', 'gh']);
  });

  it('returns OAuth-first Gemini instructions', async () => {
    const router = createLoginRoutes();
    const handler = getFirstRouteHandler(router, '/login/instructions/*', 'get');

    const req = {
      method: 'GET',
      path: '/login/instructions/gemini',
      params: { 0: 'gemini' },
      query: {},
    } as unknown as Request;
    const res = createMockRes();
    await handler(req, res, (() => undefined) as unknown as NextFunction);

    expect(res.statusCode).toBe(200);
    expect((res.body as { platform?: string }).platform).toBe('gemini');
    expect(Array.isArray((res.body as { instructions?: unknown }).instructions)).toBe(true);
    expect(((res.body as { instructions: string[] }).instructions).join(' ')).toContain('Login with Google');
  });
});

