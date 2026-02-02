import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { EvidenceStore } from '../memory/evidence-store.js';
import { ScriptVerifier } from './script-verifier.js';

async function makeTempDir(prefix: string): Promise<string> {
  return await fs.mkdtemp(path.join(os.tmpdir(), prefix));
}

async function writeExecutableScript(filePath: string, contents: string): Promise<void> {
  await fs.writeFile(filePath, contents, 'utf-8');
  await fs.chmod(filePath, 0o755);
}

describe('ScriptVerifier', () => {
  let tempDir: string;
  let evidenceDir: string;

  beforeEach(async () => {
    tempDir = await makeTempDir('pm-script-verifier-');
    evidenceDir = path.join(tempDir, 'evidence');
  });

  afterEach(async () => {
    // Best-effort cleanup
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it('passes when script exits 0 and prints PASS', async () => {
    const scriptPath = path.join(tempDir, 'verify-ok.sh');
    await writeExecutableScript(
      scriptPath,
      `#!/usr/bin/env bash
set -e
echo "PASS"
exit 0
`
    );

    const evidenceStore = new EvidenceStore(evidenceDir);
    await evidenceStore.initialize();

    const verifier = new ScriptVerifier(evidenceStore);
    const result = await verifier.verify({
      id: 'ST-001-001-001-AC-001',
      description: 'script should pass',
      type: 'script',
      target: scriptPath,
      verification: scriptPath,
      priority: 'MUST',
    });

    expect(result.passed).toBe(true);
    expect(result.type).toBe('script');
    expect(result.target).toBe(scriptPath);
    expect(result.evidencePath).toBeDefined();
    expect(result.summary).toContain('passed');

    const evidenceContent = await fs.readFile(result.evidencePath!, 'utf-8');
    expect(evidenceContent).toContain('--- STDOUT ---');
    expect(evidenceContent).toContain('PASS');
  });

  it('fails when script exits non-zero', async () => {
    const scriptPath = path.join(tempDir, 'verify-fail.sh');
    await writeExecutableScript(
      scriptPath,
      `#!/usr/bin/env bash
echo "PASS"
exit 2
`
    );

    const evidenceStore = new EvidenceStore(evidenceDir);
    await evidenceStore.initialize();

    const verifier = new ScriptVerifier(evidenceStore);
    const result = await verifier.verify({
      id: 'ST-001-001-001-AC-002',
      description: 'script should fail',
      type: 'script',
      target: scriptPath,
      verification: scriptPath,
      priority: 'MUST',
    });

    expect(result.passed).toBe(false);
    expect(result.type).toBe('script');
    expect(result.evidencePath).toBeDefined();
  });

  it('fails when PASS token is missing', async () => {
    const scriptPath = path.join(tempDir, 'verify-no-pass.sh');
    await writeExecutableScript(
      scriptPath,
      `#!/usr/bin/env bash
echo "OK"
exit 0
`
    );

    const evidenceStore = new EvidenceStore(evidenceDir);
    await evidenceStore.initialize();

    const verifier = new ScriptVerifier(evidenceStore);
    const result = await verifier.verify({
      id: 'ST-001-001-001-AC-003',
      description: 'script missing PASS token',
      type: 'script',
      target: scriptPath,
      verification: scriptPath,
      priority: 'MUST',
    });

    expect(result.passed).toBe(false);
    expect(result.summary).toContain('PASS');
  });
});

