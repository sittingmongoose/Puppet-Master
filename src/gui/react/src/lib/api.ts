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
 * Base fetch wrapper with error handling
 */
async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

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
 * Get doctor checks
 */
export async function getDoctorChecks(): Promise<{ checks: DoctorCheck[] }> {
  const res = await fetchJSON<{ checks?: DoctorCheck[] }>('/api/doctor/checks');
  return { checks: Array.isArray(res?.checks) ? res.checks : [] };
}

/**
 * Run doctor checks
 */
export async function runDoctorChecks(options?: { category?: string }): Promise<{ checks: DoctorCheck[] }> {
  const res = await fetchJSON<{ checks?: DoctorCheck[] }>('/api/doctor/run', {
    method: 'POST',
    body: JSON.stringify(options ?? {}),
  });
  return { checks: Array.isArray(res?.checks) ? res.checks : [] };
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
  validatePRD,
  savePRD,
  wizardSave,
  // Platforms
  getPlatformHealth,
};

export default api;
