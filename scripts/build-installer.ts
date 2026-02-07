#!/usr/bin/env node
/**
 * Build platform-specific installers that bundle an embedded Node runtime.
 *
 * Outputs:
 * - Windows: NSIS .exe
 * - macOS: .pkg wrapped in .dmg
 * - Linux: .deb and .rpm (via nfpm)
 *
 * This script is designed to be executed on the target OS in CI, because:
 * - native deps (e.g. better-sqlite3) must be built per-platform
 * - Playwright browser downloads are per-platform
 *
 * TODO: TAURI INTEGRATION (see docs/TAURI_INTEGRATION.md)
 * - Add --with-tauri flag to build and bundle Tauri desktop app
 * - Auto-detect Rust/Cargo availability with --auto-detect-tauri
 * - Build Tauri app before staging: `npx tauri build`
 * - Copy Tauri artifacts into payload:
 *   - Windows: src-tauri/target/release/puppet-master.exe → payload/app/
 *   - macOS: src-tauri/target/release/bundle/macos/Puppet Master.app → merge into .app bundle
 *   - Linux: src-tauri/target/release/puppet-master → payload/bin/puppet-master-gui
 * - Update shortcuts to launch Tauri app by default (with CLI fallback)
 * - Modify launcher scripts to prefer Tauri if available
 */

import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { chmod, mkdir, readdir, rm, rmdir, writeFile, cp, lstat, rename } from 'node:fs/promises';
import * as path from 'node:path';

import { getNodeDistribution, type NodeArch, type NodePlatform } from '../src/installers/node-distribution.js';

type InstallerPlatform = NodePlatform;
type InstallerArch = NodeArch;

interface Args {
  platform: InstallerPlatform;
  arch: InstallerArch;
  nodeVersion: string;
  outDir: string;
  workDir: string;
  withTauri: boolean;
  autoDetectTauri: boolean;
}

function parseArgs(argv: string[]): Args {
  const map = new Map<string, string>();
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      map.set(key, 'true');
    } else {
      map.set(key, next);
      i++;
    }
  }

  const platform = (map.get('platform') ?? process.platform) as InstallerPlatform;
  const arch = (map.get('arch') ?? (process.arch === 'x64' ? 'x64' : 'arm64')) as InstallerArch;
  const nodeVersion = map.get('node-version') ?? process.env.PUPPET_MASTER_NODE_VERSION ?? '20.11.1';
  const outDir = map.get('out-dir') ?? path.resolve(process.cwd(), 'dist', 'installers');
  const workDir = map.get('work-dir') ?? path.resolve(process.cwd(), 'installer-work');
  const withTauri = map.has('with-tauri');
  const autoDetectTauri = map.has('auto-detect-tauri');

  if (platform !== 'win32' && platform !== 'darwin' && platform !== 'linux') {
    throw new Error(`--platform must be win32|darwin|linux (got ${platform})`);
  }
  if (arch !== 'x64' && arch !== 'arm64') {
    throw new Error(`--arch must be x64|arm64 (got ${arch})`);
  }

  // We intentionally only support native builds (run on matching OS).
  if (platform !== process.platform) {
    throw new Error(
      `Cross-building is not supported. Use a CI matrix. Requested platform=${platform} but current=${process.platform}`
    );
  }

  return { platform, arch, nodeVersion, outDir, workDir, withTauri, autoDetectTauri };
}

// TODO: TAURI - Detect if Rust/Cargo is available
async function detectTauriAvailable(): Promise<boolean> {
  try {
    // Ensure ~/.cargo/bin is in PATH for detection (GitHub Actions installs Rust there)
    const homeDir = process.env.HOME || process.env.USERPROFILE || '';
    const cargoPath = path.join(homeDir, '.cargo', 'bin');
    const pathSep = process.platform === 'win32' ? ';' : ':';
    const currentPath = process.env.PATH || '';
    const enhancedPath = currentPath.includes(cargoPath) ? currentPath : `${cargoPath}${pathSep}${currentPath}`;

    await run('cargo', ['--version'], { env: { PATH: enhancedPath } });
    return true;
  } catch {
    return false;
  }
}

async function buildTauriApp(repoRoot: string, platform: InstallerPlatform): Promise<string | null> {
  console.log('\n🦀 Building Tauri desktop app...\n');

  try {
    await ensureReactGuiBuild(repoRoot);

    // Ensure Cargo/Rust is in PATH (GitHub Actions installs to ~/.cargo/bin)
    const homeDir = process.env.HOME || process.env.USERPROFILE || '';
    const cargoPath = path.join(homeDir, '.cargo', 'bin');
    const pathSep = platform === 'win32' ? ';' : ':';
    const currentPath = process.env.PATH || '';
    const enhancedPath = currentPath.includes(cargoPath) ? currentPath : `${cargoPath}${pathSep}${currentPath}`;

    // Build the Tauri app (bundles + release binary).
    // Tauri CLI expects CI to be "true" or "false"; GitHub Actions sets CI=1, so normalize it.
    const env = {
      ...process.env,
      CI: process.env.CI ? 'true' : 'false',
      PATH: enhancedPath,
    };

    // Verify cargo is available
    console.log('  Checking for Cargo...');
    try {
      await run('cargo', ['--version'], { env });
      console.log('  ✓ Cargo found');
    } catch {
      console.error('  ✗ Cargo not found in PATH. Install Rust: https://rustup.rs');
      console.error('  Current PATH:', enhancedPath);
      return null;
    }

    // Add --verbose for better error diagnostics
    // Use --no-bundle to skip Tauri bundling (we create our own installers)
    // This avoids macOS DMG creation issues and speeds up the build
    // Use shell: true to ensure PATH resolution works on all platforms (including npm/npx)
    await run('npx', ['tauri', 'build', '--verbose', '--no-bundle'], { cwd: repoRoot, env });

    // Stage the runnable binary (simplest integration with our existing installers)
    const targetDir = path.join(repoRoot, 'src-tauri', 'target', 'release');

    // Diagnostic: list what Tauri produced (helps debug CI failures)
    console.log(`\n📋 Tauri build output (${platform}):`);
    try {
      const entries = await readdir(targetDir);
      const relevantFiles = entries.filter(f => f.startsWith('puppet') || f.endsWith('.exe') || f.endsWith('.app'));
      console.log(`  Files in ${targetDir}: ${relevantFiles.length > 0 ? relevantFiles.join(', ') : '(none matching puppet*)'}`);
    } catch {
      console.log(`  Could not list ${targetDir}`);
    }

    // Check multiple possible binary paths (handles different Tauri versions/configs)
    const possiblePaths = platform === 'win32'
      ? [path.join(targetDir, 'puppet-master.exe')]
      : [
          path.join(targetDir, 'puppet-master'),
          // macOS ARM might use different names
          path.join(targetDir, 'Puppet Master'),
          path.join(targetDir, 'puppet_master'),
        ];

    let foundBinary: string | null = null;
    for (const p of possiblePaths) {
      if (existsSync(p)) {
        foundBinary = p;
        console.log(`  ✓ Found Tauri binary at: ${p}`);
        break;
      }
    }

    // Verify the binary exists before returning
    if (!foundBinary) {
      console.error(`⚠️  Tauri binary not found at any expected path:`);
      for (const p of possiblePaths) {
        console.error(`     - ${p}`);
      }
      // List what's in the target directory
      try {
        const entries = await readdir(targetDir);
        console.error('   Actual files in target/release:', entries.slice(0, 20).join(', '));
      } catch {
        console.error('   Could not list target directory');
      }
      // Still return the first expected path (let the caller handle the missing file)
      return possiblePaths[0];
    }

    return foundBinary;
  } catch (error) {
    console.error('❌ Tauri build failed:', error instanceof Error ? error.message : String(error));
    // Print more details for debugging
    if (error instanceof Error && error.stack) {
      console.error('   Stack:', error.stack.split('\n').slice(0, 5).join('\n'));
    }
    return null;
  }
}

// TODO: TAURI - Copy Tauri artifacts into payload
async function stageTauriApp(tauriPath: string, payloadRoot: string, platform: InstallerPlatform): Promise<void> {
  console.log('\n📦 Staging Tauri desktop app...\n');

  if (platform === 'win32') {
    // Copy .exe (and any adjacent .dlls, if present) to app directory
    const appDir = path.join(payloadRoot, 'app');
    await ensureDir(appDir);
    await cp(tauriPath, path.join(appDir, 'puppet-master-gui.exe'));

    try {
      const releaseDir = path.dirname(tauriPath);
      const entries = await readdir(releaseDir);
      const dlls = entries.filter((e) => e.toLowerCase().endsWith('.dll'));
      for (const dll of dlls) {
        await cp(path.join(releaseDir, dll), path.join(appDir, dll));
      }
    } catch {
      // Best-effort
    }

  } else {
    // Copy binary to bin directory
    const binDir = path.join(payloadRoot, 'bin');
    await ensureDir(binDir);
    await cp(tauriPath, path.join(binDir, 'puppet-master-gui'));
    await chmod(path.join(binDir, 'puppet-master-gui'), 0o755);
  }
}

async function ensureDir(dir: string): Promise<void> {
  await mkdir(dir, { recursive: true });
}

/** Max retries for directory removal (handles ENOTEMPTY / busy filesystems in CI) */
const EMPTY_DIR_RETRIES = 5;
const EMPTY_DIR_RETRY_DELAY_MS = 2000;

/**
 * Recursively remove directory contents then the directory.
 * Used as fallback when rm(recursive) throws ENOTEMPTY (e.g. CI filesystem quirks).
 * Handles symlinks and entries that report as files but are dirs (EISDIR).
 */
async function removeDirRecursive(dir: string): Promise<void> {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    try {
      if (e.isDirectory() && !e.isSymbolicLink()) {
        await removeDirRecursive(full);
      } else {
        await rm(full, { force: true });
      }
    } catch (err) {
      const code = (err as NodeJS.ErrnoException)?.code;
      if (code === 'EISDIR' || (err as Error)?.message?.includes('is a directory')) {
        await removeDirRecursive(full);
      } else {
        throw err;
      }
    }
  }
  if (existsSync(dir)) {
    try {
      await rmdir(dir);
    } catch (err) {
      const code = (err as NodeJS.ErrnoException)?.code;
      if (code === 'ENOENT') return;
      if (code === 'ENOTEMPTY') {
        try {
          await rm(dir, { recursive: true, force: true });
        } catch {
          if (process.platform !== 'win32') {
            await run('rm', ['-rf', dir], { shell: false });
          } else {
            throw err;
          }
        }
        return;
      }
      throw err;
    }
  }
}

async function emptyDir(dir: string): Promise<void> {
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
    return;
  }
  let lastErr: Error | null = null;
  for (let attempt = 1; attempt <= EMPTY_DIR_RETRIES; attempt++) {
    try {
      await rm(dir, { recursive: true, force: true });
      break;
    } catch (err) {
      lastErr = err instanceof Error ? err : new Error(String(err));
      const isENOTEMPTY =
        (lastErr as NodeJS.ErrnoException).code === 'ENOTEMPTY' ||
        lastErr.message.includes('ENOTEMPTY') ||
        lastErr.message.includes('directory not empty');
      if (isENOTEMPTY) {
        try {
          await removeDirRecursive(dir);
          break;
        } catch (fallbackErr) {
          lastErr = fallbackErr instanceof Error ? fallbackErr : new Error(String(fallbackErr));
        }
      }
      if (attempt < EMPTY_DIR_RETRIES) {
        console.warn(`⚠️  emptyDir attempt ${attempt}/${EMPTY_DIR_RETRIES} failed, retrying in ${EMPTY_DIR_RETRY_DELAY_MS}ms...`);
        await new Promise((r) => setTimeout(r, EMPTY_DIR_RETRY_DELAY_MS));
      } else {
        // Last-resort: rename the directory out of the way so the build can proceed.
        // We've observed rare filesystem states where recursive removal fails with
        // "Directory not empty" even when the directory appears empty.
        try {
          const moved = `${dir}.old-${Date.now()}`;
          await rename(dir, moved);
          // Best-effort cleanup of the moved directory.
          try {
            await rm(moved, { recursive: true, force: true });
          } catch {
            // Ignore
          }
        } catch {
          // If rename fails, surface the original error.
          throw lastErr;
        }
      }
    }
  }
  await mkdir(dir, { recursive: true });
}

function run(
  cmd: string,
  args: string[],
  options: { cwd?: string; env?: NodeJS.ProcessEnv; shell?: boolean } = {}
): Promise<void> {
  // Default: shell on Windows (so .cmd/.bat resolve), no shell on Unix.
  const useShell = options.shell ?? (process.platform === 'win32');
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, {
      cwd: options.cwd,
      env: { ...process.env, ...options.env },
      stdio: 'inherit',
      // Avoid shells on Unix so paths with spaces are passed correctly.
      shell: useShell,
    });
    proc.on('error', reject);
    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Command failed: ${cmd} ${args.join(' ')} (exit ${code})`));
    });
  });
}

async function getPackageVersion(repoRoot: string): Promise<string> {
  // Keep it simple: read package.json via dynamic import? Avoid JSON import quirks; read from dist? We'll parse by filesystem.
  // Node 18+ supports fs/promises readFile but we can rely on small JSON via import with assert? Safer: read & JSON.parse.
  const pkgPath = path.join(repoRoot, 'package.json');
  const raw = await (await import('node:fs/promises')).readFile(pkgPath, 'utf8');
  const json = JSON.parse(raw) as { version?: unknown };
  if (!json.version || typeof json.version !== 'string') {
    throw new Error('package.json missing string "version"');
  }
  return json.version;
}

/**
 * Copy a directory with retry logic to handle transient file locks
 */
async function copyDirWithRetry(src: string, dst: string, maxRetries = 3): Promise<void> {
  await ensureDir(dst);
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Node 18+ cp supports recursive
      await cp(src, dst, { recursive: true });
      return;
    } catch (error) {
      if (attempt < maxRetries) {
        const delay = attempt * 1000; // Increasing delay: 1s, 2s, 3s
        console.warn(`⚠️  Copy attempt ${attempt}/${maxRetries} failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
}

async function copyDir(src: string, dst: string): Promise<void> {
  await ensureDir(dst);
  // Node 18+ cp supports recursive
  await cp(src, dst, { recursive: true });
}

/**
 * Remove optional native addons for other architectures from staged node_modules
 * so the .deb does not ship wrong-arch binaries (fixes Lintian binary-from-other-architecture).
 */
async function pruneOtherArchBinaries(appDir: string, arch: InstallerArch): Promise<void> {
  const nodeModules = path.join(appDir, 'node_modules');
  if (!existsSync(nodeModules)) return;

  const otherArchPatterns =
    arch === 'x64'
      ? ['arm64', 'aarch64']
      : ['x64', 'amd64', 'x86_64'];

  const toRemove: string[] = [];
  async function collect(root: string): Promise<void> {
    const entries = await readdir(root, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(root, e.name);
      if (e.isDirectory()) {
        if (otherArchPatterns.some((p) => e.name.toLowerCase().includes(p))) {
          toRemove.push(full);
        } else {
          await collect(full);
        }
      }
    }
  }
  await collect(nodeModules);
  toRemove.sort((a, b) => b.length - a.length);
  for (const dir of toRemove) {
    if (existsSync(dir)) {
      await rm(dir, { recursive: true, force: true });
    }
  }
  if (toRemove.length > 0) {
    console.log(`\n🗑  Pruned ${toRemove.length} other-arch optional native dir(s) from node_modules\n`);
  }
}

async function downloadNodeRuntime(args: Args, repoRoot: string, downloadDir: string, nodeOutDir: string): Promise<void> {
  const dist = getNodeDistribution({ version: args.nodeVersion, platform: args.platform, arch: args.arch });
  await ensureDir(downloadDir);

  const archivePath = path.join(downloadDir, dist.filename);
  if (!existsSync(archivePath)) {
    console.log(`\n⬇️  Downloading Node runtime: ${dist.url}\n`);
    // Use curl if available; shell: false so paths with spaces (e.g. "RWM Puppet Master") are not split.
    await run('curl', ['-fL', dist.url, '-o', archivePath], { cwd: repoRoot, shell: false });
  } else {
    console.log(`\nℹ️  Using cached Node archive: ${archivePath}\n`);
  }

  const extractDir = path.join(downloadDir, 'extracted');
  await emptyDir(extractDir);

  console.log('\n📦 Extracting Node runtime...\n');
  // Use tar (available on GitHub runners; also common locally). bsdtar can extract .zip.
  // Linux tar.xz requires -J; tar on mac and GNU tar on linux support it; bsdtar too.
  if (dist.filename.endsWith('.zip')) {
    await run('tar', ['-xf', archivePath, '-C', extractDir], { cwd: repoRoot, shell: false });
  } else if (dist.filename.endsWith('.tar.gz')) {
    await run('tar', ['-xzf', archivePath, '-C', extractDir], { cwd: repoRoot, shell: false });
  } else if (dist.filename.endsWith('.tar.xz')) {
    await run('tar', ['-xJf', archivePath, '-C', extractDir], { cwd: repoRoot, shell: false });
  } else {
    throw new Error(`Unknown Node archive extension: ${dist.filename}`);
  }

  const extractedRoot = path.join(extractDir, dist.extractedTopLevelDirName);
  if (!existsSync(extractedRoot)) {
    const entries = await readdir(extractDir);
    throw new Error(
      `Expected extracted directory "${dist.extractedTopLevelDirName}" not found. extractDir entries: ${entries.join(', ')}`
    );
  }

  await emptyDir(nodeOutDir);
  await copyDir(extractedRoot, nodeOutDir);
}

/**
 * Rewrite npm/npx/corepack in bundled Node to use relative paths instead of absolute CI paths.
 * This ensures the launchers work after installation (CI-built symlinks are broken on user machines).
 * 
 * This fixes the issue at BUILD time instead of relying only on postinstall scripts,
 * which provides better reliability and allows testing before packaging.
 */
async function fixNodeSymlinks(nodeDir: string, platform: InstallerPlatform): Promise<void> {
  const nodeBin = path.join(nodeDir, 'bin');
  const nodeExe = path.join(nodeBin, platform === 'win32' ? 'node.exe' : 'node');
  
  // Only fix on macOS and Linux (Unix platforms)
  if (platform === 'win32') {
    return;
  }
  
  // If node/bin is a symlink (e.g. fs.cp converted relative to absolute), replace with real dir
  // so we can write launcher scripts into the payload
  if (existsSync(nodeBin)) {
    try {
      const stat = await lstat(nodeBin);
      if (stat.isSymbolicLink()) {
        const tmpBin = path.join(nodeDir, 'bin.fix.' + Date.now());
        await mkdir(tmpBin, { recursive: true });
        const entries = await readdir(nodeBin, { withFileTypes: true });
        for (const e of entries) {
          const src = path.join(nodeBin, e.name);
          const dst = path.join(tmpBin, e.name);
          if (e.isDirectory()) {
            await cp(src, dst, { recursive: true });
          } else {
            await cp(src, dst);
          }
        }
        await rm(nodeBin, { force: true });
        await mkdir(nodeBin, { recursive: true });
        const tmpEntries = await readdir(tmpBin, { withFileTypes: true });
        for (const e of tmpEntries) {
          const src = path.join(tmpBin, e.name);
          const dst = path.join(nodeBin, e.name);
          if (e.isDirectory()) {
            await cp(src, dst, { recursive: true });
          } else {
            await cp(src, dst);
          }
        }
        await rm(tmpBin, { recursive: true, force: true });
      }
    } catch (err) {
      console.warn('⚠️  Could not replace node/bin symlink:', (err as Error).message);
    }
  }
  await ensureDir(nodeBin);
  // Verify Node binary exists
  if (!existsSync(nodeExe)) {
    console.warn(`⚠️  Node binary not found at ${nodeExe}, skipping symlink fix`);
    return;
  }
  
  const npmCli = path.join(nodeDir, 'lib', 'node_modules', 'npm', 'bin', 'npm-cli.js');
  const npxCli = path.join(nodeDir, 'lib', 'node_modules', 'npm', 'bin', 'npx-cli.js');
  const corepackCli = path.join(nodeDir, 'lib', 'node_modules', 'corepack', 'dist', 'corepack.js');
  
  const launchers = [
    { name: 'npm', cli: npmCli, cliPath: '../lib/node_modules/npm/bin/npm-cli.js' },
    { name: 'npx', cli: npxCli, cliPath: '../lib/node_modules/npm/bin/npx-cli.js' },
    { name: 'corepack', cli: corepackCli, cliPath: '../lib/node_modules/corepack/dist/corepack.js' },
  ];
  
  let fixedCount = 0;
  for (const launcher of launchers) {
    const launcherPath = path.join(nodeBin, launcher.name);
    
    // Skip if CLI doesn't exist
    if (!existsSync(launcher.cli)) {
      continue;
    }
    
    // Remove existing (likely a symlink with absolute CI path)
    if (existsSync(launcherPath)) {
      await rm(launcherPath, { force: true });
    }
    // Create a script launcher that uses relative paths (write to temp then rename to avoid ENOENT via symlinks)
    const script = `#!/bin/sh
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
NODE_EXE="$SCRIPT_DIR/node"
CLI="$SCRIPT_DIR/${launcher.cliPath}"
exec "$NODE_EXE" "$CLI" "$@"
`;
    const tmpPath = path.join(nodeDir, '.tmp.' + launcher.name + '.' + Date.now());
    await writeFile(tmpPath, script, { encoding: 'utf8', mode: 0o755 });
    await rename(tmpPath, launcherPath);
    fixedCount++;
  }
  
  if (fixedCount > 0) {
    console.log(`  ✓ Rewrote ${fixedCount} Node launcher(s) to use relative paths`);
  }
}

async function ensureReactGuiBuild(repoRoot: string): Promise<void> {
  const reactRoot = path.join(repoRoot, 'src', 'gui', 'react');
  const reactDistSrc = path.join(reactRoot, 'dist');
  const reactNodeModules = path.join(reactRoot, 'node_modules');
  if (!existsSync(reactNodeModules)) {
    console.log('\n📦 Installing React GUI dependencies...\n');
    await run('npm', ['--prefix', reactRoot, 'ci'], { cwd: repoRoot });
  }
  console.log('\n🧱 Building React GUI...\n');
  await run('npm', ['--prefix', reactRoot, 'run', 'build'], { cwd: repoRoot });
  if (!existsSync(reactDistSrc)) {
    throw new Error('React GUI build did not produce dist/; check build logs above.');
  }
}

async function stageApp(args: Args, repoRoot: string, stageRoot: string, version: string): Promise<void> {
  const payloadRoot = path.join(stageRoot, 'payload', 'puppet-master');
  const nodeDir = path.join(payloadRoot, 'node');
  const appDir = path.join(payloadRoot, 'app');
  const browsersDir = path.join(payloadRoot, 'playwright-browsers');
  const binDir = path.join(payloadRoot, 'bin');

  await emptyDir(payloadRoot);
  await ensureDir(binDir);

  // 1) Always build TypeScript (tsc) so installers contain the latest changes.
  console.log('\n🛠  Building TypeScript (tsc)...\n');
  await run('npm', ['run', 'build'], { cwd: repoRoot });

  // 2) Copy compiled output
  console.log('\n📁 Staging compiled output...\n');
  await ensureDir(appDir);
  await copyDir(path.join(repoRoot, 'dist'), path.join(appDir, 'dist'));

  // 3) Copy GUI static assets into dist/gui/public
  console.log('\n🎛  Staging GUI static assets...\n');
  const guiPublicSrc = path.join(repoRoot, 'src', 'gui', 'public');
  const guiPublicDst = path.join(appDir, 'dist', 'gui', 'public');
  await emptyDir(guiPublicDst);
  await copyDir(guiPublicSrc, guiPublicDst);

  // 3b) Copy React SPA build into dist/gui/react/dist (for .app bundle and server getReactBuildPath())
  if (args.platform === 'darwin' || args.platform === 'linux' || args.platform === 'win32') {
    await ensureReactGuiBuild(repoRoot);
    const reactDistSrc = path.join(repoRoot, 'src', 'gui', 'react', 'dist');
    if (existsSync(reactDistSrc)) {
      console.log('\n📦 Staging React GUI build...\n');
      const reactDistDst = path.join(appDir, 'dist', 'gui', 'react', 'dist');
      await ensureDir(path.dirname(reactDistDst));
      await copyDir(reactDistSrc, reactDistDst);
    } else {
      throw new Error('React GUI build not found after build step; ensure "npm run gui:build" succeeds.');
    }
  }

  // Copy app icon assets into payload for installers
  const assetsDir = path.join(repoRoot, 'installer', 'assets');
  const iconPng = path.join(assetsDir, 'puppet-master.png');
  if (!existsSync(iconPng)) {
    throw new Error(`Missing installer icon asset: ${iconPng}`);
  }
  await cp(iconPng, path.join(payloadRoot, 'puppet-master.png'));

  // 4) Copy package manifests and install production dependencies
  console.log('\n📦 Installing production dependencies into staged app...\n');
  await (await import('node:fs/promises')).copyFile(path.join(repoRoot, 'package.json'), path.join(appDir, 'package.json'));
  if (existsSync(path.join(repoRoot, 'package-lock.json'))) {
    await (await import('node:fs/promises')).copyFile(
      path.join(repoRoot, 'package-lock.json'),
      path.join(appDir, 'package-lock.json')
    );
  }

  await run('npm', ['ci', '--omit=dev'], { cwd: appDir, env: { npm_config_update_notifier: 'false' } });

  // 5) Download Node runtime into payload/node
  console.log('\n🧩 Staging embedded Node runtime...\n');
  // Keep downloads outside the per-platform stageRoot so repeated runs can reuse archives.
  const downloadsDir = path.join(path.dirname(stageRoot), 'downloads');
  await downloadNodeRuntime(args, repoRoot, downloadsDir, nodeDir);

  // 5a) Fix npm/npx/corepack symlinks to use relative paths (not CI absolute paths)
  // This ensures they work after installation without relying solely on postinstall
  if (args.platform === 'darwin' || args.platform === 'linux') {
    console.log('\n🔧 Fixing Node.js launcher symlinks...\n');
    await fixNodeSymlinks(nodeDir, args.platform);
  }

  // 5b) Rebuild native modules with bundled Node so ABI matches (e.g. better-sqlite3)
  // Windows: invoke bundled node.exe directly (bypass PATH) so node-gyp uses correct Node ABI
  // Unix: use PATH with nodeDir/bin so npm/rebuild uses bundled Node
  console.log('\n🔨 Rebuilding native modules for bundled Node...\n');
  // Try multiple times with delays to handle transient file locks
  let rebuildSuccess = false;
  const maxRetries = 3;
  
  const runRebuild = async (): Promise<void> => {
    if (args.platform === 'win32') {
      const nodeExe = path.join(nodeDir, 'node.exe');
      const npmCli = path.join(nodeDir, 'node_modules', 'npm', 'bin', 'npm-cli.js');
      await run(nodeExe, [npmCli, 'rebuild', '--verbose'], { cwd: appDir, shell: false });
    } else {
      const nodeBin = path.join(nodeDir, 'bin');
      const pathEnv = `${nodeBin}${path.delimiter}${process.env.PATH ?? ''}`;
      await run('npm', ['rebuild', '--verbose'], { cwd: appDir, env: { ...process.env, PATH: pathEnv } });
    }
  };

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await runRebuild();
      rebuildSuccess = true;
      console.log('  ✓ Native modules rebuilt successfully');
      break;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      if (attempt < maxRetries) {
        console.warn(`⚠️  Native module rebuild attempt ${attempt}/${maxRetries} failed, retrying in 3 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 3000));
      } else {
        console.error('❌ Native module rebuild failed after', maxRetries, 'attempts:', errorMsg);
        // Fatal on all platforms: load test will verify ABI compatibility before packaging
        throw new Error(`Failed to rebuild native modules after ${maxRetries} attempts. better-sqlite3 ABI mismatch cannot be resolved.`);
      }
    }
  }
  
  // Validate better_sqlite3.node exists after rebuild (critical for all platforms)
  if (rebuildSuccess) {
    const betterSqlitePath = path.join(appDir, 'node_modules', 'better-sqlite3', 'build', 'Release', 'better_sqlite3.node');
    if (!existsSync(betterSqlitePath)) {
      throw new Error(`Critical: better_sqlite3.node not found at ${betterSqlitePath} after rebuild. Cannot proceed with installer.`);
    }
    console.log('  ✓ Validated better_sqlite3.node exists');
  }

  // Load test: Verify better-sqlite3 is ABI-compatible with bundled Node
  // This catches mismatch errors before packaging (when still fixable) vs at runtime (when too late)
  console.log('\n✅ Testing better-sqlite3 ABI compatibility with bundled Node...\n');
  const betterSqliteLoadTest = `
const db = require('better-sqlite3');
const { version } = process.versions;
console.log('✓ better-sqlite3 loaded successfully with Node', version);
process.exit(0);
`;

  try {
    if (args.platform === 'win32') {
      const nodeExe = path.join(nodeDir, 'node.exe');
      await run(nodeExe, ['-e', betterSqliteLoadTest], { cwd: appDir, shell: false });
    } else {
      const nodeBin = path.join(nodeDir, 'bin');
      const pathEnv = `${nodeBin}${path.delimiter}${process.env.PATH ?? ''}`;
      await run(path.join(nodeBin, 'node'), ['-e', betterSqliteLoadTest], {
        cwd: appDir,
        env: { ...process.env, PATH: pathEnv },
        shell: false,
      });
    }
    console.log('  ✓ better-sqlite3 ABI compatibility verified');
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('❌ better-sqlite3 failed to load:', errorMsg);
    throw new Error(`better-sqlite3 ABI mismatch detected with bundled Node. Rebuild produced incompatible binary. Error: ${errorMsg}`);
  }

  // 6) Install Playwright Chromium into payload/playwright-browsers
  console.log('\n🌐 Installing Playwright Chromium into staged payload...\n');
  await ensureDir(browsersDir);
  await run('npx', ['playwright', 'install', 'chromium'], {
    cwd: appDir,
    env: {
      PLAYWRIGHT_BROWSERS_PATH: browsersDir,
    },
  });

  // 6b) Linux .deb: remove other-arch optional native addons (fixes Lintian binary-from-other-architecture)
  if (args.platform === 'linux') {
    console.log('\n🧹 Pruning other-arch binaries from node_modules (Linux package)...\n');
    await pruneOtherArchBinaries(appDir, args.arch);
  }

  // 7) Create launchers
  console.log('\n🚀 Writing launcher scripts...\n');
  const unixLauncher = `#!/usr/bin/env sh
set -eu

# Resolve real script path when invoked via symlink (e.g. /usr/local/bin/puppet-master)
# so ROOT_DIR is the install dir (/usr/local/lib/puppet-master), not /usr/local.
SCRIPT_PATH=\"$0\"
if [ -L \"$SCRIPT_PATH\" ]; then
  TARGET=$(readlink \"$SCRIPT_PATH\")
  case \"$TARGET\" in
    /*) SCRIPT_PATH=\"$TARGET\" ;;
    *) SCRIPT_PATH=\"$(cd \"$(dirname \"$SCRIPT_PATH\")\" && pwd)/$TARGET\" ;;
  esac
fi

SCRIPT_DIR=$(cd \"$(dirname \"$SCRIPT_PATH\")\" && pwd)
ROOT_DIR=$(cd \"$SCRIPT_DIR/..\" && pwd)
NODE_BIN=\"$ROOT_DIR/node/bin/node\"
APP_ENTRY=\"$ROOT_DIR/app/dist/cli/index.js\"

# Validate Node.js exists
if [ ! -x \"$NODE_BIN\" ]; then
  echo "Error: Node.js not found or not executable: $NODE_BIN" >&2
  mkdir -p \"$HOME/.puppet-master/logs\" 2>/dev/null || true
  echo "[$(date -Iseconds)] Error: Node.js missing: $NODE_BIN" >> \"$HOME/.puppet-master/logs/crash.log\" 2>/dev/null || true
  exit 1
fi

# Validate app entry exists
if [ ! -f \"$APP_ENTRY\" ]; then
  echo "Error: Application entry not found: $APP_ENTRY" >&2
  mkdir -p \"$HOME/.puppet-master/logs\" 2>/dev/null || true
  echo "[$(date -Iseconds)] Error: App entry missing: $APP_ENTRY" >> \"$HOME/.puppet-master/logs/crash.log\" 2>/dev/null || true
  exit 1
fi

export PUPPET_MASTER_INSTALL_ROOT=\"$ROOT_DIR\"
export PATH=\"$ROOT_DIR/node/bin:$PATH\"
export PLAYWRIGHT_BROWSERS_PATH=\"$ROOT_DIR/playwright-browsers\"
exec \"$NODE_BIN\" \"$APP_ENTRY\" \"$@\"
`;
  const winLauncher = `@echo off\r
setlocal\r
set \"SCRIPT_DIR=%~dp0\"\r
set \"ROOT_DIR=%SCRIPT_DIR%..\"\r
set \"PUPPET_MASTER_INSTALL_ROOT=%ROOT_DIR%\"\r
set \"PATH=%ROOT_DIR%\\node;%PATH%\"\r
set \"PLAYWRIGHT_BROWSERS_PATH=%ROOT_DIR%\\playwright-browsers\"\r
\"%ROOT_DIR%\\node\\node.exe\" \"%ROOT_DIR%\\app\\dist\\cli\\index.js\" %*\r
`;

  if (args.platform === 'win32') {
    await writeFile(path.join(binDir, 'puppet-master.cmd'), winLauncher, 'utf8');
    
    // Copy PowerShell helper script for CLI installation (Phase 5.1)
    const scriptsDir = path.join(payloadRoot, 'scripts');
    await ensureDir(scriptsDir);
    const helperScript = path.join(repoRoot, 'installer', 'win', 'scripts', 'install-clis.ps1');
    if (existsSync(helperScript)) {
      await cp(helperScript, path.join(scriptsDir, 'install-clis.ps1'));
    }
    
    // Copy GUI launcher batch files to payload root for NSIS installation
    const guiLauncher = path.join(repoRoot, 'installer', 'win', 'scripts', 'Launch-Puppet-Master-GUI.bat');
    if (existsSync(guiLauncher)) {
      await cp(guiLauncher, path.join(payloadRoot, 'Launch-Puppet-Master-GUI.bat'));
    }
    const guiLauncherDebug = path.join(repoRoot, 'installer', 'win', 'scripts', 'Launch-Puppet-Master-GUI-Debug.bat');
    if (existsSync(guiLauncherDebug)) {
      await cp(guiLauncherDebug, path.join(payloadRoot, 'Launch-Puppet-Master-GUI-Debug.bat'));
    }

    const guiLauncherVbs = path.join(repoRoot, 'installer', 'win', 'scripts', 'Launch-Puppet-Master-GUI.vbs');
    if (existsSync(guiLauncherVbs)) {
      await cp(guiLauncherVbs, path.join(payloadRoot, 'Launch-Puppet-Master-GUI.vbs'));
    }
  } else {
    const launcherPath = path.join(binDir, 'puppet-master');
    await writeFile(launcherPath, unixLauncher, { encoding: 'utf8', mode: 0o755 });
  }

  // 8) Write a small version file for packagers/templates
  await writeFile(path.join(payloadRoot, 'VERSION.txt'), `${version}\n`, 'utf8');
}

function resolveMakensisCommand(): string {
  if (process.platform !== 'win32') {
    return 'makensis';
  }
  const explicit = process.env.MAKENSIS_PATH;
  if (explicit && existsSync(explicit)) {
    // Quote path so shell does not split on spaces (e.g. "C:\Program Files (x86)\NSIS\makensis.exe")
    return explicit.includes(' ') ? `"${explicit}"` : explicit;
  }
  const dir = process.env.NSISDIR;
  if (dir) {
    const joined = path.join(dir, 'makensis.exe');
    if (existsSync(joined)) {
      return joined.includes(' ') ? `"${joined}"` : joined;
    }
  }
  return 'makensis';
}

async function buildWindowsNsis(args: Args, repoRoot: string, stageRoot: string, outDir: string, version: string): Promise<string> {
  const nsiPath = path.join(repoRoot, 'installer', 'win', 'puppet-master.nsi');
  if (!existsSync(nsiPath)) {
    throw new Error(`Missing NSIS script: ${nsiPath}`);
  }

  await ensureDir(outDir);
  const artifact = path.join(outDir, `puppet-master-${version}-win-${args.arch}.exe`);

  const makensisCmd = resolveMakensisCommand();
  console.log('\n🧱 Building Windows NSIS installer...\n');
  await run(makensisCmd, [
    `/DVERSION=${version}`,
    `/DOUTFILE=${artifact}`,
    `/DSTAGE_DIR=${path.join(stageRoot, 'payload')}`,
    nsiPath,
  ], { cwd: repoRoot });

  return artifact;
}

/**
 * Build macOS .app bundle structure
 * Creates Puppet Master.app with Contents/MacOS, Contents/Resources, and Info.plist
 */
async function buildMacAppBundle(
  args: Args,
  repoRoot: string,
  stageRoot: string,
  version: string
): Promise<string> {
  const appName = 'Puppet Master.app';
  const appPath = path.join(stageRoot, 'app-bundle', appName);
  const contentsPath = path.join(appPath, 'Contents');
  const macosPath = path.join(contentsPath, 'MacOS');
  const resourcesPath = path.join(contentsPath, 'Resources');

  await emptyDir(appPath);
  await ensureDir(macosPath);
  await ensureDir(resourcesPath);

  // Copy payload into Contents/Resources/puppet-master
  const payloadSrc = path.join(stageRoot, 'payload', 'puppet-master');
  const resourcesPayload = path.join(resourcesPath, 'puppet-master');
  await copyDir(payloadSrc, resourcesPayload);

  const iconSrc = path.join(repoRoot, 'installer', 'assets', 'puppet-master.icns');
  if (!existsSync(iconSrc)) {
    throw new Error(`Missing macOS app icon: ${iconSrc}`);
  }
  await cp(iconSrc, path.join(resourcesPath, 'puppet-master.icns'));

  // Create MacOS executable: if Tauri binary present, delegate to `puppet-master gui` (single-instance); else run Node GUI only
  const macosExecutable = path.join(macosPath, 'Puppet Master');
  const macosScript = `#!/usr/bin/env sh
set -eu
APP_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
RESOURCES_DIR="$APP_ROOT/Contents/Resources"
ROOT_DIR="$RESOURCES_DIR/puppet-master"
NODE_BIN="$ROOT_DIR/node/bin/node"
APP_ENTRY="$ROOT_DIR/app/dist/cli/index.js"
TAURI_BIN="$ROOT_DIR/bin/puppet-master-gui"
LAUNCH_LOG="\${HOME:-/tmp}/.puppet-master/logs/launch.log"
LOG_DIR="\${HOME:-/tmp}/.puppet-master/logs"
LOG_FILE="$LOG_DIR/gui.log"

export PATH="$ROOT_DIR/node/bin:$PATH"
export PLAYWRIGHT_BROWSERS_PATH="$ROOT_DIR/playwright-browsers"
export PUPPET_MASTER_APP_ROOT="$ROOT_DIR"
export PUPPET_MASTER_INSTALL_ROOT="$ROOT_DIR"

fail_msg() {
  mkdir -p "$LOG_DIR"
  echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) $1" >> "$LAUNCH_LOG"
  osascript -e 'display alert "Puppet Master could not start" message "See ~/.puppet-master/logs/launch.log"' 2>/dev/null || true
  exit 1
}

# Pre-flight: Node and app entry must exist and be runnable
[ -x "$NODE_BIN" ] || fail_msg "Node.js not found or not executable: $NODE_BIN"
[ -f "$APP_ENTRY" ] || fail_msg "App entry not found: $APP_ENTRY"

GUI_CWD="\${HOME:-/tmp}"
cd "$GUI_CWD"
mkdir -p "$LOG_DIR"

# If Tauri desktop binary is present: delegate to puppet-master gui so it starts the
# server, launches Tauri exactly once, and shuts down the server when Tauri exits.
if [ -x "$TAURI_BIN" ]; then
  exec "$NODE_BIN" "$APP_ENTRY" gui
fi

# No Tauri: run Node GUI only (foreground or background depending on tty)
if [ -t 1 ]; then
  "$NODE_BIN" "$APP_ENTRY" gui || fail_msg "GUI exited with error."
else
  if ! "$NODE_BIN" "$APP_ENTRY" gui >> "$LOG_FILE" 2>&1; then
    fail_msg "GUI exited with error. See $LOG_FILE"
  fi
fi
`;
  await writeFile(macosExecutable, macosScript, { encoding: 'utf8', mode: 0o755 });

  // Create Info.plist
  const infoPlist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleExecutable</key>
  <string>Puppet Master</string>
  <key>CFBundleIdentifier</key>
  <string>com.rwm.puppet-master</string>
  <key>CFBundleName</key>
  <string>Puppet Master</string>
  <key>CFBundlePackageType</key>
  <string>APPL</string>
  <key>CFBundleIconFile</key>
  <string>puppet-master</string>
  <key>CFBundleVersion</key>
  <string>${version}</string>
  <key>CFBundleShortVersionString</key>
  <string>${version}</string>
  <key>LSMinimumSystemVersion</key>
  <string>10.13</string>
  <key>NSHighResolutionCapable</key>
  <true/>
</dict>
</plist>
`;
  await writeFile(path.join(contentsPath, 'Info.plist'), infoPlist, { encoding: 'utf8' });

  return appPath;
}

async function buildMacPkgAndDmg(args: Args, repoRoot: string, stageRoot: string, outDir: string, version: string): Promise<string> {
  await ensureDir(outDir);

  const pkgBasename = `puppet-master-${version}-mac-${args.arch}.pkg`;
  const dmgOut = path.join(outDir, `puppet-master-${version}-mac-${args.arch}.dmg`);

  // Build .app bundle
  console.log('\n🍎 Building macOS .app bundle...\n');
  await buildMacAppBundle(args, repoRoot, stageRoot, version);

  // Prepare app bundle directory for pkgbuild (directory containing only the .app)
  const appBundleDir = path.join(stageRoot, 'app-bundle');
  const scriptsDir = path.join(repoRoot, 'installer', 'mac', 'scripts');
  if (!existsSync(scriptsDir)) {
    throw new Error(`Missing mac installer scripts dir: ${scriptsDir}`);
  }
  const postinstallPath = path.join(scriptsDir, 'postinstall');
  if (existsSync(postinstallPath)) {
    await chmod(postinstallPath, 0o755);
  }

  // Build pkg only inside DMG staging (no standalone .pkg in outDir)
  const dmgStage = path.join(stageRoot, 'dmg');
  await emptyDir(dmgStage);
  const pkgOut = path.join(dmgStage, pkgBasename);

  console.log('\n🧱 Building macOS pkg (inside DMG)...\n');
  await run(
    'pkgbuild',
    [
      '--root',
      appBundleDir,
      '--install-location',
      '/Applications',
      '--identifier',
      'com.rwm.puppet-master',
      '--version',
      version,
      '--scripts',
      scriptsDir,
      pkgOut,
    ],
    { shell: false }
  );

  console.log('\n🧱 Building macOS dmg (containing the pkg)...\n');
  await run(
    'hdiutil',
    ['create', '-volname', 'Puppet Master', '-srcfolder', dmgStage, '-ov', '-format', 'UDZO', dmgOut],
    { shell: false }
  );

  return dmgOut;
}

async function buildLinuxPackages(args: Args, repoRoot: string, stageRoot: string, outDir: string, version: string): Promise<string[]> {
  await ensureDir(outDir);
  const nfpmConfig = path.join(repoRoot, 'installer', 'linux', 'nfpm.yaml');
  if (!existsSync(nfpmConfig)) {
    throw new Error(`Missing nfpm config: ${nfpmConfig}`);
  }

  const rootFs = path.join(stageRoot, 'rootfs');
  await emptyDir(rootFs);

  // Place payload into /opt/puppet-master
  const payloadSrc = path.join(stageRoot, 'payload', 'puppet-master');
  const optDst = path.join(rootFs, 'opt', 'puppet-master');
  await ensureDir(path.dirname(optDst));
  await copyDir(payloadSrc, optDst);

  // Place a wrapper into /usr/bin/puppet-master
  const usrBinDir = path.join(rootFs, 'usr', 'bin');
  await ensureDir(usrBinDir);
  const wrapper = `#!/usr/bin/env sh
set -eu
TARGET="/opt/puppet-master/bin/puppet-master"
if [ ! -x "$TARGET" ]; then
  echo "Error: Puppet Master launcher not found or not executable: $TARGET" >&2
  mkdir -p "$HOME/.puppet-master/logs" 2>/dev/null || true
  echo "[$(date -Iseconds)] Error: Launcher missing: $TARGET" >> "$HOME/.puppet-master/logs/crash.log" 2>/dev/null || true
  exit 1
fi
exec "$TARGET" "$@"
`;
  await writeFile(path.join(usrBinDir, 'puppet-master'), wrapper, { encoding: 'utf8', mode: 0o755 });

  // GUI launcher: run puppet-master gui and keep terminal open on exit so user can see errors
  const guiLauncher = `#!/usr/bin/env sh
set -eu
puppet-master gui "$@" || true
echo ""
echo "Press Enter to close this window."
read x
`;
  await writeFile(path.join(usrBinDir, 'puppet-master-gui'), guiLauncher, { encoding: 'utf8', mode: 0o755 });

  const postinstallPath = path.join(repoRoot, 'installer', 'linux', 'scripts', 'postinstall');
  if (existsSync(postinstallPath)) {
    await chmod(postinstallPath, 0o755);
  }

  const debOut = path.join(outDir, `rwm-puppet-master-${version}-linux-${args.arch}.deb`);
  const rpmOut = path.join(outDir, `rwm-puppet-master-${version}-linux-${args.arch}.rpm`);

  console.log('\n🧱 Building Linux deb...\n');
  await run('nfpm', ['pkg', '--packager', 'deb', '--config', nfpmConfig, '--target', debOut], {
    cwd: repoRoot,
    env: {
      PM_NFPM_ROOT: rootFs,
      PM_VERSION: version,
      PM_ARCH: args.arch === 'x64' ? 'amd64' : 'arm64',
    },
  });

  console.log('\n🧱 Building Linux rpm...\n');
  await run('nfpm', ['pkg', '--packager', 'rpm', '--config', nfpmConfig, '--target', rpmOut], {
    cwd: repoRoot,
    env: {
      PM_NFPM_ROOT: rootFs,
      PM_VERSION: version,
      PM_ARCH: args.arch === 'x64' ? 'amd64' : 'arm64',
    },
  });

  // Copy the GUI-friendly install.sh alongside the .deb so users can
  // double-click it instead of relying on gdebi (which crashes on large .deb files).
  const installSh = path.join(repoRoot, 'installer', 'linux', 'scripts', 'install.sh');
  if (existsSync(installSh)) {
    const installShDest = path.join(outDir, 'install.sh');
    await (await import('node:fs/promises')).copyFile(installSh, installShDest);
    await chmod(installShDest, 0o755);
    console.log(`  Copied install.sh → ${installShDest}`);
  }

  return [debOut, rpmOut];
}

async function main(): Promise<void> {
  const repoRoot = path.resolve(process.cwd());
  const args = parseArgs(process.argv.slice(2));
  const version = await getPackageVersion(repoRoot);

  const platformTag = `${args.platform}-${args.arch}`;
  const stageRoot = path.join(args.workDir, platformTag);
  const outDir = path.join(args.outDir, platformTag);

  console.log(`\n=== puppet-master installer build ===`);
  console.log(`platform: ${args.platform}`);
  console.log(`arch:     ${args.arch}`);
  console.log(`version:  ${version}`);
  console.log(`node:     ${args.nodeVersion}`);
  console.log(`stage:    ${stageRoot}`);
  console.log(`out:      ${outDir}`);

  // TODO: TAURI - Check if Tauri should be built
  let shouldBuildTauri = args.withTauri;
  if (args.autoDetectTauri && !shouldBuildTauri) {
    const tauriAvailable = await detectTauriAvailable();
    if (tauriAvailable) {
      console.log('\n✅ Rust/Cargo detected, Tauri build enabled');
      shouldBuildTauri = true;
    } else {
      console.log('\n⚠️  Rust/Cargo not found, skipping Tauri build');
    }
  }

  if (shouldBuildTauri) {
    console.log('\n🦀 Tauri build enabled (see docs/TAURI_INTEGRATION.md for details)\n');
  } else {
    console.log('\n📦 Building traditional installer (no Tauri)\n');
  }

  await emptyDir(stageRoot);
  await ensureDir(outDir);

  await stageApp(args, repoRoot, stageRoot, version);

  // TODO: TAURI - Build and stage Tauri app if requested
  if (shouldBuildTauri) {
    const tauriPath = await buildTauriApp(repoRoot, args.platform);
    if (tauriPath && existsSync(tauriPath)) {
      const payloadRoot = path.join(stageRoot, 'payload', 'puppet-master');
      await stageTauriApp(tauriPath, payloadRoot, args.platform);
      console.log('\n✅ Tauri app staged successfully\n');
    } else {
      // Diagnostic: show what files exist in target/release to help debug
      const targetDir = path.join(repoRoot, 'src-tauri', 'target', 'release');
      console.error(`\n❌ Tauri binary not found at expected path: ${tauriPath || '(null)'}`);
      try {
        const entries = await readdir(targetDir);
        console.error(`   Files in ${targetDir}:`);
        for (const entry of entries.slice(0, 20)) {
          console.error(`     - ${entry}`);
        }
        if (entries.length > 20) {
          console.error(`     ... and ${entries.length - 20} more`);
        }
      } catch {
        console.error(`   Could not list ${targetDir}`);
      }
      // When --with-tauri is explicitly requested, fail the build instead of continuing
      // This ensures CI catches Tauri build failures rather than silently building without it
      throw new Error(
        'Tauri build failed or artifacts not found. ' +
        'When using --with-tauri flag, the build must include the Tauri desktop application. ' +
        'Check the logs above for the actual build error.'
      );
    }
  }

  console.log(`\n📦 Building platform installer for ${args.platform}...`);
  try {
    if (args.platform === 'win32') {
      const artifact = await buildWindowsNsis(args, repoRoot, stageRoot, outDir, version);
      console.log(`\n✅ Built: ${artifact}\n`);
    } else if (args.platform === 'darwin') {
      const artifact = await buildMacPkgAndDmg(args, repoRoot, stageRoot, outDir, version);
      console.log(`\n✅ Built: ${artifact}\n`);
    } else {
      const artifacts = await buildLinuxPackages(args, repoRoot, stageRoot, outDir, version);
      console.log(`\n✅ Built: ${artifacts.join(', ')}\n`);
    }
  } catch (error) {
    console.error(`\n❌ Failed to build ${args.platform} installer:`);
    console.error(`   Error: ${error instanceof Error ? error.message : String(error)}`);
    if (error instanceof Error && error.stack) {
      console.error(`   Stack: ${error.stack.split('\n').slice(1, 4).join('\n          ')}`);
    }
    throw error;
  }
}

main().catch((error) => {
  console.error('Installer build failed:', error instanceof Error ? error.message : String(error));
  process.exit(1);
});
