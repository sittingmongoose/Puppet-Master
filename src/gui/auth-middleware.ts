/**
 * Authentication Middleware for RWM Puppet Master GUI
 * 
 * P0-G07: Implements token-based authentication to secure API endpoints.
 * 
 * Security model:
 * - All API endpoints require a valid auth token (except /api/auth/*)
 * - Token is generated at server start and saved to .puppet-master/gui-token.txt
 * - Token must be passed via Authorization header: "Bearer <token>"
 * - Auth can be disabled via --no-auth flag for development
 */

import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { randomBytes } from 'crypto';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { existsSync } from 'fs';

/**
 * Authentication configuration.
 */
export interface AuthConfig {
  /** Whether authentication is enabled (default: true) */
  enabled: boolean;
  /** Path to store/read auth token (default: .puppet-master/gui-token.txt) */
  tokenPath?: string;
  /** Existing token to use (if not provided, generates new one) */
  token?: string;
}

/**
 * Generate a cryptographically secure random token.
 */
export function generateAuthToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Save auth token to file.
 */
export async function saveAuthToken(token: string, tokenPath: string): Promise<void> {
  const dir = dirname(tokenPath);
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
  await writeFile(tokenPath, token, 'utf-8');
  console.log(`[Auth] Token saved to: ${tokenPath}`);
}

/**
 * Load auth token from file.
 * Returns undefined if file doesn't exist.
 */
export async function loadAuthToken(tokenPath: string): Promise<string | undefined> {
  try {
    const token = await readFile(tokenPath, 'utf-8');
    return token.trim();
  } catch {
    return undefined;
  }
}

/**
 * Get or create auth token.
 * If token exists at tokenPath, loads it. Otherwise generates new one.
 */
export async function getOrCreateAuthToken(tokenPath: string): Promise<string> {
  const existing = await loadAuthToken(tokenPath);
  if (existing) {
    console.log(`[Auth] Using existing token from: ${tokenPath}`);
    return existing;
  }
  
  const token = generateAuthToken();
  await saveAuthToken(token, tokenPath);
  return token;
}

/**
 * Create authentication middleware.
 * 
 * When enabled:
 * - Allows requests to /api/auth/* without authentication
 * - Requires valid Bearer token for all other /api/* routes
 * - Returns 401 Unauthorized if token is missing or invalid
 * 
 * When disabled:
 * - All requests are allowed through
 * 
 * @param config - Authentication configuration
 */
export function createAuthMiddleware(config: AuthConfig): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    // If auth is disabled, allow all requests
    if (!config.enabled) {
      next();
      return;
    }
    
    // Allow auth-related endpoints without authentication
    if (req.path.startsWith('/api/auth/')) {
      next();
      return;
    }
    
    // Allow non-API routes (static files, etc.)
    if (!req.path.startsWith('/api/')) {
      next();
      return;
    }
    
    // Check for Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({
        error: 'Authentication required',
        code: 'AUTH_REQUIRED',
        hint: 'Include Authorization header with Bearer token',
      });
      return;
    }
    
    // Validate Bearer token format
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
      res.status(401).json({
        error: 'Invalid authorization format',
        code: 'INVALID_AUTH_FORMAT',
        hint: 'Use format: Authorization: Bearer <token>',
      });
      return;
    }
    
    const providedToken = parts[1];
    
    // Validate token
    if (providedToken !== config.token) {
      res.status(401).json({
        error: 'Invalid authentication token',
        code: 'INVALID_TOKEN',
      });
      return;
    }
    
    // Token is valid
    next();
  };
}

/**
 * Create auth status route handler.
 * Returns current auth configuration (enabled/disabled, token path).
 */
export function createAuthStatusHandler(config: AuthConfig): RequestHandler {
  return (_req: Request, res: Response): void => {
    res.json({
      enabled: config.enabled,
      tokenPath: config.tokenPath,
    });
  };
}
