import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import type { Request, Response, NextFunction } from 'express';
import {
  createAuthMiddleware,
  createAuthStatusHandler,
  generateAuthToken,
  getOrCreateAuthToken,
  isLoopbackRequest,
  loadAuthToken,
  saveAuthToken,
} from './auth-middleware.js';

function createMockReq(options?: {
  path?: string;
  method?: string;
  headers?: Record<string, string | undefined>;
  query?: Record<string, unknown>;
  trustProxy?: boolean;
  ip?: string;
  remoteAddress?: string;
}): Request {
  const trustProxy = options?.trustProxy ?? false;
  return {
    path: options?.path ?? '/api/test',
    method: options?.method ?? 'GET',
    headers: options?.headers ?? {},
    query: options?.query ?? {},
    app: { get: () => trustProxy } as unknown as Request['app'],
    ip: options?.ip ?? '127.0.0.1',
    socket: { remoteAddress: options?.remoteAddress ?? '127.0.0.1' } as Request['socket'],
  } as unknown as Request;
}

function createMockRes(): Response & { statusCode: number; body: unknown } {
  const res = {
    statusCode: 200,
    body: undefined as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
  };
  return res as unknown as Response & { statusCode: number; body: unknown };
}

describe('auth-middleware', () => {
  let testDir: string;

  beforeEach(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'pm-auth-test-'));
  });

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  it('generateAuthToken returns a 32-byte hex token', () => {
    const token = generateAuthToken();
    expect(token).toMatch(/^[0-9a-f]{64}$/);
  });

  it('saveAuthToken writes token and loadAuthToken reads it back', async () => {
    const tokenPath = join(testDir, 'gui-token.txt');
    await saveAuthToken('abc123', tokenPath);

    const loaded = await loadAuthToken(tokenPath);
    expect(loaded).toBe('abc123');

    // Confirm file exists (sanity check)
    const raw = await readFile(tokenPath, 'utf-8');
    expect(raw.trim()).toBe('abc123');
  });

  it('getOrCreateAuthToken creates token if missing, otherwise reuses existing', async () => {
    const tokenPath = join(testDir, 'gui-token.txt');

    const first = await getOrCreateAuthToken(tokenPath);
    expect(first).toMatch(/^[0-9a-f]{64}$/);

    const second = await getOrCreateAuthToken(tokenPath);
    expect(second).toBe(first);
  });

  describe('isLoopbackRequest', () => {
    it('identifies loopback requests correctly', () => {
      const req = createMockReq({
        trustProxy: false,
        ip: '203.0.113.10',
        remoteAddress: '127.0.0.1',
      });
      expect(isLoopbackRequest(req)).toBe(true);
    });

    it('does not trust req.ip when trust proxy is disabled', () => {
      const req = createMockReq({
        trustProxy: false,
        ip: '127.0.0.1',
        remoteAddress: '203.0.113.10',
      });

      expect(isLoopbackRequest(req)).toBe(false);
    });

    it('uses req.ip when trust proxy is enabled', () => {
      const req = createMockReq({
        trustProxy: true,
        ip: '127.0.0.1',
        remoteAddress: '203.0.113.10',
      });

      expect(isLoopbackRequest(req)).toBe(true);
    });
  });

  describe('createAuthStatusHandler', () => {
    it('returns token for loopback requests when auth enabled', async () => {
      const handler = createAuthStatusHandler({
        enabled: true,
        token: 'test-token-123',
        tokenPath: '/path/to/token',
      });

      const req = createMockReq({ path: '/api/auth/status', remoteAddress: '127.0.0.1' });
      const res = createMockRes();
      handler(req, res, (() => undefined) as unknown as NextFunction);
      expect(res.statusCode).toBe(200);
      expect(res.body).toMatchObject({
        enabled: true,
        tokenPath: '/path/to/token',
        token: 'test-token-123', // Should return token for loopback
      });
    });

    it('does not return token when auth disabled', async () => {
      const handler = createAuthStatusHandler({
        enabled: false,
        token: 'test-token-123',
        tokenPath: '/path/to/token',
      });

      const req = createMockReq({ path: '/api/auth/status', remoteAddress: '127.0.0.1' });
      const res = createMockRes();
      handler(req, res, (() => undefined) as unknown as NextFunction);
      expect(res.statusCode).toBe(200);
      expect(res.body).toMatchObject({
        enabled: false,
        tokenPath: '/path/to/token',
      });
      expect((res.body as { token?: unknown }).token).toBeUndefined();
    });

    it('exposes token remotely when exposeTokenRemotely is true', async () => {
      const handler = createAuthStatusHandler({
        enabled: true,
        token: 'test-token-123',
        tokenPath: '/path/to/token',
        exposeTokenRemotely: true,
      });

      // Simulate remote request by enabling trust proxy and setting req.ip to non-loopback.
      const req = createMockReq({
        path: '/api/auth/status',
        trustProxy: true,
        ip: '192.168.1.100',
        remoteAddress: '127.0.0.1',
      });
      const res = createMockRes();
      handler(req, res, (() => undefined) as unknown as NextFunction);
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toMatchObject({
        enabled: true,
        token: 'test-token-123',
      });
    });
  });

  describe('createAuthMiddleware', () => {
    it('allows all requests when disabled', async () => {
      const mw = createAuthMiddleware({ enabled: false });
      const req = createMockReq({ path: '/api/test' });
      const res = createMockRes();
      const next = vi.fn() as unknown as NextFunction;
      mw(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('allows non-API routes without token', async () => {
      const mw = createAuthMiddleware({ enabled: true, token: 't' });
      const req = createMockReq({ path: '/health' });
      const res = createMockRes();
      const next = vi.fn() as unknown as NextFunction;
      mw(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('allows /api/auth/* without token', async () => {
      const mw = createAuthMiddleware({ enabled: true, token: 't' });
      const req = createMockReq({ path: '/api/auth/status' });
      const res = createMockRes();
      const next = vi.fn() as unknown as NextFunction;
      mw(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('rejects missing Authorization header for /api/*', async () => {
      const mw = createAuthMiddleware({ enabled: true, token: 't' });
      const req = createMockReq({ path: '/api/test', headers: {} });
      const res = createMockRes();
      const next = vi.fn() as unknown as NextFunction;
      mw(req, res, next);
      expect(next).not.toHaveBeenCalled();
      expect(res.statusCode).toBe(401);
      expect(res.body).toMatchObject({
        code: 'AUTH_REQUIRED',
      });
    });

    it('allows /api/events/* with token query param (EventSource compatibility)', async () => {
      const mw = createAuthMiddleware({ enabled: true, token: 't' });
      const req = createMockReq({
        path: '/api/events/stream',
        method: 'GET',
        headers: {},
        query: { token: 't' },
      });
      const res = createMockRes();
      const next = vi.fn() as unknown as NextFunction;
      mw(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('rejects /api/events/* with invalid token query param', async () => {
      const mw = createAuthMiddleware({ enabled: true, token: 't' });
      const req = createMockReq({
        path: '/api/events/stream',
        method: 'GET',
        headers: {},
        query: { token: 'wrong' },
      });
      const res = createMockRes();
      const next = vi.fn() as unknown as NextFunction;
      mw(req, res, next);
      expect(next).not.toHaveBeenCalled();
      expect(res.statusCode).toBe(401);
      expect(res.body).toMatchObject({
        code: 'INVALID_TOKEN',
      });
    });

    it('rejects invalid Authorization header format', async () => {
      const mw = createAuthMiddleware({ enabled: true, token: 't' });
      const req = createMockReq({
        path: '/api/test',
        headers: { authorization: 'Token t' },
      });
      const res = createMockRes();
      const next = vi.fn() as unknown as NextFunction;
      mw(req, res, next);
      expect(next).not.toHaveBeenCalled();
      expect(res.statusCode).toBe(401);
      expect(res.body).toMatchObject({
        code: 'INVALID_AUTH_FORMAT',
      });
    });

    it('rejects invalid token', async () => {
      const mw = createAuthMiddleware({ enabled: true, token: 't' });
      const req = createMockReq({
        path: '/api/test',
        headers: { authorization: 'Bearer wrong' },
      });
      const res = createMockRes();
      const next = vi.fn() as unknown as NextFunction;
      mw(req, res, next);
      expect(next).not.toHaveBeenCalled();
      expect(res.statusCode).toBe(401);
      expect(res.body).toMatchObject({
        code: 'INVALID_TOKEN',
      });
    });

    it('allows valid token', async () => {
      const mw = createAuthMiddleware({ enabled: true, token: 't' });
      const req = createMockReq({
        path: '/api/test',
        headers: { authorization: 'Bearer t' },
      });
      const res = createMockRes();
      const next = vi.fn() as unknown as NextFunction;
      mw(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });
});
