/**
 * Types for the check command
 */

export interface CheckOptions {
  phase?: number;
  verbose?: boolean;
  updateChecklist?: boolean;
}

export interface CommandCheck {
  name: string;
  command: string;
  passed: boolean;
  output: string;
  error: string;
}

export interface ComponentCheck {
  name: string;
  passed: boolean;
  details: string;
}

export interface CheckResult {
  commands: CommandCheck[];
  components: ComponentCheck[];
  functional: ComponentCheck[];
  overall: 'pass' | 'fail' | 'pending';
}
