/**
 * Doctor module exports
 * 
 * Exports the check registry and related types for the doctor system.
 */

export { CheckRegistry } from './check-registry.js';
export type { DoctorCheck, CheckResult, CheckCategory } from './check-registry.js';
export { InstallationManager } from './installation-manager.js';
export type { InstallCommand, Platform, InstallOptions, InstallResult } from './installation-manager.js';
export { DoctorReporter } from './doctor-reporter.js';
export type { ReportOptions } from './doctor-reporter.js';
