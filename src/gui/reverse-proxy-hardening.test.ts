/**
 * Integration tests for reverse-proxy/mobile hardening features
 * 
 * Tests the security features:
 * - Trust proxy configuration
 * - Allowed origins allowlist
 * - Token exposure protection for non-loopback requests
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import request from 'supertest';
import { GuiServer } from './server.js';
import { EventBus } from '../logging/event-bus.js';

describe('reverse-proxy hardening', () => {
  let testDir: string;
  let server: GuiServer;
  let eventBus: EventBus;

  beforeEach(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'pm-proxy-test-'));
    eventBus = new EventBus();
  });

  afterEach(async () => {
    if (server) {
      await server.stop();
    }
    await rm(testDir, { recursive: true, force: true });
  });

  describe('token exposure protection', () => {
    it('exposes token to loopback requests by default', async () => {
      server = new GuiServer(
        {
          port: 0, // Random port
          host: 'localhost',
          authEnabled: true,
          authTokenPath: join(testDir, 'token.txt'),
          exposeTokenRemotely: false, // Default secure setting
        },
        eventBus
      );

      await server.initializeAuth();
      await server.start();

      const app = (server as any).app;
      const res = await request(app).get('/api/auth/status').expect(200);

      expect(res.body.enabled).toBe(true);
      expect(res.body.token).toBeDefined(); // Loopback should get token
      expect(res.body.token).toMatch(/^[0-9a-f]{64}$/);
    });

    it('does not expose token remotely by default', async () => {
      server = new GuiServer(
        {
          port: 0,
          host: 'localhost',
          authEnabled: true,
          authTokenPath: join(testDir, 'token.txt'),
          trustProxy: true, // Enable proxy support
          exposeTokenRemotely: false, // Secure default
        },
        eventBus
      );

      await server.initializeAuth();
      await server.start();

      const app = (server as any).app;
      
      // Simulate request from non-loopback IP via proxy
      const res = await request(app)
        .get('/api/auth/status')
        .set('X-Forwarded-For', '203.0.113.42') // Public IP
        .expect(200);

      expect(res.body.enabled).toBe(true);
      expect(res.body.token).toBeUndefined(); // Remote should NOT get token
    });

    it('exposes token remotely when explicitly enabled', async () => {
      server = new GuiServer(
        {
          port: 0,
          host: 'localhost',
          authEnabled: true,
          authTokenPath: join(testDir, 'token.txt'),
          trustProxy: true,
          exposeTokenRemotely: true, // Explicitly allow remote exposure
        },
        eventBus
      );

      await server.initializeAuth();
      await server.start();

      const app = (server as any).app;
      
      // Simulate request from non-loopback IP
      const res = await request(app)
        .get('/api/auth/status')
        .set('X-Forwarded-For', '203.0.113.42')
        .expect(200);

      expect(res.body.enabled).toBe(true);
      expect(res.body.token).toBeDefined(); // Remote SHOULD get token when enabled
      expect(res.body.token).toMatch(/^[0-9a-f]{64}$/);
    });
  });

  describe('trust proxy configuration', () => {
    it('respects trust proxy setting for IP detection', async () => {
      server = new GuiServer(
        {
          port: 0,
          host: 'localhost',
          authEnabled: true,
          authTokenPath: join(testDir, 'token.txt'),
          trustProxy: true,
        },
        eventBus
      );

      await server.initializeAuth();
      await server.start();

      const app = (server as any).app;
      expect(app.get('trust proxy')).toBe(true);
    });

    it('does not trust proxy headers by default', async () => {
      server = new GuiServer(
        {
          port: 0,
          host: 'localhost',
          authEnabled: true,
          authTokenPath: join(testDir, 'token.txt'),
          trustProxy: false, // Default
        },
        eventBus
      );

      await server.initializeAuth();
      await server.start();

      const app = (server as any).app;
      expect(app.get('trust proxy')).toBe(false);
    });
  });

  describe('allowed origins configuration', () => {
    it('uses allowedOrigins when provided', async () => {
      const allowedOrigins = ['https://app.example.com', 'https://mobile.example.com'];
      
      server = new GuiServer(
        {
          port: 0,
          host: 'localhost',
          authEnabled: false,
          allowedOrigins,
        },
        eventBus
      );

      await server.initializeAuth();
      await server.start();

      // Verify config is set correctly
      const config = (server as any).config;
      expect(config.allowedOrigins).toEqual(allowedOrigins);
    });

    it('falls back to corsOrigins when allowedOrigins not provided', async () => {
      const corsOrigins = ['http://localhost:3847'];
      
      server = new GuiServer(
        {
          port: 0,
          host: 'localhost',
          authEnabled: false,
          corsOrigins,
        },
        eventBus
      );

      await server.initializeAuth();
      await server.start();

      const config = (server as any).config;
      expect(config.allowedOrigins).toEqual(corsOrigins);
    });
  });
});
