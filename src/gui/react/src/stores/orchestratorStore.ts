import { create } from 'zustand';
import type { StatusType } from '@/types';

/**
 * Tier hierarchy item
 */
export interface TierItem {
  id: string;
  type: 'phase' | 'task' | 'subtask' | 'iteration';
  title: string;
  status: StatusType;
  progress?: number;
  parent?: string;
  children?: string[];
}

/**
 * Progress tracking
 */
export interface Progress {
  phase: { current: number; total: number };
  task: { current: number; total: number };
  subtask: { current: number; total: number };
  iteration: { current: number; total: number };
  overall: number;
}

/**
 * Output line from execution
 */
export interface OutputLine {
  id: string;
  timestamp: Date;
  type: 'stdout' | 'stderr' | 'system';
  content: string;
  source?: string;
}

/**
 * Orchestrator state
 */
interface OrchestratorState {
  status: StatusType;
  currentItem: TierItem | null;
  progress: Progress;
  output: OutputLine[];
  lastError: string | null;
  startTime: Date | null;
  
  // Actions
  setStatus: (status: StatusType) => void;
  setCurrentItem: (item: TierItem | null) => void;
  updateProgress: (progress: Partial<Progress>) => void;
  addOutput: (line: Omit<OutputLine, 'id'>) => void;
  clearOutput: () => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialProgress: Progress = {
  phase: { current: 0, total: 0 },
  task: { current: 0, total: 0 },
  subtask: { current: 0, total: 0 },
  iteration: { current: 0, total: 0 },
  overall: 0,
};

/**
 * Orchestrator store - manages execution state
 */
export const useOrchestratorStore = create<OrchestratorState>((set) => ({
  status: 'idle',
  currentItem: null,
  progress: initialProgress,
  output: [],
  lastError: null,
  startTime: null,
  
  setStatus: (status) => set({ 
    status,
    startTime: status === 'running' ? new Date() : null,
  }),
  
  setCurrentItem: (currentItem) => set({ currentItem }),
  
  updateProgress: (progress) => set((state) => ({
    progress: { ...state.progress, ...progress },
  })),
  
  addOutput: (line) => set((state) => ({
    output: [...state.output, { ...line, id: `output-${Date.now()}-${Math.random().toString(36).slice(2)}` }],
  })),
  
  clearOutput: () => set({ output: [] }),
  
  setError: (lastError) => set({ lastError }),
  
  reset: () => set({
    status: 'idle',
    currentItem: null,
    progress: initialProgress,
    output: [],
    lastError: null,
    startTime: null,
  }),
}));
