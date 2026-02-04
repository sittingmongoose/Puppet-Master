import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import express from 'express';
import request from 'supertest';
import {
  createAuthMiddleware,
  createAuthStatusHandler,
  generateAuthToken,
  getOrCreateAuthToken,
  isLoopbackRequest,
  loadAuthToken,
  saveAuthToken,
} from './auth-middleware.js';

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
      const app = express();
      app.get('/test', (req, res) => {
        res.json({ isLoopback: isLoopbackRequest(req) });
      });

      // Test with supertest (appears as loopback)
      return request(app)
        .get('/test')
        .expect(200)
        .then(res => {
          expect(res.body.isLoopback).toBe(true);
        });
    });

    it('does not trust req.ip when trust proxy is disabled', () => {
      const req = {
        app: { get: () => false },
        ip: '127.0.0.1',
        socket: { remoteAddress: '203.0.113.10' },
      } as unknown as express.Request;

      expect(isLoopbackRequest(req)).toBe(false);
    });

    it('uses req.ip when trust proxy is enabled', () => {
      const req = {
        app: { get: () => true },
        ip: '127.0.0.1',
        socket: { remoteAddress: '203.0.113.10' },
      } as unknown as express.Request;

      expect(isLoopbackRequest(req)).toBe(true);
    });
  });

  describe('createAuthStatusHandler', () => {
    it('returns token for loopback requests when auth enabled', async () => {
      const app = express();
      app.get('/api/auth/status', createAuthStatusHandler({
        enabled: true,
        token: 'test-token-123',
        tokenPath: '/path/to/token',
      }));

      const res = await request(app).get('/api/auth/status').expect(200);
      expect(res.body).toMatchObject({
        enabled: true,
        tokenPath: '/path/to/token',
        token: 'test-token-123', // Should return token for loopback
      });
    });

    it('does not return token when auth disabled', async () => {
      const app = express();
      app.get('/api/auth/status', createAuthStatusHandler({
        enabled: false,
        token: 'test-token-123',
        tokenPath: '/path/to/token',
      }));

      const res = await request(app).get('/api/auth/status').expect(200);
      expect(res.body).toMatchObject({
        enabled: false,
        tokenPath: '/path/to/token',
      });
      expect(res.body.token).toBeUndefined();
    });

    it('exposes token remotely when exposeTokenRemotely is true', async () => {
      const app = express();
      // Simulate non-loopback by setting trust proxy and X-Forwarded-For
      app.set('trust proxy', true);
      app.get('/api/auth/status', createAuthStatusHandler({
        enabled: true,
        token: 'test-token-123',
        tokenPath: '/path/to/token',
        exposeTokenRemotely: true,
      }));

      // Even with non-loopback IP, token should be exposed
      const res = await request(app)
        .get('/api/auth/status')
        .set('X-Forwarded-For', '192.168.1.100')
        .expect(200);
      
      expect(res.body).toMatchObject({
        enabled: true,
        token: 'test-token-123',
      });
    });
  });

  describe('createAuthMiddleware', () => {
    it('allows all requests when disabled', async () => {
      const app = express();
      app.use(createAuthMiddleware({ enabled: false }));
      app.get('/api/test', (_req, res) => res.json({ ok: true }));

      await request(app).get('/api/test').expect(200, { ok: true });
    });

    it('allows non-API routes without token', async () => {
      const app = express();
      app.use(createAuthMiddleware({ enabled: true, token: 't' }));
      app.get('/health', (_req, res) => res.json({ ok: true }));

      await request(app).get('/health').expect(200, { ok: true });
    });

    it('allows /api/auth/* without token', async () => {
      const app = express();
      app.use(createAuthMiddleware({ enabled: true, token: 't' }));
      app.get('/api/auth/status', (_req, res) => res.json({ ok: true }));

      await request(app).get('/api/auth/status').expect(200, { ok: true });
    });

    it('rejects missing Authorization header for /api/*', async () => {
      const app = express();
      app.use(createAuthMiddleware({ enabled: true, token: 't' }));
      app.get('/api/test', (_req, res) => res.json({ ok: true }));

      const res = await request(app).get('/api/test').expect(401);
      expect(res.body).toMatchObject({
        code: 'AUTH_REQUIRED',
      });
    });

    it('allows /api/events/* with token query param (EventSource compatibility)', async () => {
      const app = express();
      app.use(createAuthMiddleware({ enabled: true, token: 't' }));
      app.get('/api/events/stream', (_req, res) => res.json({ ok: true }));

      await request(app)
        .get('/api/events/stream?token=t')
        .expect(200, { ok: true });
    });

    it('rejects /api/events/* with invalid token query param', async () => {
      const app = express();
      app.use(createAuthMiddleware({ enabled: true, token: 't' }));
      app.get('/api/events/stream', (_req, res) => res.json({ ok: true }));

      const res = await request(app)
        .get('/api/events/stream?token=wrong')
        .expect(401);

      expect(res.body).toMatchObject({
        code: 'INVALID_TOKEN',
      });
    });

    it('rejects invalid Authorization header format', async () => {
      const app = express();
      app.use(createAuthMiddleware({ enabled: true, token: 't' }));
      app.get('/api/test', (_req, res) => res.json({ ok: true }));

      const res = await request(app)
        .get('/api/test')
        .set('Authorization', 'Token t')
        .expect(401);

      expect(res.body).toMatchObject({
        code: 'INVALID_AUTH_FORMAT',
      });
    });

    it('rejects invalid token', async () => {
      const app = express();
      app.use(createAuthMiddleware({ enabled: true, token: 't' }));
      app.get('/api/test', (_req, res) => res.json({ ok: true }));

      const res = await request(app)
        .get('/api/test')
        .set('Authorization', 'Bearer wrong')
        .expect(401);

      expect(res.body).toMatchObject({
        code: 'INVALID_TOKEN',
      });
    });

    it('allows valid token', async () => {
      const app = express();
      app.use(createAuthMiddleware({ enabled: true, token: 't' }));
      app.get('/api/test', (_req, res) => res.json({ ok: true }));

      await request(app)
        .get('/api/test')
        .set('Authorization', 'Bearer t')
        .expect(200, { ok: true });
    });
  });
});
