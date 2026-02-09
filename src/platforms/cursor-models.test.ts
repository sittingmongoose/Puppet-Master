import { describe, it, expect, vi, beforeEach } from 'vitest';

const spawnMock = vi.fn();

vi.mock('child_process', () => ({
  spawn: (...args: unknown[]) => spawnMock(...args),
}));

import { discoverCursorModels } from './cursor-models.js';

function createSpawnProc(output: string) {
  const handlers: Record<string, Array<(arg: unknown) => void>> = {};

  const proc = {
    stdout: {
      on: (ev: string, cb: (arg: unknown) => void) => {
        handlers[`stdout:${ev}`] = handlers[`stdout:${ev}`] ?? [];
        handlers[`stdout:${ev}`].push(cb);
      },
    },
    stderr: {
      on: (ev: string, cb: (arg: unknown) => void) => {
        handlers[`stderr:${ev}`] = handlers[`stderr:${ev}`] ?? [];
        handlers[`stderr:${ev}`].push(cb);
      },
    },
    on: (ev: string, cb: (arg: unknown) => void) => {
      handlers[ev] = handlers[ev] ?? [];
      handlers[ev].push(cb);
    },
    kill: vi.fn(),
  };

  queueMicrotask(() => {
    for (const cb of handlers['stdout:data'] ?? []) cb(Buffer.from(output));
    for (const cb of handlers['close'] ?? []) cb(0);
  });

  return proc;
}

describe('cursor model discovery', () => {
  beforeEach(() => {
    spawnMock.mockReset();
  });

  it('parses `agent models` table output and filters headers/spinners', async () => {
    const output =
      '\u001b[2K\u001b[GLoading models…\n' +
      '\u001b[2K\u001b[1A\u001b[2K\u001b[GAvailable models\n\n' +
      'auto - Auto\n' +
      'composer-1 - Composer 1\n' +
      'opus-4.6-thinking - Claude 4.6 Opus (Thinking)\n' +
      '\nTip: use --model <id>\n';

    spawnMock.mockImplementation(() => createSpawnProc(output));

    const discovered = await discoverCursorModels('agent', 1000);

    expect(discovered).not.toBeNull();
    expect(discovered?.map((m) => m.id)).toEqual(['auto', 'composer-1', 'opus-4.6-thinking']);
  });
});

