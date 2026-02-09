import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

describe('macOS pkg postinstall safety', () => {
  it('does not use broad pkill -f patterns that can kill the installer', () => {
    const p = path.resolve(process.cwd(), 'installer', 'mac', 'scripts', 'postinstall');
    const content = readFileSync(p, 'utf8');

    // Pattern-based pkill can match the installer/command line and terminate the install at the end.
    // Only consider actual commands, not comments.
    const nonCommentLines = content
      .split('\n')
      .filter((line) => line.trim() !== '' && !line.trim().startsWith('#'))
      .join('\n');

    expect(nonCommentLines).not.toMatch(/\bpkill\b[^\n]*\s-f\s/i);
    expect(nonCommentLines).not.toMatch(/\bpkill\b[^\n]*-f[^\n]*(puppet-master|Puppet Master)/i);
  });
});
