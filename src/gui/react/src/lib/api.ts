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
  return fetchJSON('/api/control/start', { method: 'POST' });
}

/**
 * Pause the orchestrator
 */
export async function pause(): Promise<{ success: boolean }> {
  return fetchJSON('/api/control/pause', { method: 'POST' });
}

/**
 * Resume the orchestrator
 */
export async function resume(): Promise<{ success: boolean }> {
  return fetchJSON('/api/control/resume', { method: 'POST' });
}

/**
 * Stop the orchestrator
 */
export async function stop(): Promise<{ success: boolean }> {
  return fetchJSON('/api/control/stop', { method: 'POST' });
}

/**
 * Retry the current item
 */
export async function retry(): Promise<{ success: boolean }> {
  return fetchJSON('/api/control/retry', { method: 'POST' });
}

/**
 * Replan the current phase
 */
export async function replan(): Promise<{ success: boolean }> {
  return fetchJSON('/api/control/replan', { method: 'POST' });
}

/**
 * Reopen a closed item
 */
export async function reopen(itemId: string): Promise<{ success: boolean }> {
  return fetchJSON('/api/control/reopen', {
    method: 'POST',
    body: JSON.stringify({ itemId }),
  });
}

/**
 * Kill the current process
 */
export async function kill(): Promise<{ success: boolean }> {
  return fetchJSON('/api/control/kill', { method: 'POST' });
}

// ============================================
// Projects API
// ============================================

/**
 * List all projects
 */
export async function listProjects(): Promise<Project[]> {
  return fetchJSON<Project[]>('/api/projects');
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
  budgets?: {
    claude?: { maxCallsPerRun?: number; maxCallsPerHour?: number; maxCallsPerDay?: number };
    codex?: { maxCallsPerRun?: number; maxCallsPerHour?: number; maxCallsPerDay?: number };
    cursor?: { maxCallsPerRun?: number; maxCallsPerHour?: number; maxCallsPerDay?: number };
  };
}

/**
 * Get current config
 */
export async function getConfig(): Promise<Config> {
  return fetchJSON<Config>('/api/config');
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

// ============================================
// Tiers API
// ============================================

/**
 * Get tier hierarchy
 */
export async function getTiers(): Promise<TierItem[]> {
  return fetchJSON<TierItem[]>('/api/tiers');
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
  return fetchJSON<{ checks: DoctorCheck[] }>('/api/doctor/checks');
}

/**
 * Run doctor checks
 */
export async function runDoctorChecks(options?: { category?: string }): Promise<{ checks: DoctorCheck[] }> {
  return fetchJSON('/api/doctor/run', {
    method: 'POST',
    body: JSON.stringify(options ?? {}),
  });
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
 * Save wizard state with project info
 */
export async function wizardSave(data: { prd: string; projectName: string; projectPath: string }): Promise<{ success: boolean }> {
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
