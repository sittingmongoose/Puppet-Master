/**
 * Tier Plan Generator for RWM Puppet Master
 * 
 * Generates detailed tier execution plans by mapping PRD structure to execution parameters.
 * Assigns platforms, iteration limits, and escalation paths to each tier.
 * 
 * See REQUIREMENTS.md Section 6 (Four-Tier Orchestration) and BUILD_QUEUE_PHASE_5.md PH5-T07.
 */

import type { PRD, Phase, Task, Subtask } from '../types/prd.js';
import type { PuppetMasterConfig } from '../types/config.js';
import type { Platform } from '../types/config.js';
import type { TierType } from '../types/state.js';

/**
 * Subtask plan interface.
 * Represents execution plan for a subtask.
 */
export interface SubtaskPlan {
  subtaskId: string;
  platform: Platform;
  maxIterations: number;
}

/**
 * Task plan interface.
 * Represents execution plan for a task with its subtasks.
 */
export interface TaskPlan {
  taskId: string;
  platform: Platform;
  maxIterations: number;
  subtasks: SubtaskPlan[];
}

/**
 * Phase plan interface.
 * Represents execution plan for a phase with its tasks.
 */
export interface PhasePlan {
  phaseId: string;
  platform: Platform;
  maxIterations: number;
  escalation: TierType | null;
  tasks: TaskPlan[];
}

/**
 * Tier plan interface.
 * Root interface for the complete tier execution plan.
 */
export interface TierPlan {
  phases: PhasePlan[];
}

/**
 * Generator that creates tier execution plans from PRD structure.
 */
export class TierPlanGenerator {
  private readonly config: PuppetMasterConfig;

  constructor(config: PuppetMasterConfig) {
    this.config = config;
  }

  /**
   * Main entry point: generates a tier plan from PRD structure.
   */
  generate(prd: PRD): TierPlan {
    const phases = prd.phases.map(phase => this.generatePhasePlan(phase));
    return { phases };
  }

  /**
   * Generates a phase plan from a PRD phase.
   */
  private generatePhasePlan(phase: Phase): PhasePlan {
    const tasks = phase.tasks.map(task => this.generateTaskPlan(task));
    
    return {
      phaseId: phase.id,
      platform: this.assignPlatform('phase'),
      maxIterations: this.getMaxIterations('phase'),
      escalation: this.getEscalationTarget('phase'),
      tasks,
    };
  }

  /**
   * Generates a task plan from a PRD task.
   */
  private generateTaskPlan(task: Task): TaskPlan {
    const subtasks = task.subtasks.map(subtask => this.generateSubtaskPlan(subtask));
    
    return {
      taskId: task.id,
      platform: this.assignPlatform('task'),
      maxIterations: this.getMaxIterations('task'),
      subtasks,
    };
  }

  /**
   * Generates a subtask plan from a PRD subtask.
   */
  private generateSubtaskPlan(subtask: Subtask): SubtaskPlan {
    return {
      subtaskId: subtask.id,
      platform: this.assignPlatform('subtask'),
      maxIterations: this.getMaxIterations('subtask'),
    };
  }

  /**
   * Assigns platform for a tier type based on configuration.
   */
  assignPlatform(tierType: TierType): Platform {
    return this.config.tiers[tierType].platform;
  }

  /**
   * Gets max iterations for a tier type based on configuration.
   */
  getMaxIterations(tierType: TierType): number {
    return this.config.tiers[tierType].maxIterations;
  }

  /**
   * Gets escalation target for a tier type based on configuration.
   * Maps config escalation string to TierType.
   */
  getEscalationTarget(tierType: TierType): TierType | null {
    const escalation = this.config.tiers[tierType].escalation;
    
    if (escalation === null) {
      return null;
    }
    
    // Map config escalation string to TierType
    // Config uses 'phase' | 'task' | 'subtask' | null
    // Return type is TierType | null
    return escalation as TierType;
  }
}
