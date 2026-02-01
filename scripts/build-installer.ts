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
import { chmod, mkdir, readdir, rm, writeFile, cp } from 'node:fs/promises';
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
    await run('cargo', ['--version'], {});
    return true;
  } catch {
    return false;
  }
}

// TODO: TAURI - Build Tauri application
async function buildTauriApp(repoRoot: string, platform: InstallerPlatform): Promise<string | null> {
  console.log('\n🦀 Building Tauri desktop app...\n');

  try {
    // Build the Tauri app (bundles + release binary).
    // Tauri CLI expects CI to be "true" or "false"; GitHub Actions sets CI=1, so normalize it.
    const env = { ...process.env, CI: process.env.CI ? 'true' : 'false' };
    await run('npx', ['tauri', 'build'], { cwd: repoRoot, env });

    // Stage the runnable binary (simplest integration with our existing installers)
    const targetDir = path.join(repoRoot, 'src-tauri', 'target', 'release');

    if (platform === 'win32') {
      return path.join(targetDir, 'puppet-master.exe');
    }
    return path.join(targetDir, 'puppet-master');
  } catch (error) {
    console.error('❌ Tauri build failed:', error);
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

async function emptyDir(dir: string): Promise<void> {
  if (existsSync(dir)) {
    await rm(dir, { recursive: true, force: true });
  }
  await mkdir(dir, { recursive: true });
}

function run(cmd: string, args: string[], options: { cwd?: string; env?: NodeJS.ProcessEnv } = {}): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, {
      cwd: options.cwd,
      env: { ...process.env, ...options.env },
      stdio: 'inherit',
      shell: process.platform === 'win32', // makes `npm`/`npx` resolution easier on Windows
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
    // Use curl if available; otherwise fall back to node https in future.
    await run('curl', ['-fL', dist.url, '-o', archivePath], { cwd: repoRoot });
  } else {
    console.log(`\nℹ️  Using cached Node archive: ${archivePath}\n`);
  }

  const extractDir = path.join(downloadDir, 'extracted');
  await emptyDir(extractDir);

  console.log('\n📦 Extracting Node runtime...\n');
  // Use tar (available on GitHub runners; also common locally). bsdtar can extract .zip.
  // Linux tar.xz requires -J; tar on mac and GNU tar on linux support it; bsdtar too.
  if (dist.filename.endsWith('.zip')) {
    await run('tar', ['-xf', archivePath, '-C', extractDir], { cwd: repoRoot });
  } else if (dist.filename.endsWith('.tar.gz')) {
    await run('tar', ['-xzf', archivePath, '-C', extractDir], { cwd: repoRoot });
  } else if (dist.filename.endsWith('.tar.xz')) {
    await run('tar', ['-xJf', archivePath, '-C', extractDir], { cwd: repoRoot });
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

async function stageApp(args: Args, repoRoot: string, stageRoot: string, version: string): Promise<void> {
  const payloadRoot = path.join(stageRoot, 'payload', 'puppet-master');
  const nodeDir = path.join(payloadRoot, 'node');
  const appDir = path.join(payloadRoot, 'app');
  const browsersDir = path.join(payloadRoot, 'playwright-browsers');
  const binDir = path.join(payloadRoot, 'bin');

  await emptyDir(payloadRoot);
  await ensureDir(binDir);

  // 1) Ensure dist exists
  if (!existsSync(path.join(repoRoot, 'dist'))) {
    console.log('\n🛠  Building TypeScript (tsc)...\n');
    await run('npm', ['run', 'build'], { cwd: repoRoot });
  }

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
    const reactDistSrc = path.join(repoRoot, 'src', 'gui', 'react', 'dist');
    if (existsSync(reactDistSrc)) {
      console.log('\n📦 Staging React GUI build...\n');
      const reactDistDst = path.join(appDir, 'dist', 'gui', 'react', 'dist');
      await ensureDir(path.dirname(reactDistDst));
      await copyDir(reactDistSrc, reactDistDst);
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

  // 5b) Rebuild native modules with bundled Node so ABI matches (e.g. better-sqlite3)
  const nodeBin = path.join(nodeDir, 'bin');
  const pathEnv = `${nodeBin}${path.delimiter}${process.env.PATH ?? ''}`;
  console.log('\n🔨 Rebuilding native modules for bundled Node...\n');
  await run('npm', ['rebuild'], { cwd: appDir, env: { ...process.env, PATH: pathEnv } });

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
    return explicit;
  }
  const dir = process.env.NSISDIR;
  if (dir) {
    const joined = path.join(dir, 'makensis.exe');
    if (existsSync(joined)) {
      return joined;
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

  // Create MacOS executable that runs puppet-master gui with pre-flight and failure alert
  const macosExecutable = path.join(macosPath, 'Puppet Master');
  const macosScript = `#!/usr/bin/env sh
set -eu
APP_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
RESOURCES_DIR="$APP_ROOT/Contents/Resources"
ROOT_DIR="$RESOURCES_DIR/puppet-master"
NODE_BIN="$ROOT_DIR/node/bin/node"
APP_ENTRY="$ROOT_DIR/app/dist/cli/index.js"
LAUNCH_LOG="\${HOME:-/tmp}/.puppet-master/logs/launch.log"
LOG_DIR="\${HOME:-/tmp}/.puppet-master/logs"

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

if [ -t 1 ]; then
  "$NODE_BIN" "$APP_ENTRY" gui || fail_msg "GUI exited with error."
else
  LOG_FILE="$LOG_DIR/gui.log"
  mkdir -p "$LOG_DIR"
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
  await run('pkgbuild', [
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
  ]);

  console.log('\n🧱 Building macOS dmg (containing the pkg)...\n');
  await run('hdiutil', ['create', '-volname', 'Puppet Master', '-srcfolder', dmgStage, '-ov', '-format', 'UDZO', dmgOut]);

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
      // When --with-tauri is explicitly requested, fail the build instead of continuing
      // This ensures CI catches Tauri build failures rather than silently building without it
      throw new Error(
        'Tauri build failed or artifacts not found. ' +
        'When using --with-tauri flag, the build must include the Tauri desktop application. ' +
        'Check the logs above for the actual build error.'
      );
    }
  }

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
}

main().catch((error) => {
  console.error('Installer build failed:', error instanceof Error ? error.message : String(error));
  process.exit(1);
});
