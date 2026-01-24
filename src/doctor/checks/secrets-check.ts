/**
 * Secrets Check for RWM Puppet Master Doctor System
 *
 * P2-T12: Secrets Management
 * - Scan tracked repository files for common secret patterns
 * - Verify `.gitignore` ignores `.env`
 * - Never emit raw secret values (mask any matched snippets)
 */

import { spawn, type ChildProcess } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { extname, join } from 'node:path';
import type { DoctorCheck, CheckResult } from '../check-registry.js';

interface SecretPattern {
  name: string;
  pattern: RegExp;
  critical: boolean;
}

interface SecretMatch {
  file: string;
  line: number;
  patternName: string;
  critical: boolean;
  maskedSnippet: string;
}

const SECRET_PATTERNS: SecretPattern[] = [
  {
    name: 'Context7 API key (ctx7sk-)',
    pattern: /\bctx7sk-[a-zA-Z0-9_-]{20,}\b/g,
    critical: true,
  },
  {
    name: 'GitHub token (gh*_...)',
    pattern: /\b(ghp|gho|ghu|ghs|ghr)_[a-zA-Z0-9]{36}\b/g,
    critical: true,
  },
  {
    name: 'OpenAI key (sk-...)',
    pattern: /\bsk-[a-zA-Z0-9]{20,}\b/g,
    critical: true,
  },
  {
    name: 'AWS access key (AKIA...)',
    pattern: /\bAKIA[0-9A-Z]{16}\b/g,
    critical: true,
  },
  {
    name: 'Private key block',
    pattern: /-----BEGIN\s+(?:RSA|DSA|EC|OPENSSH)?\s*PRIVATE\s+KEY-----/g,
    critical: true,
  },
  {
    name: 'Hardcoded secret assignment',
    // e.g., API_KEY=..., token: "...", password = '...'
    pattern:
      /\b(api[_-]?key|apikey|token|secret|password|passwd|pwd)\b\s*[:=]\s*['"]?[^'"\s]{8,}['"]?/gi,
    critical: false,
  },
];

const SKIP_EXTENSIONS = new Set([
  // images
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.svg',
  // binary/docs
  '.pdf',
  '.zip',
  '.gz',
  '.tgz',
  '.bz2',
  '.7z',
  '.exe',
  '.bin',
]);

function maskToken(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length <= 8) {
    return '***';
  }
  return `${trimmed.slice(0, 4)}...${trimmed.slice(-4)}`;
}

async function gitLsFiles(cwd: string): Promise<string[] | null> {
  return new Promise((resolve) => {
    const proc: ChildProcess = spawn('git', ['ls-files'], {
      cwd,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdout = '';

    proc.stdout?.on('data', (data: Buffer) => {
      stdout += data.toString();
    });

    proc.on('close', (exitCode) => {
      if (exitCode !== 0) {
        resolve(null);
        return;
      }
      const files = stdout
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
      resolve(files);
    });

    proc.on('error', () => resolve(null));
  });
}

function gitignoreHasEnvIgnore(cwd: string): { ok: boolean; path: string } {
  const path = join(cwd, '.gitignore');
  if (!existsSync(path)) {
    return { ok: false, path };
  }
  try {
    const content = readFileSync(path, 'utf-8');
    const lines = content
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && !l.startsWith('#'));

    const ok = lines.some(
      (l) =>
        l === '.env' ||
        l === '.env*' ||
        l === '.env.*' ||
        l === '**/.env' ||
        l === '**/.env*' ||
        l === '**/.env.*'
    );
    return { ok, path };
  } catch {
    return { ok: false, path };
  }
}

function scanFileForSecrets(
  absolutePath: string,
  relativePath: string
): SecretMatch[] {
  const ext = extname(relativePath).toLowerCase();
  if (SKIP_EXTENSIONS.has(ext)) {
    return [];
  }

  let content: string;
  try {
    content = readFileSync(absolutePath, 'utf-8');
  } catch {
    // unreadable/binary files are ignored (best-effort scan)
    return [];
  }

  // quick binary heuristic: if it contains NUL, treat as binary
  if (content.includes('\u0000')) {
    return [];
  }

  const matches: SecretMatch[] = [];
  const lines = content.split(/\r?\n/);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const pattern of SECRET_PATTERNS) {
      pattern.pattern.lastIndex = 0;
      const m = pattern.pattern.exec(line);
      if (!m) {
        continue;
      }

      matches.push({
        file: relativePath,
        line: i + 1,
        patternName: pattern.name,
        critical: pattern.critical,
        maskedSnippet: maskToken(m[0]),
      });
    }
  }

  return matches;
}

export class SecretsCheck implements DoctorCheck {
  readonly name = 'secrets-check';
  readonly category = 'git' as const;
  readonly description =
    'Scan tracked files for secret patterns and verify .gitignore ignores .env';

  async run(): Promise<CheckResult> {
    const startedAt = Date.now();
    const cwd = process.cwd();

    const tracked = await gitLsFiles(cwd);
    if (!tracked) {
      return {
        name: this.name,
        category: this.category,
        passed: true,
        message: 'Not a git repository or git unavailable (skipping secrets scan)',
        durationMs: Date.now() - startedAt,
      };
    }

    const gitignore = gitignoreHasEnvIgnore(cwd);

    const allMatches: SecretMatch[] = [];
    for (const rel of tracked) {
      const abs = join(cwd, rel);
      allMatches.push(...scanFileForSecrets(abs, rel));
    }

    const critical = allMatches.filter((m) => m.critical);
    const warnings = allMatches.filter((m) => !m.critical);

    const passed = critical.length === 0 && gitignore.ok;

    const detailsLines: string[] = [];
    if (critical.length > 0) {
      detailsLines.push('Critical matches (masked):');
      for (const match of critical.slice(0, 10)) {
        detailsLines.push(
          `- ${match.file}:${match.line} ${match.patternName} (${match.maskedSnippet})`
        );
      }
      if (critical.length > 10) {
        detailsLines.push(`- ... and ${critical.length - 10} more`);
      }
    }

    if (warnings.length > 0 && critical.length === 0) {
      detailsLines.push('Potential matches (masked):');
      for (const match of warnings.slice(0, 5)) {
        detailsLines.push(
          `- ${match.file}:${match.line} ${match.patternName} (${match.maskedSnippet})`
        );
      }
      if (warnings.length > 5) {
        detailsLines.push(`- ... and ${warnings.length - 5} more`);
      }
    }

    if (!gitignore.ok) {
      detailsLines.push(`.gitignore missing .env ignore: ${gitignore.path}`);
    }

    let message = 'No secret patterns found in tracked files';
    if (critical.length > 0) {
      message = `Found ${critical.length} critical secret pattern${
        critical.length === 1 ? '' : 's'
      } in tracked files`;
    } else if (warnings.length > 0) {
      message = `Found ${warnings.length} potential secret pattern${
        warnings.length === 1 ? '' : 's'
      } (warnings)`;
    }

    if (!gitignore.ok) {
      message += '; .gitignore does not ignore .env';
    }

    const fixSuggestion =
      critical.length > 0
        ? 'Remove secrets from tracked files and use environment variables or a gitignored .env file.'
        : !gitignore.ok
          ? 'Add .env (and optionally .env.*) to .gitignore so it cannot be committed.'
          : undefined;

    return {
      name: this.name,
      category: this.category,
      passed,
      message,
      details: detailsLines.length ? detailsLines.join('\n') : undefined,
      fixSuggestion,
      durationMs: Date.now() - startedAt,
    };
  }
}

