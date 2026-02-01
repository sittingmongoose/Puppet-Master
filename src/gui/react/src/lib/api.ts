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
 * Get auth token from localStorage or fetch from server
 */
let authToken: string | null = null;
let authTokenPromise: Promise<string | null> | null = null;

async function getAuthToken(): Promise<string | null> {
  // Check localStorage first
  const stored = localStorage.getItem('rwm-auth-token');
  if (stored) {
    authToken = stored;
    return stored;
  }
  
  // If already fetching, wait for that
  if (authTokenPromise) {
    return authTokenPromise;
  }
  
  // Fetch auth status to get token
  authTokenPromise = (async () => {
    try {
      const response = await fetch('/api/auth/status');
      if (response.ok) {
        const data = await response.json();
        if (data.enabled && data.token) {
          authToken = data.token;
          localStorage.setItem('rwm-auth-token', data.token);
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
 * Base fetch wrapper with error handling and automatic auth token injection
 */
async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  // Skip auth for auth endpoints and login endpoints (platform auth, not GUI auth)
  const needsAuth = url.startsWith('/api/') && !url.startsWith('/api/auth/') && !url.startsWith('/api/login/');
  
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
  
  const response = await fetch(url, {
    ...options,
    headers,
  });

  // If we get 401, try refreshing token and retry once
  if (response.status === 401 && needsAuth && !authTokenPromise) {
    localStorage.removeItem('rwm-auth-token');
    authToken = null;
    const token = await getAuthToken();
    if (token) {
      headers = {
        ...headers,
        'Authorization': `Bearer ${token}`,
      };
      const retryResponse = await fetch(url, {
        ...options,
        headers,
      });
      if (!retryResponse.ok) {
        const message = await retryResponse.text().catch(() => retryResponse.statusText);
        throw new APIError(message, retryResponse.status, retryResponse.statusText);
      }
      return retryResponse.json();
    }
  }

  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
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
export async function getConfig(): Promise<Config> {
  const response = await fetchJSON<{ config: Config }>('/api/config');
  return response.config;
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

export interface Session {
  id: string;
  startTime: Date;
  endTime?: Date;
  status: StatusType;
  projectName?: string;
  phases: number;
  tasks: number;
  outcome?: 'success' | 'failure' | 'partial';
}

/**
 * Get execution history
 */
export async function getHistory(): Promise<Session[]> {
  return fetchJSON<Session[]>('/api/history');
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
export async function wizardGenerate(data: { requirements: string }): Promise<{ prd: string }> {
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
  version?: string;
  error?: string;
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
export async function getPlatformStatus(): Promise<PlatformStatusResponse> {
  return fetchJSON<PlatformStatusResponse>('/api/platforms/status');
}

/**
 * Get list of installed platforms
 */
export async function getInstalledPlatforms(): Promise<{ platforms: string[] }> {
  return fetchJSON<{ platforms: string[] }>('/api/platforms/installed');
}

/**
 * Install a platform
 */
export async function installPlatform(platform: string, dryRun = false): Promise<{ success: boolean; output?: string; error?: string; command?: string }> {
  return fetchJSON('/api/platforms/install', {
    method: 'POST',
    body: JSON.stringify({ platform, dryRun }),
  });
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
  prd: string;
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
  status: 'authenticated' | 'not_authenticated' | 'failed' | 'skipped';
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
 * Trigger CLI login for a specific platform
 */
export async function loginPlatform(platform: string): Promise<{ success: boolean; message?: string }> {
  return fetchJSON('/api/login/' + encodeURIComponent(platform), {
    method: 'POST',
  });
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
  updateConfig,
  validateConfig,
  getCursorCapabilities,
  // Tiers
  getTiers,
  // Doctor
  getDoctorChecks,
  runDoctorChecks,
  fixDoctorCheck,
  // History
  getHistory,
  // Wizard
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
  // Login
  getLoginStatus,
  loginPlatform,
};

export default api;
