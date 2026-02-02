/**
 * ProjectRoot path helpers
 *
 * P0-T18: Canonical ProjectRoot resolution.
 *
 * The system must not implicitly couple state paths to process.cwd() once a project
 * has been selected. These helpers let callers:
 * - derive a canonical project root from a resolved config file path
 * - resolve relative paths under that project root
 * - resolve the configured working directory to an absolute path
 */
import { basename, dirname, isAbsolute, resolve } from 'node:path';

/**
 * Derive the canonical project root from a config file path.
 *
 * Rules:
 * - If the config file is `.puppet-master/config.yaml` (or `.yml`) then the project
 *   root is the parent directory of `.puppet-master/`.
 * - Otherwise, treat the directory containing the config file as the project root.
 *
 * The returned path is always absolute (via `path.resolve()`).
 */
export function deriveProjectRootFromConfigPath(configPath: string): string {
  const resolvedConfigPath = resolve(configPath);

  const configBase = basename(resolvedConfigPath);
  const configDir = dirname(resolvedConfigPath);
  const configDirBase = basename(configDir);

  const isPuppetMasterConfig =
    configDirBase === '.puppet-master' && (configBase === 'config.yaml' || configBase === 'config.yml');

  if (isPuppetMasterConfig) {
    return dirname(configDir);
  }

  return configDir;
}

/**
 * Resolve a file/directory path under a canonical project root.
 *
 * - Absolute paths are returned as-is.
 * - Relative paths are resolved against the provided project root.
 */
export function resolveUnderProjectRoot(projectRoot: string, maybeRelativePath: string): string {
  if (isAbsolute(maybeRelativePath)) {
    return maybeRelativePath;
  }
  return resolve(projectRoot, maybeRelativePath);
}

/**
 * Resolve the configured working directory to an absolute directory path.
 *
 * - Empty/whitespace values fall back to the project root.
 * - Absolute paths are returned as-is.
 * - Relative paths are resolved against the project root.
 */
export function resolveWorkingDirectory(projectRoot: string, configuredWorkingDir: string): string {
  const trimmed = configuredWorkingDir.trim();
  if (trimmed.length === 0) {
    return projectRoot;
  }
  if (isAbsolute(trimmed)) {
    return trimmed;
  }
  return resolve(projectRoot, trimmed);
}

