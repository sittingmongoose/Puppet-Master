import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import express from 'express';
import request from 'supertest';
import {
  createAuthMiddleware,
  generateAuthToken,
  getOrCreateAuthToken,
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
