/**
 * API Client for RWM Puppet Master GUI
 * 
 * Provides typed API functions for all endpoints
 */

import type { StatusType, Platform, Project } from '@/types';
import type { TierItem, Progress } from '@/stores';

/**
 * API error class
 */
export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Normalize unknown error values into a readable message.
 * Provides actionable hints for common network errors (e.g. "Failed to fetch").
 */
export function getErrorMessage(error: unknown, fallback: string): string {
  const getMsg = (): string => {
    if (error instanceof Error && error.message) {
      const msg = error.message;
      // Provide actionable message for network errors
      if (
        msg.toLowerCase().includes('failed to fetch') ||
        msg.toLowerCase().includes('networkerror') ||
        msg.toLowerCase().includes('load failed')
      ) {
        return 'Backend not reachable. Ensure puppet-master gui is running on port 3847.';
      }
      return msg;
    }
    if (typeof error === 'string' && error.trim() !== '') {
      return error;
    }
    if (error && typeof error === 'object') {
      const maybeError = error as { error?: string; message?: string };
      if (typeof maybeError.error === 'string' && maybeError.error.trim() !== '') {
        return maybeError.error;
      }
      if (typeof maybeError.message === 'string' && maybeError.message.trim() !== '') {
        return maybeError.message;
      }
    }
    return fallback;
  };
  return getMsg();
}

/**
 * Resolve API base URL for both browser and Tauri (where window.location.origin may be tauri://...)
 */
export function getApiBaseUrl(): string {
  if (typeof window === 'undefined') return '';

  if (resolvedApiBaseUrl) {
    return resolvedApiBaseUrl;
  }

  const origin = window.location.origin;
  if (isDirectBackendOrigin(origin)) {
    resolvedApiBaseUrl = origin;
    // Persist direct backend origin so bundled desktop fallback can reconnect to the same port.
    setLocalStorageItem(API_BASE_STORAGE_KEY, origin);
    return origin;
  }

  const stored = getLocalStorageItem(API_BASE_STORAGE_KEY);
  if (stored) {
    return stored;
  }

  return DEFAULT_API_BASE_URL;
}

const DEFAULT_API_BASE_URL = 'http://127.0.0.1:3847';
const API_BASE_STORAGE_KEY = 'rwm-api-base-url';
const API_BASE_PORT_CANDIDATES = [3847, 3848, 3849, 3850, 3851, 3852, 3853, 3854, 3855, 3856, 3857];
const PUPPET_MASTER_APP_ID = 'rwm-puppet-master';
let resolvedApiBaseUrl: string | null = null;
let resolvingApiBaseUrlPromise: Promise<string> | null = null;

function getLocalStorageItem(key: string): string | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function setLocalStorageItem(key: string, value: string): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(key, value);
  } catch {
    // Ignore storage failures (private mode / blocked storage)
  }
}

function removeLocalStorageItem(key: string): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore storage failures
  }
}

/**
 * Tauri bundled windows can run from tauri.localhost or tauri://localhost.
 * Those origins are frontend asset origins, not the Node API origin.
 */
function isTauriBundledOrigin(origin: string): boolean {
  if (origin.startsWith('tauri://')) {
    return true;
  }

  try {
    const parsed = new URL(origin);
    const host = parsed.hostname.toLowerCase();
    return host === 'tauri.localhost' || host.endsWith('.tauri.localhost');
  } catch {
    return false;
  }
}

/**
 * Direct backend origin means the frontend is already loaded from the GUI server.
 * In that case API calls should stay same-origin.
 */
function isDirectBackendOrigin(origin: string): boolean {
  if (isTauriBundledOrigin(origin)) {
    return false;
  }
  return origin.startsWith('http://') || origin.startsWith('https://');
}

async function probeApiBase(baseUrl: string): Promise<boolean> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 400);

  try {
    const response = await fetch(`${baseUrl}/health`, {
      method: 'GET',
      signal: controller.signal,
    });

    if (!response.ok) {
      return false;
    }

    const body = await response.json().catch(() => null) as { status?: string; appId?: string } | null;
    if (body?.status !== 'ok') return false;

    // Backward-compatible: older servers may not send appId.
    return !body?.appId || body.appId === PUPPET_MASTER_APP_ID;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

function buildLoopbackCandidates(): string[] {
  const candidates: string[] = [];
  const stored = getLocalStorageItem(API_BASE_STORAGE_KEY);

  if (stored && stored.startsWith('http://')) {
    candidates.push(stored);
  }

  for (const port of API_BASE_PORT_CANDIDATES) {
    candidates.push(`http://127.0.0.1:${port}`);
  }

  return Array.from(new Set(candidates));
}

type HealthResponse = {
  appId?: string;
  status?: string;
  startedAt?: string;
};

async function probePuppetMasterCandidate(baseUrl: string): Promise<{ baseUrl: string; startedAt: string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 450);

  try {
    const response = await fetch(`${baseUrl}/health`, {
      method: 'GET',
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error('not_ok');
    }
    const body = await response.json().catch(() => null) as HealthResponse | null;
    if (!body || body.status !== 'ok' || body.appId !== PUPPET_MASTER_APP_ID) {
      throw new Error('not_puppet_master');
    }
    return { baseUrl, startedAt: body.startedAt ?? '' };
  } finally {
    clearTimeout(timeout);
  }
}

function isNetworkError(error: unknown): boolean {
  // Browsers vary (Chrome: "Failed to fetch", Firefox: "NetworkError...").
  if (!(error instanceof Error)) return false;
  const msg = error.message.toLowerCase();
  return msg.includes('failed to fetch') || msg.includes('networkerror') || msg.includes('load failed');
}

async function waitForInjectedApiBaseUrl(timeoutMs: number): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  const origin = window.location.origin;
  if (!isTauriBundledOrigin(origin)) return null;

  const initial = getLocalStorageItem(API_BASE_STORAGE_KEY);
  if (initial && initial.startsWith('http://')) return initial;

  return new Promise((resolve) => {
    const startedAt = Date.now();
    let done = false;
    let interval: ReturnType<typeof setInterval> | null = null;

    const cleanup = () => {
      if (done) return;
      done = true;
      if (interval) clearInterval(interval);
      try {
        window.removeEventListener('rwm-api-base-url-ready', onReady);
      } catch {
        // ignore
      }
    };

    const onReady = () => {
      const v = getLocalStorageItem(API_BASE_STORAGE_KEY);
      if (v && v.startsWith('http://')) {
        cleanup();
        resolve(v);
      }
    };

    try {
      window.addEventListener('rwm-api-base-url-ready', onReady);
    } catch {
      // ignore
    }

    interval = setInterval(() => {
      const v = getLocalStorageItem(API_BASE_STORAGE_KEY);
      if (v && v.startsWith('http://')) {
        cleanup();
        resolve(v);
        return;
      }
      if (Date.now() - startedAt >= timeoutMs) {
        cleanup();
        resolve(null);
      }
    }, 50);
  });
}

async function repairApiBaseUrlFromHealthScan(): Promise<string | null> {
  const candidates = API_BASE_PORT_CANDIDATES.map((p) => `http://127.0.0.1:${p}`);
  const results = await Promise.all(
    candidates.map(async (candidate) => {
      try {
        return await probePuppetMasterCandidate(candidate);
      } catch {
        return null;
      }
    })
  );
  const valid = results.filter((r): r is { baseUrl: string; startedAt: string } => r !== null);
  if (valid.length === 0) {
    return null;
  }

  // Choose the newest startedAt (ISO strings are lexicographically sortable).
  const newest = valid.reduce((best, cur) => (cur.startedAt > best.startedAt ? cur : best));
  setLocalStorageItem(API_BASE_STORAGE_KEY, newest.baseUrl);
  resolvedApiBaseUrl = newest.baseUrl;
  return newest.baseUrl;
}

async function resolveApiBaseUrl(): Promise<string> {
  if (typeof window === 'undefined') return '';

  if (resolvedApiBaseUrl) {
    return resolvedApiBaseUrl;
  }

  const origin = window.location.origin;
  if (isDirectBackendOrigin(origin)) {
    // Clear stale localStorage when origin is LAN IP but stored points to loopback
    const stored = getLocalStorageItem(API_BASE_STORAGE_KEY);
    if (stored && stored.includes('127.0.0.1')) {
      try {
        const originHost = new URL(origin).hostname;
        if (originHost !== '127.0.0.1' && originHost !== 'localhost') {
          removeLocalStorageItem(API_BASE_STORAGE_KEY);
        }
      } catch {
        /* ignore parse errors */
      }
    }
    resolvedApiBaseUrl = origin;
    setLocalStorageItem(API_BASE_STORAGE_KEY, origin);
    return origin;
  }

  // Desktop bundled origin (tauri.localhost / tauri://) should NOT scan loopback ports by default.
  // Instead, wait briefly for Tauri to inject localStorage["rwm-api-base-url"].
  if (isTauriBundledOrigin(origin)) {
    const stored = getLocalStorageItem(API_BASE_STORAGE_KEY);
    if (stored && stored.startsWith('http://')) {
      resolvedApiBaseUrl = stored;
      return stored;
    }

    const injected = await waitForInjectedApiBaseUrl(2000);
    if (injected && injected.startsWith('http://')) {
      resolvedApiBaseUrl = injected;
      return injected;
    }

    // Last resort: fall back, but do NOT permanently cache the default.
    // If injection arrives late, subsequent calls can still pick it up.
    return DEFAULT_API_BASE_URL;
  }

  if (resolvingApiBaseUrlPromise) {
    return resolvingApiBaseUrlPromise;
  }

  const currentPromise = (async () => {
    const candidates = buildLoopbackCandidates();
    const probeResults = await Promise.all(
      candidates.map(async (candidate) => ({
        candidate,
        ok: await probeApiBase(candidate),
      }))
    );
    const reachable = probeResults.find((result) => result.ok === true);
    if (reachable) {
      resolvedApiBaseUrl = reachable.candidate;
      setLocalStorageItem(API_BASE_STORAGE_KEY, reachable.candidate);
      return reachable.candidate;
    }

    // Last resort so the UI still has a deterministic endpoint.
    resolvedApiBaseUrl = DEFAULT_API_BASE_URL;
    return DEFAULT_API_BASE_URL;
  })();

  resolvingApiBaseUrlPromise = currentPromise;
  try {
    return await currentPromise;
  } finally {
    if (resolvingApiBaseUrlPromise === currentPromise) {
      resolvingApiBaseUrlPromise = null;
    }
  }
}

/**
 * Get auth token from localStorage or fetch from server
 */
let authToken: string | null = null;
let authTokenPromise: Promise<string | null> | null = null;

/**
 * Validate stored token against server (e.g. after restart server has new token).
 * Fetches /api/auth/status and updates in-memory and localStorage if server token differs.
 * Non-blocking: does not delay getAuthToken() return.
 */
function validateStoredTokenInBackground(stored: string): void {
  resolveApiBaseUrl()
    .then((baseUrl) => fetch(`${baseUrl}/api/auth/status`))
    .then((res) => (res.ok ? res.json() : null))
    .then((data: { enabled?: boolean; token?: string } | null) => {
      if (data?.enabled && typeof data.token === 'string' && data.token !== stored) {
        authToken = data.token;
        setLocalStorageItem('rwm-auth-token', data.token);
      }
    })
    .catch(() => { /* ignore */ });
}

async function getAuthToken(): Promise<string | null> {
  // Check localStorage first
  const stored = getLocalStorageItem('rwm-auth-token');
  if (stored) {
    authToken = stored;
    // Optional: validate against server in background so we pick up new token after restart
    validateStoredTokenInBackground(stored);
    return stored;
  }

  // If already fetching, wait for that
  if (authTokenPromise) {
    return authTokenPromise;
  }

  // Fetch auth status to get token
  authTokenPromise = (async () => {
    try {
      const baseUrl = await resolveApiBaseUrl();
      const response = await fetch(`${baseUrl}/api/auth/status`);
      if (response.ok) {
        const data = await response.json();
        if (data.enabled && data.token) {
          authToken = data.token;
          setLocalStorageItem('rwm-auth-token', data.token);
          return data.token;
        }
      }
    } catch (err) {
      console.error('[API] Failed to fetch auth token:', err);
    }
    return null;
  })();

  const token = await authTokenPromise;
  authTokenPromise = null;
  return token;
}

/**
 * Get (and refresh if needed) the current GUI auth token.
 * Useful for APIs like EventSource that cannot attach custom headers.
 */
export async function getGuiAuthToken(): Promise<string | null> {
  return authToken || await getAuthToken();
}

/**
 * Clear GUI session (logout). Clears in-memory token and localStorage.
 * Call this when the user clicks "Log out"; then navigate to /login and optionally reload.
 */
export function logoutGuiSession(): void {
  authToken = null;
  authTokenPromise = null;
  removeLocalStorageItem('rwm-auth-token');
}

/**
 * Base fetch wrapper with error handling and automatic auth token injection
 */
async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const isApiPath = url.startsWith('/api/');
  const apiBaseUrl = isApiPath ? await resolveApiBaseUrl() : '';
  const fetchUrl = isApiPath ? `${apiBaseUrl}${url}` : url;

  // Skip auth for auth endpoints, login endpoints (platform auth, not GUI auth), and config endpoints (needed during onboarding)
  const needsAuth = isApiPath &&
    !url.startsWith('/api/auth/') &&
    !url.startsWith('/api/login/') &&
    !url.startsWith('/api/config/') &&
    !url.startsWith('/api/platforms/') &&
    !url.startsWith('/api/system/uninstall') &&
    !url.startsWith('/api/ledger');

  // Get auth token if needed
  let headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };

  if (needsAuth) {
    const token = authToken || await getAuthToken();
    if (token) {
      headers = {
        ...headers,
        'Authorization': `Bearer ${token}`,
      };
    }
  }

  let response: Response;
  try {
    response = await fetch(fetchUrl, {
      ...options,
      headers,
    });
  } catch (err) {
    // Network errors (e.g. "Failed to fetch"): attempt repair scan and retry once.
    // Applies to both browser and Tauri (port mismatch, backend starting, etc.).
    if (isApiPath && typeof window !== 'undefined' && isNetworkError(err)) {
      const repaired = await repairApiBaseUrlFromHealthScan();
      if (repaired && repaired !== apiBaseUrl) {
        const retryUrl = `${repaired}${url}`;
        response = await fetch(retryUrl, {
          ...options,
          headers,
        });
      } else {
        throw err;
      }
    } else {
      throw err;
    }
  }

  // If we get 401, try refreshing token and retry once
  if (response.status === 401 && needsAuth && !authTokenPromise) {
    removeLocalStorageItem('rwm-auth-token');
    authToken = null;
    const token = await getAuthToken();
    if (token) {
      headers = {
        ...headers,
        'Authorization': `Bearer ${token}`,
      };
      const retryResponse = await fetch(fetchUrl, {
        ...options,
        headers,
      });
      if (!retryResponse.ok) {
        const raw = await retryResponse.text().catch(() => retryResponse.statusText);
        let message = raw;
        if (retryResponse.status >= 400 && retryResponse.status < 500 && raw) {
          try {
            const body = JSON.parse(raw) as { error?: string; code?: string };
            if (typeof body.error === 'string' && body.error.trim()) {
              message = body.error + (body.code ? ` (${body.code})` : '');
            }
          } catch {
            /* keep raw */
          }
        }
        throw new APIError(message, retryResponse.status, retryResponse.statusText);
      }
      return retryResponse.json();
    }
  }

  if (!response.ok) {
    const raw = await response.text().catch(() => response.statusText);
    let message = raw;
    if (response.status >= 400 && raw) {
      try {
        const body = JSON.parse(raw) as { error?: string; code?: string; validPlatforms?: string[] };
        if (typeof body.error === 'string' && body.error.trim()) {
          message = body.error;
          if (body.code) message += ` (${body.code})`;
          if (Array.isArray(body.validPlatforms) && body.validPlatforms.length > 0) {
            message += ` — valid: ${body.validPlatforms.join(', ')}`;
          }
        }
      } catch {
        // keep raw message
      }
    }
    throw new APIError(message, response.status, response.statusText);
  }

  return response.json();
}

// ============================================
// State API
// ============================================

export interface StateResponse {
  orchestratorState: StatusType;
  currentItem: TierItem | null;
  progress: Progress;
  projectName?: string;
  projectPath?: string;
  budgets?: Record<Platform, { current: number; limit: number | 'unlimited' }>;
}

/**
 * Get current orchestrator state
 */
export async function getState(): Promise<StateResponse> {
  return fetchJSON<StateResponse>('/api/state');
}

// ============================================
// Control API
// ============================================

/**
 * Start the orchestrator
 */
export async function start(): Promise<{ success: boolean }> {
  return fetchJSON('/api/controls/start', { method: 'POST' });
}

/**
 * Pause the orchestrator
 */
export async function pause(): Promise<{ success: boolean }> {
  return fetchJSON('/api/controls/pause', { method: 'POST' });
}

/**
 * Resume the orchestrator
 */
export async function resume(): Promise<{ success: boolean }> {
  return fetchJSON('/api/controls/resume', { method: 'POST' });
}

/**
 * Stop the orchestrator
 */
export async function stop(): Promise<{ success: boolean }> {
  return fetchJSON('/api/controls/stop', { method: 'POST' });
}

/**
 * Retry the current item
 */
export async function retry(): Promise<{ success: boolean }> {
  return fetchJSON('/api/controls/retry', { method: 'POST' });
}

/**
 * Replan the current phase
 */
export async function replan(): Promise<{ success: boolean }> {
  return fetchJSON('/api/controls/replan', { method: 'POST' });
}

/**
 * Reopen a closed item
 */
export async function reopen(itemId: string): Promise<{ success: boolean }> {
  return fetchJSON('/api/controls/reopen', {
    method: 'POST',
    body: JSON.stringify({ itemId }),
  });
}

/**
 * Kill the current process
 */
export async function kill(): Promise<{ success: boolean }> {
  return fetchJSON('/api/controls/kill', { method: 'POST' });
}

// ============================================
// Projects API
// ============================================

/**
 * List all projects.
 * Always returns an array (never null or undefined); normalizes malformed API responses.
 */
export async function listProjects(): Promise<Project[]> {
  const response = await fetchJSON<{ projects?: Project[] }>('/api/projects');
  return Array.isArray(response?.projects) ? response.projects : [];
}

/**
 * Get current project
 */
export async function getCurrentProject(): Promise<Project | null> {
  try {
    return await fetchJSON<Project>('/api/projects/current');
  } catch {
    return null;
  }
}

/**
 * Create a new project
 */
export async function createProject(name: string, path: string): Promise<Project> {
  return fetchJSON<Project>('/api/projects', {
    method: 'POST',
    body: JSON.stringify({ name, path }),
  });
}

/**
 * Open a project
 */
export async function openProject(path: string): Promise<Project> {
  return fetchJSON<Project>('/api/projects/open', {
    method: 'POST',
    body: JSON.stringify({ path }),
  });
}

// ============================================
// Config API
// ============================================

export interface Config {
  tiers?: {
    phase?: { platform?: Platform; model?: string };
    task?: { platform?: Platform; model?: string };
    subtask?: { platform?: Platform; model?: string };
    iteration?: { platform?: Platform; model?: string };
  };
  branching?: {
    baseBranch?: string;
    namingPattern?: string;
    granularity?: 'single' | 'per-phase' | 'per-task';
  };
  verification?: {
    browserAdapter?: string;
    screenshotOnFailure?: boolean;
    evidenceDirectory?: string;
  };
  memory?: {
    progressFile?: string;
    agentsFile?: string;
    prdFile?: string;
    multiLevelAgents?: boolean;
  };
}

// ============================================
// Agents API
// ============================================

export interface AgentsFile {
  name: string;
  path: string;
  lastAccessed: string | null;
  level: 'root' | 'module' | 'phase' | 'task';
}

export interface AgentsListResponse {
  files: AgentsFile[];
}

export interface AgentsContentResponse {
  document: string;
  path: string;
  level: 'root' | 'module' | 'phase' | 'task';
}

export const agents = {
  /**
   * Get list of AGENTS.md files
   */
  async list(): Promise<AgentsFile[]> {
    const response = await fetchJSON<AgentsListResponse>('/api/agents');
    return response.files || [];
  },

  /**
   * Get content of a specific AGENTS.md file
   */
  async getContent(path: string): Promise<AgentsContentResponse> {
    const encodedPath = encodeURIComponent(path);
    return fetchJSON<AgentsContentResponse>(`/api/agents/${encodedPath}`);
  },
};

/**
 * Get current config
 */
/**
 * Get config
 * @param refresh - Optional flag to bypass cache
 */
export async function getConfig(refresh = false): Promise<Config> {
  const url = refresh ? '/api/config?refresh=true' : '/api/config';
  const response = await fetchJSON<{ config: Config }>(url);
  return response.config;
}

let modelsCache: Record<string, unknown> | null = null;
let modelsPromise: Promise<Record<string, unknown>> | null = null;

/**
 * Fetch model lists for all platforms.
 * Uses a small module-level cache to avoid slow double-loads across pages.
 */
export async function getModels(refresh = false): Promise<Record<string, unknown>> {
  if (!refresh && modelsCache) return modelsCache;
  if (!refresh && modelsPromise) return modelsPromise;

  if (refresh) {
    modelsCache = null;
    modelsPromise = null;
  }

  const url = refresh ? '/api/config/models?refresh=true' : '/api/config/models';
  const currentPromise = fetchJSON<Record<string, unknown>>(url);
  modelsPromise = currentPromise;

  try {
    const data = await currentPromise;
    if (modelsPromise === currentPromise) {
      modelsCache = data;
      modelsPromise = null;
    }
    return data;
  } catch (err) {
    if (modelsPromise === currentPromise) {
      modelsPromise = null;
    }
    throw err;
  }
}

/**
 * Update config
 */
export async function updateConfig(config: Config): Promise<{ success: boolean }> {
  return fetchJSON('/api/config', {
    method: 'PUT',
    body: JSON.stringify({ config }),
  });
}

/**
 * Validate config
 */
export async function validateConfig(config: Config): Promise<{ valid: boolean; errors?: string[] }> {
  return fetchJSON('/api/config/validate', {
    method: 'POST',
    body: JSON.stringify({ config }),
  });
}

/**
 * CU-P1-T09: Get Cursor capabilities
 */
export interface CursorCapabilities {
  binary: {
    selected: string;
    candidates: string[];
  };
  modes: string[];
  outputFormats: string[];
  auth: {
    status: string;
    hasApiKey: boolean;
  };
  models: {
    source: 'discovered' | 'static';
    count: number;
    sample: Array<{ id: string; label: string; source: string }>;
  };
  mcp: {
    available: boolean;
    serverCount: number;
    servers: string[];
  };
  config: {
    found: boolean;
    path?: string;
    hasPermissions: boolean;
  };
}

export async function getCursorCapabilities(): Promise<CursorCapabilities> {
  return fetchJSON<CursorCapabilities>('/api/config/capabilities');
}

export interface GitInfo {
  branches: string[];
  remoteName: string;
  remoteUrl: string;
  userName: string;
  userEmail: string;
  currentBranch: string;
}

export async function getGitInfo(): Promise<GitInfo> {
  return fetchJSON<GitInfo>('/api/config/git-info');
}

// ============================================
// Tiers API
// ============================================

/**
 * Get tier hierarchy.
 * Returns array of top-level tier nodes (root as single item when present).
 * Tree structure uses nested `children`; each node shape matches GUI TierItem.
 */
export async function getTiers(): Promise<unknown[]> {
  const response = await fetchJSON<{ root?: unknown; metadata?: unknown }>('/api/tiers');
  if (!response || typeof response !== 'object' || response.root == null) {
    return [];
  }
  const root = response.root;
  return Array.isArray(root) ? root : [root];
}

// ============================================
// Doctor API
// ============================================

export interface DoctorCheck {
  name: string;
  category: string;
  status: 'pass' | 'fail' | 'warn' | 'skip';
  message?: string;
  details?: string;
  fixable?: boolean;
}

/**
 * Get doctor checks (list only; no run results).
 * Normalizes fixAvailable -> fixable and adds status: 'skip' for unrun checks.
 */
export async function getDoctorChecks(): Promise<{ checks: DoctorCheck[] }> {
  const res = await fetchJSON<{
    checks?: Array<{ fixAvailable?: boolean; [k: string]: unknown }>;
  }>('/api/doctor/checks');
  const raw = Array.isArray(res?.checks) ? res.checks : [];
  const checks: DoctorCheck[] = raw.map((c) => ({
    ...c,
    status: 'skip' as const,
    message: (c as { message?: string }).message ?? '',
    fixable: c.fixAvailable === true,
  })) as DoctorCheck[];
  return { checks };
}

/**
 * Run doctor checks
 * Normalizes API response: passed -> status, fixAvailable -> fixable
 */
export async function runDoctorChecks(options?: { category?: string; platforms?: string[] }): Promise<{ checks: DoctorCheck[] }> {
  const res = await fetchJSON<{
    checks?: Array<{ passed?: boolean; fixAvailable?: boolean; [k: string]: unknown }>;
    results?: Array<{ passed?: boolean; fixAvailable?: boolean; [k: string]: unknown }>;
  }>('/api/doctor/run', {
    method: 'POST',
    body: JSON.stringify(options ?? {}),
  });
  const raw = res.checks || res.results || [];
  const checks: DoctorCheck[] = Array.isArray(raw)
    ? raw.map((c) => ({
        ...c,
        status: c.passed === true ? 'pass' : (c.passed === false ? 'fail' : 'skip'),
        fixable: c.fixAvailable === true,
      })) as DoctorCheck[]
    : [];
  return { checks };
}

/**
 * Fix a doctor check
 */
export async function fixDoctorCheck(checkName: string): Promise<{ success: boolean; message?: string }> {
  return fetchJSON('/api/doctor/fix', {
    method: 'POST',
    body: JSON.stringify({ checkName }),
  });
}

// ============================================
// History API
// ============================================

export interface HistorySession {
  sessionId: string;
  startTime: string;
  endTime?: string;
  status: 'running' | 'completed' | 'stopped' | 'failed';
  outcome?: 'success' | 'partial' | 'failed' | 'stopped';
  iterationsRun?: number;
  projectPath?: string;
  projectName?: string;
  phasesCompleted?: number;
  tasksCompleted?: number;
  subtasksCompleted?: number;
  processPids?: number[];
}

export interface HistoryResponse {
  sessions: HistorySession[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Get execution history
 */
export async function getHistory(params?: { limit?: number; offset?: number }): Promise<HistoryResponse> {
  const qs = new URLSearchParams();
  if (params?.limit != null) qs.set('limit', String(params.limit));
  if (params?.offset != null) qs.set('offset', String(params.offset));
  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  return fetchJSON<HistoryResponse>(`/api/history${suffix}`);
}

// ============================================
// Wizard API
// ============================================

/**
 * Upload requirements to wizard
 */
export async function uploadRequirements(content: string, filename?: string): Promise<{ success: boolean }> {
  return fetchJSON('/api/wizard/upload', {
    method: 'POST',
    body: JSON.stringify({ content, filename }),
  });
}

/**
 * Upload and parse requirements document
 */
export async function wizardUpload(data: {
  text?: string;
  file?: string;
  filename?: string;
  format?: string;
  projectPath?: string;
}): Promise<{ parsed: unknown }> {
  return fetchJSON('/api/wizard/upload', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Generate PRD from requirements
 */
export async function generatePRD(options?: { style?: string }): Promise<{ success: boolean }> {
  return fetchJSON('/api/wizard/generate', {
    method: 'POST',
    body: JSON.stringify(options ?? {}),
  });
}

/**
 * Generate PRD from requirements with full response
 */
export async function wizardGenerate(data: {
  parsed: unknown;
  projectPath?: string;
  projectName?: string;
  platform?: string;
  model?: string;
  useAI?: boolean;
}): Promise<{ prd: unknown; architecture?: string; tierPlan?: unknown; usedAI: boolean }> {
  return fetchJSON('/api/wizard/generate', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ============================================
// Platform API
// ============================================

export interface PlatformStatus {
  platform: string;
  installed: boolean;
  runnable: boolean;
  version?: string;
  error?: string;
  requirements?: Array<{ kind: 'node'; requiredMajor: number; currentMajor?: number }>;
  authenticated?: boolean;
  command?: string;
}

export type { PlatformStatus as PlatformStatusType };

export interface PlatformStatusResponse {
  platforms: Record<string, PlatformStatus>;
  installedPlatforms: string[];
  uninstalledPlatforms: string[];
}

/**
 * Get platform installation status
 */
export async function getPlatformStatus(refresh = false): Promise<PlatformStatusResponse> {
  const url = refresh ? '/api/platforms/status?refresh=true' : '/api/platforms/status';
  return fetchJSON<PlatformStatusResponse>(url);
}

/**
 * Get list of installed platforms
 */
export async function getInstalledPlatforms(): Promise<{ platforms: string[] }> {
  return fetchJSON<{ platforms: string[] }>('/api/platforms/installed');
}

/**
 * Install platform response (success or failure with server error/output for wizard display)
 */
export interface InstallPlatformResult {
  success: boolean;
  output?: string;
  error?: string;
  command?: string;
  code?: string;
}

/** Parsed JSON body from install endpoint (success or error response). */
interface InstallPlatformResponseBody {
  success?: boolean;
  error?: string;
  output?: string;
  command?: string;
  code?: string;
}

/**
 * Install a platform.
 * On 4xx/5xx returns the response body (success: false, error, output, code) instead of throwing
 * so the wizard can surface server error and install output to the user.
 */
export async function installPlatform(platform: string, dryRun = false): Promise<InstallPlatformResult> {
  const baseUrl = await resolveApiBaseUrl();
  const url = `${baseUrl}/api/platforms/install`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ platform, dryRun }),
  });
  const body: InstallPlatformResponseBody = await response.json().catch(() => ({}));
  if (!response.ok) {
    return {
      success: false,
      error: body.error ?? response.statusText,
      output: body.output,
      code: body.code,
      command: body.command,
    };
  }
  return {
    success: body.success ?? true,
    output: body.output,
    error: body.error,
    command: body.command,
    code: body.code,
  };
}

/**
 * Select platforms to use
 */
export async function selectPlatforms(platforms: string[]): Promise<{ success: boolean; message?: string }> {
  return fetchJSON('/api/platforms/select', {
    method: 'POST',
    body: JSON.stringify({ platforms }),
  });
}

export interface FirstBootStatus {
  isFirstBoot: boolean;
  missingConfig: boolean;
  missingCapabilities: boolean;
}

export async function getFirstBootStatus(): Promise<FirstBootStatus> {
  return fetchJSON<FirstBootStatus>('/api/platforms/first-boot');
}

export async function uninstallSystem(): Promise<{ success: boolean; message?: string; error?: string }> {
  return fetchJSON('/api/system/uninstall', { method: 'POST' });
}

/**
 * Validate PRD
 */
export async function validatePRD(): Promise<{ valid: boolean; errors?: string[] }> {
  return fetchJSON('/api/wizard/validate', {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

/**
 * Save PRD and complete wizard
 */
export async function savePRD(): Promise<{ success: boolean }> {
  return fetchJSON('/api/wizard/save', {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

/**
 * Tier configuration for wizard save
 */
interface WizardTierConfig {
  platform: string;
  model: string;
  planMode?: boolean;
  askMode?: boolean;
  outputFormat?: 'text' | 'json' | 'stream-json';
}

/**
 * Save wizard state with project info and tier configuration
 */
export async function wizardSave(data: {
  prd?: unknown;
  architecture?: string | null;
  tierPlan?: unknown;
  projectName: string;
  projectPath: string;
  tierConfigs?: Record<string, WizardTierConfig>;
}): Promise<{ success: boolean; configPath?: string }> {
  return fetchJSON('/api/wizard/save', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ============================================
// Login API (platform authentication)
// ============================================

export interface PlatformAuthInfo {
  platform: string;
  status: 'authenticated' | 'not_authenticated' | 'failed' | 'skipped' | 'unknown';
  details: string;
  fixSuggestion?: string;
}

export interface AuthSummary {
  total: number;
  authenticated: number;
  notAuthenticated: number;
  failed: number;
  skipped: number;
}

export interface LoginStatusResponse {
  platforms: PlatformAuthInfo[];
  summary: AuthSummary;
}

/**
 * Get login/auth status for all platforms
 */
export async function getLoginStatus(): Promise<LoginStatusResponse> {
  return fetchJSON<LoginStatusResponse>('/api/login/status');
}

/**
 * Get login/auth status for a single platform (e.g. 'github').
 */
export async function getLoginStatusForPlatform(platform: string): Promise<PlatformAuthInfo & { description?: string }> {
  return fetchJSON<PlatformAuthInfo & { description?: string }>(`/api/login/status/${platform}`);
}

/**
 * Trigger CLI login for a specific platform
 */
export async function loginPlatform(platform: string): Promise<{ 
  success: boolean; 
  message?: string; 
  authUrl?: string;
  terminalLaunched?: boolean;
  command?: string;
  error?: string;
  code?: string;
  getUrl?: string;
}> {
  return fetchJSON(`/api/login/${platform}`, {
    method: 'POST',
  });
}

/** Platforms that support logout via CLI (github, copilot, codex) */
export const LOGOUT_SUPPORTED_PLATFORMS = ['github', 'copilot', 'codex', 'cursor'] as const;

/**
 * Trigger CLI logout for a specific platform (where supported).
 */
export async function logoutPlatform(platform: string): Promise<{ success: boolean; error?: string; code?: string }> {
  const baseUrl = await resolveApiBaseUrl();
  const res = await fetch(`${baseUrl}/api/login/${platform}/logout`, { method: 'POST' });
  const data = await res.json().catch(() => ({})) as { success?: boolean; error?: string; code?: string };
  if (!res.ok) {
    return { success: false, error: data.error ?? res.statusText, code: data.code };
  }
  return { success: data.success ?? true };
}

// ============================================
// Ledger API
// ============================================

export interface LedgerEvent {
  id: number;
  type: string;
  timestamp: string;
  tierId?: string;
  sessionId?: string;
  data: Record<string, unknown>;
}

export interface LedgerStats {
  totalEvents: number;
  eventsByType: Record<string, number>;
  sessionCount: number;
  dateRange: {
    earliest: string | null;
    latest: string | null;
  };
}

export async function getLedgerStats(): Promise<LedgerStats> {
  return fetchJSON<LedgerStats>('/api/ledger/stats');
}

export async function getLedgerEvents(options: {
  type?: string;
  tierId?: string;
  sessionId?: string;
  fromTimestamp?: string;
  toTimestamp?: string;
  order?: 'asc' | 'desc';
  limit?: number;
}): Promise<{ dbPath?: string; count?: number; events: LedgerEvent[] }> {
  const params = new URLSearchParams();
  if (options.type) params.set('type', options.type);
  if (options.tierId) params.set('tierId', options.tierId);
  if (options.sessionId) params.set('sessionId', options.sessionId);
  if (options.fromTimestamp) params.set('fromTimestamp', options.fromTimestamp);
  if (options.toTimestamp) params.set('toTimestamp', options.toTimestamp);
  if (options.order) params.set('order', options.order);
  if (options.limit != null) params.set('limit', String(options.limit));

  return fetchJSON(`/api/ledger?${params}`);
}

// ============================================
// Platform Health API
// ============================================

export interface PlatformHealth {
  platform: Platform;
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastCheck?: Date;
  message?: string;
}

/**
 * Get platform health status
 */
export async function getPlatformHealth(): Promise<{ platforms: PlatformHealth[] }> {
  return fetchJSON<{ platforms: PlatformHealth[] }>('/api/platforms/health');
}

// ============================================
// Export all as namespace
// ============================================

export const api = {
  // State
  getState,
  // Control
  start,
  pause,
  resume,
  stop,
  retry,
  replan,
  reopen,
  kill,
  // Projects
  listProjects,
  getCurrentProject,
  createProject,
  openProject,
  // Config
  getConfig,
  getModels,
  updateConfig,
  validateConfig,
  getCursorCapabilities,
  // Tiers
  getTiers,
  // Git
  getGitInfo,
  // Doctor
  getDoctorChecks,
  runDoctorChecks,
  fixDoctorCheck,
  // History
  getHistory,
  // Wizard
  wizardUpload,
  uploadRequirements,
  generatePRD,
  wizardGenerate,
  // Platform
  getPlatformStatus,
  getInstalledPlatforms,
  installPlatform,
  selectPlatforms,
  validatePRD,
  savePRD,
  wizardSave,
  // Platforms
  getPlatformHealth,
  getFirstBootStatus,
  // System
  uninstallSystem,
  // Login
  getLoginStatus,
  getLoginStatusForPlatform,
  loginPlatform,
  logoutPlatform,
  LOGOUT_SUPPORTED_PLATFORMS,
  // Ledger
  getLedgerStats,
  getLedgerEvents,
};

export default api;
