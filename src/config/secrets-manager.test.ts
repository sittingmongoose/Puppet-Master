/**
 * Tests for SecretsManager (P2-T12)
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SecretsManager, SecretNotFoundError } from './secrets-manager.js';

describe('SecretsManager', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Reset env to a known baseline for each test.
    process.env = { ...originalEnv };
    delete process.env.OPENAI_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.CONTEXT7_API_KEY;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('loads secrets from process.env', () => {
    process.env.OPENAI_API_KEY = 'env-openai-key';

    const sm = new SecretsManager();
    sm.loadSecrets({ envFilePath: join(tmpdir(), 'does-not-exist.env') });

    expect(sm.getSecret('OPENAI_API_KEY')).toBe('env-openai-key');
  });

  it('loads secrets from .env when not present in process.env', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'pm-secrets-'));
    const envPath = join(dir, '.env');
    await mkdir(dir, { recursive: true });
    await writeFile(envPath, 'OPENAI_API_KEY=file-openai-key\n', 'utf-8');

    const sm = new SecretsManager();
    sm.loadSecrets({ envFilePath: envPath });

    expect(sm.getSecret('OPENAI_API_KEY')).toBe('file-openai-key');

    await rm(dir, { recursive: true, force: true });
  });

  it('does not override existing env vars by default', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'pm-secrets-'));
    const envPath = join(dir, '.env');
    await writeFile(envPath, 'OPENAI_API_KEY=file-openai-key\n', 'utf-8');

    process.env.OPENAI_API_KEY = 'env-openai-key';

    const sm = new SecretsManager();
    sm.loadSecrets({ envFilePath: envPath });

    expect(sm.getSecret('OPENAI_API_KEY')).toBe('env-openai-key');

    await rm(dir, { recursive: true, force: true });
  });

  it('throws SecretNotFoundError when missing', () => {
    const sm = new SecretsManager();
    sm.loadSecrets({ envFilePath: join(tmpdir(), 'does-not-exist.env') });

    expect(() => sm.getSecret('OPENAI_API_KEY')).toThrow(SecretNotFoundError);
  });

  it('masks secrets safely', () => {
    const sm = new SecretsManager();

    expect(sm.maskSecret('short')).toBe('***');
    expect(sm.maskSecret('  1234567890  ')).toBe('1234...7890');
  });
});

