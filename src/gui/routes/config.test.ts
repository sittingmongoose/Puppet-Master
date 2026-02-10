import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';

const getCursorModelsWithDiscoveryMock = vi.fn();

vi.mock('../../platforms/cursor-models.js', async () => {
  const actual = await vi.importActual<typeof import('../../platforms/cursor-models.js')>('../../platforms/cursor-models.js');
  return {
    ...actual,
    getCursorModelsWithDiscovery: (...args: unknown[]) => getCursorModelsWithDiscoveryMock(...args),
  };
});

import { createConfigRoutes } from './config.js';

function getFirstRouteHandler(router: unknown, path: string, method: string): (req: Request, res: Response, next: NextFunction) => unknown {
  // Express internals: Router has .stack, each layer may have .route with .path and methods.
  // This keeps tests in-process (no network listen), which is required in some sandboxes.
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

function createMockReq(overrides?: Partial<Request>): Request {
  return {
    query: {},
    headers: {},
    method: 'GET',
    path: '/api/config/models',
    ...overrides,
  } as unknown as Request;
}

function createMockRes() {
  const res = {
    headersSent: false,
    statusCode: 200,
    body: undefined as unknown,
    setHeader: vi.fn(),
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

describe('config routes', () => {
  beforeEach(() => {
    getCursorModelsWithDiscoveryMock.mockReset();
  });

  it('uses Cursor model discovery on non-refresh loads (best-effort)', async () => {
    getCursorModelsWithDiscoveryMock.mockResolvedValue([
      { id: 'auto', label: 'Auto', source: 'discovered' },
      { id: 'composer-1', label: 'Composer 1', source: 'discovered' },
    ]);

    const router = createConfigRoutes();
    const handler = getFirstRouteHandler(router, '/config/models', 'get');

    const req = createMockReq({ query: {} });
    const res = createMockRes();
    await handler(req, res, (() => undefined) as unknown as NextFunction);

    expect(res.statusCode).toBe(200);
    expect(getCursorModelsWithDiscoveryMock).toHaveBeenCalled();
    const body = res.body as { cursor?: unknown };
    expect(Array.isArray(body.cursor)).toBe(true);
    expect((body.cursor as Array<{ id: string }>).some((m) => m.id === 'composer-1')).toBe(true);
  });
});

