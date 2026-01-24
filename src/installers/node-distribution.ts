/**
 * Node.js distribution helpers for building platform installers.
 *
 * We ship an embedded Node runtime (not a single-binary bundler) because this
 * project is ESM + ships GUI assets + uses Playwright; single-binary bundlers
 * are brittle with these constraints.
 */

export type NodePlatform = 'win32' | 'darwin' | 'linux';
export type NodeArch = 'x64' | 'arm64';

export interface NodeDistributionSpec {
  version: string; // e.g. "20.11.1"
  platform: NodePlatform;
  arch: NodeArch;
}

export interface NodeDistributionArtifact {
  /** Filename of the Node distribution archive */
  filename: string;
  /** Full URL to download the Node distribution archive */
  url: string;
  /** Top-level directory expected after extraction */
  extractedTopLevelDirName: string;
}

function assertSupportedPlatform(platform: string): asserts platform is NodePlatform {
  if (platform !== 'win32' && platform !== 'darwin' && platform !== 'linux') {
    throw new Error(`Unsupported platform: ${platform}`);
  }
}

function assertSupportedArch(arch: string): asserts arch is NodeArch {
  if (arch !== 'x64' && arch !== 'arm64') {
    throw new Error(`Unsupported arch: ${arch}`);
  }
}

function normalizeVersion(version: string): string {
  // Accept "v20.11.1" or "20.11.1"
  return version.startsWith('v') ? version.slice(1) : version;
}

function nodeDistPlatformSegment(platform: NodePlatform): string {
  // Node dist uses "win", "darwin", "linux"
  if (platform === 'win32') return 'win';
  return platform;
}

function nodeDistArchiveExt(platform: NodePlatform): 'zip' | 'tar.gz' | 'tar.xz' {
  // Windows: zip, macOS: tar.gz, Linux: tar.xz
  if (platform === 'win32') return 'zip';
  if (platform === 'darwin') return 'tar.gz';
  return 'tar.xz';
}

function nodeDistFilename(version: string, platform: NodePlatform, arch: NodeArch): string {
  const v = normalizeVersion(version);
  const plat = nodeDistPlatformSegment(platform);
  const ext = nodeDistArchiveExt(platform);
  return `node-v${v}-${plat}-${arch}.${ext}`;
}

function nodeDistExtractedDir(version: string, platform: NodePlatform, arch: NodeArch): string {
  const v = normalizeVersion(version);
  const plat = nodeDistPlatformSegment(platform);
  return `node-v${v}-${plat}-${arch}`;
}

/**
 * Returns the official Node.js distribution URL for the given platform/arch.
 *
 * Note: For simplicity we use `nodejs.org/dist`. Version selection is controlled
 * by the caller (CI can pin via env var).
 */
export function getNodeDistribution(spec: NodeDistributionSpec): NodeDistributionArtifact {
  assertSupportedPlatform(spec.platform);
  assertSupportedArch(spec.arch);

  const version = normalizeVersion(spec.version);
  const filename = nodeDistFilename(version, spec.platform, spec.arch);
  const extractedTopLevelDirName = nodeDistExtractedDir(version, spec.platform, spec.arch);
  const url = `https://nodejs.org/dist/v${version}/${filename}`;

  return { filename, url, extractedTopLevelDirName };
}

