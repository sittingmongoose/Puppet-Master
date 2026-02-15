#!/usr/bin/env node

/**
 * Minimal MCP-like wrapper for gui-automation CLI.
 *
 * Protocol: newline-delimited JSON requests/responses.
 * Request: {"id":"...","method":"gui_run_scenario","params":{...}}
 * Response: {"id":"...","ok":true,"result":...} or {"id":"...","ok":false,"error":"..."}
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const manifestPath = path.join(repoRoot, 'puppet-master-rs', 'Cargo.toml');

function runGuiAutomation(args) {
  const cargoTargetDir = process.env.CARGO_TARGET_DIR || '/tmp/puppet-master-build';
  const tempDir = process.env.TMPDIR || '/tmp';
  const cmdArgs = ['run', '--quiet', '--manifest-path', manifestPath, '--bin', 'gui-automation', '--', ...args];
  const out = spawnSync('cargo', cmdArgs, {
    cwd: repoRoot,
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
    env: {
      ...process.env,
      CARGO_TARGET_DIR: cargoTargetDir,
      TMPDIR: tempDir,
    },
  });

  if (out.status !== 0) {
    throw new Error(`gui-automation failed: ${out.stderr || out.stdout || 'unknown error'}`);
  }

  return out.stdout.trim();
}

function parseJsonSafe(text) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// DRY:HELPER:writeInlineScenarioTempFile
function writeInlineScenarioTempFile(payload) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gui-automation-scenario-'));
  const scenarioPath = path.join(tempDir, 'scenario.json');
  const body = typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2);
  fs.writeFileSync(scenarioPath, body, 'utf8');
  return { tempDir, scenarioPath };
}

function handleRequest(req) {
  const method = req.method;
  const params = req.params || {};

  switch (method) {
    case 'gui_run_scenario': {
      const args = ['run'];
      if (params.scenarioPath && (params.scenario !== undefined || params.scenarioJson !== undefined)) {
        throw new Error('Provide either params.scenarioPath or inline params.scenario/params.scenarioJson, not both');
      }

      let inlineScenarioTemp = null;
      if (params.scenarioPath) {
        args.push('--scenario', String(params.scenarioPath));
      } else if (params.scenario !== undefined || params.scenarioJson !== undefined) {
        const payload = params.scenario !== undefined ? params.scenario : params.scenarioJson;
        inlineScenarioTemp = writeInlineScenarioTempFile(payload);
        args.push('--scenario', inlineScenarioTemp.scenarioPath);
      }

      if (params.mode) args.push('--mode', String(params.mode));
      if (params.workspace) args.push('--workspace', String(params.workspace));
      if (params.artifacts) args.push('--artifacts', String(params.artifacts));
      if (params.runId) args.push('--run-id', String(params.runId));
      if (params.resultPath) args.push('--result-path', String(params.resultPath));

      try {
        return parseJsonSafe(runGuiAutomation(args));
      } finally {
        if (inlineScenarioTemp) {
          fs.rmSync(inlineScenarioTemp.tempDir, { recursive: true, force: true });
        }
      }
    }

    case 'gui_run_step': {
      if (!params.step) {
        throw new Error('Missing required params.step');
      }
      const args = ['run-step', '--step-json', JSON.stringify(params.step)];
      if (params.mode) args.push('--mode', String(params.mode));
      if (params.workspace) args.push('--workspace', String(params.workspace));
      if (params.artifacts) args.push('--artifacts', String(params.artifacts));
      if (params.runId) args.push('--run-id', String(params.runId));
      if (params.resultPath) args.push('--result-path', String(params.resultPath));
      return parseJsonSafe(runGuiAutomation(args));
    }

    case 'gui_get_debug_feed': {
      if (!params.timelinePath) {
        throw new Error('Missing required params.timelinePath');
      }
      return runGuiAutomation(['get-debug-feed', '--timeline', String(params.timelinePath)]);
    }

    case 'gui_get_artifact': {
      if (!params.manifestPath || !params.relativePath) {
        throw new Error('Missing required params.manifestPath and params.relativePath');
      }
      return runGuiAutomation([
        'get-artifact',
        '--manifest',
        String(params.manifestPath),
        '--path',
        String(params.relativePath),
      ]);
    }

    case 'gui_list_actions': {
      return parseJsonSafe(runGuiAutomation(['list-actions']));
    }

    case 'gui_server_info': {
      return {
        name: 'gui-automation-mcp-wrapper',
        methods: [
          'gui_run_scenario',
          'gui_run_step',
          'gui_get_debug_feed',
          'gui_get_artifact',
          'gui_list_actions',
        ],
        manifestPath,
      };
    }

    default:
      throw new Error(`Unknown method: ${method}`);
  }
}

function respond(id, ok, payload) {
  const body = ok ? { id, ok: true, result: payload } : { id, ok: false, error: String(payload) };
  process.stdout.write(`${JSON.stringify(body)}\n`);
}

const rl = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });

rl.on('line', (line) => {
  if (!line.trim()) return;

  let req;
  try {
    req = JSON.parse(line);
  } catch (err) {
    respond(null, false, `Invalid JSON request: ${err.message}`);
    return;
  }

  try {
    const result = handleRequest(req);
    respond(req.id ?? null, true, result);
  } catch (err) {
    respond(req.id ?? null, false, err.message || String(err));
  }
});

rl.on('close', () => {
  process.exit(0);
});
