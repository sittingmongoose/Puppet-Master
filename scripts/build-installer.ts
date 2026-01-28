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

  return { platform, arch, nodeVersion, outDir, workDir };
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

  // 6) Install Playwright Chromium into payload/playwright-browsers
  console.log('\n🌐 Installing Playwright Chromium into staged payload...\n');
  await ensureDir(browsersDir);
  await run('npx', ['playwright', 'install', 'chromium'], {
    cwd: appDir,
    env: {
      PLAYWRIGHT_BROWSERS_PATH: browsersDir,
    },
  });

  // 7) Create launchers
  console.log('\n🚀 Writing launcher scripts...\n');
  const unixLauncher = `#!/usr/bin/env sh
set -eu
SCRIPT_DIR=$(CDPATH= cd -- \"$(dirname -- \"$0\")\" && pwd)
ROOT_DIR=$(cd \"$SCRIPT_DIR/..\" && pwd)
NODE_BIN=\"$ROOT_DIR/node/bin/node\"
APP_ENTRY=\"$ROOT_DIR/app/dist/cli/index.js\"
export PATH=\"$ROOT_DIR/node/bin:$PATH\"
export PLAYWRIGHT_BROWSERS_PATH=\"$ROOT_DIR/playwright-browsers\"
exec \"$NODE_BIN\" \"$APP_ENTRY\" \"$@\"
`;
  const winLauncher = `@echo off\r
setlocal\r
set \"SCRIPT_DIR=%~dp0\"\r
set \"ROOT_DIR=%SCRIPT_DIR%..\"\r
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
  ]);

  return artifact;
}

async function buildMacPkgAndDmg(args: Args, repoRoot: string, stageRoot: string, outDir: string, version: string): Promise<string> {
  await ensureDir(outDir);

  const pkgOut = path.join(outDir, `puppet-master-${version}-mac-${args.arch}.pkg`);
  const dmgOut = path.join(outDir, `puppet-master-${version}-mac-${args.arch}.dmg`);

  const payloadDir = path.join(stageRoot, 'payload');
  const scriptsDir = path.join(repoRoot, 'installer', 'mac', 'scripts');
  if (!existsSync(scriptsDir)) {
    throw new Error(`Missing mac installer scripts dir: ${scriptsDir}`);
  }
  const postinstallPath = path.join(scriptsDir, 'postinstall');
  if (existsSync(postinstallPath)) {
    await chmod(postinstallPath, 0o755);
  }

  console.log('\n🧱 Building macOS pkg...\n');
  // Install puppet-master directory under /usr/local/lib
  await run('pkgbuild', [
    '--root',
    payloadDir,
    '--install-location',
    '/usr/local/lib',
    '--identifier',
    'com.rwm.puppet-master',
    '--version',
    version,
    '--scripts',
    scriptsDir,
    pkgOut,
  ]);

  console.log('\n🧱 Building macOS dmg (containing the pkg)...\n');
  const dmgStage = path.join(stageRoot, 'dmg');
  await emptyDir(dmgStage);
  await (await import('node:fs/promises')).copyFile(pkgOut, path.join(dmgStage, path.basename(pkgOut)));
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
exec /opt/puppet-master/bin/puppet-master \"$@\"
`;
  await writeFile(path.join(usrBinDir, 'puppet-master'), wrapper, { encoding: 'utf8', mode: 0o755 });

  const debOut = path.join(outDir, `puppet-master-${version}-linux-${args.arch}.deb`);
  const rpmOut = path.join(outDir, `puppet-master-${version}-linux-${args.arch}.rpm`);

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
  console.log(`out:      ${outDir}\n`);

  await emptyDir(stageRoot);
  await ensureDir(outDir);

  await stageApp(args, repoRoot, stageRoot, version);

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

