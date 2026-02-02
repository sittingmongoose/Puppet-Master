/**
 * SecretsManager
 *
 * Centralizes secure, local-only secrets handling for Puppet Master.
 *
 * Goals (P2-T12):
 * - Load secrets from environment variables (preferred)
 * - Optionally load from a local `.env` file (gitignored)
 * - Never write secrets to disk and never log secret values
 *
 * Notes:
 * - This module intentionally does NOT attempt to validate or “confirm” secrets via network calls.
 * - `.env` loading is best-effort and non-fatal when the file is missing.
 */

import { existsSync } from 'node:fs';
import dotenv from 'dotenv';

/**
 * Error thrown when a requested secret is missing.
 */
export class SecretNotFoundError extends Error {
  readonly name = 'SecretNotFoundError';

  constructor(public readonly key: string) {
    super(`Secret not found: ${key}`);
  }
}

/**
 * Supported secret keys that Puppet Master commonly relies on.
 *
 * This list is intentionally small and can be extended as new platforms are added.
 */
const DEFAULT_SECRET_KEYS = [
  'ANTHROPIC_API_KEY',
  'OPENAI_API_KEY',
  'CONTEXT7_API_KEY',
] as const;

export type KnownSecretKey = (typeof DEFAULT_SECRET_KEYS)[number];

export interface LoadSecretsOptions {
  /**
   * Path to the dotenv file to load.
   * Defaults to `.env` in the current working directory.
   */
  envFilePath?: string;
  /**
   * If true, dotenv will overwrite existing environment variables.
   * Default: false (env vars win over `.env`).
   */
  overrideExistingEnv?: boolean;
}

/**
 * Manages secrets as an in-memory map.
 */
export class SecretsManager {
  private readonly secrets = new Map<string, string>();

  /**
   * Loads secrets into memory.
   *
   * Order:
   * 1) Load `.env` (if present) into `process.env` (non-fatal if missing)
   * 2) Read selected secrets from `process.env` into the in-memory map
   */
  loadSecrets(options: LoadSecretsOptions = {}): void {
    const envFilePath = options.envFilePath ?? '.env';

    // Load `.env` only if it exists (local-only; no repo secrets).
    // Do not override real environment variables by default.
    if (existsSync(envFilePath)) {
      dotenv.config({
        path: envFilePath,
        override: options.overrideExistingEnv ?? false,
        quiet: true,
      });
    }

    // Populate the known keys (can still be overridden/extended via setSecret()).
    for (const key of DEFAULT_SECRET_KEYS) {
      const value = process.env[key];
      if (typeof value === 'string' && value.trim() !== '') {
        this.secrets.set(key, value);
      }
    }
  }

  /**
   * Explicitly set a secret value (in-memory only).
   */
  setSecret(key: string, value: string): void {
    if (value.trim() === '') {
      this.secrets.delete(key);
      return;
    }
    this.secrets.set(key, value);
  }

  /**
   * Get a secret value. Throws if missing.
   */
  getSecret(key: string): string {
    const value = this.secrets.get(key);
    if (!value) {
      throw new SecretNotFoundError(key);
    }
    return value;
  }

  /**
   * Get a secret value if present (no throw).
   */
  getOptionalSecret(key: string): string | undefined {
    const value = this.secrets.get(key);
    return value && value.trim() !== '' ? value : undefined;
  }

  /**
   * Mask a secret for display/logging.
   *
   * - If short: return `***`
   * - Else: return first 4 + `...` + last 4
   */
  maskSecret(value: string): string {
    const trimmed = value.trim();
    if (trimmed.length <= 8) {
      return '***';
    }
    return `${trimmed.slice(0, 4)}...${trimmed.slice(-4)}`;
  }
}

