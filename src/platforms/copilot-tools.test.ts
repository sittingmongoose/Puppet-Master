import { describe, it, expect, vi } from 'vitest';
import { createRwmTools, createProductionTools } from './copilot-tools.js';

describe('copilot-tools', () => {
  it('creates tools with callbacks wired', async () => {
    const onComplete = vi.fn();
    const tools = createRwmTools({ onMarkComplete: onComplete });
    const markComplete = tools.find((tool) => tool.name === 'mark_complete');

    expect(markComplete).toBeDefined();
    const result = await markComplete!.handler({
      learnings: ['a'],
      filesChanged: ['file.ts'],
      testsPassed: true,
      summary: 'done',
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({ status: 'complete', learnings: ['a'], filesChanged: ['file.ts'] });
  });

  it('createProductionTools uses default criteria when missing managers', async () => {
    const tools = createProductionTools();
    const criteriaTool = tools.find((tool) => tool.name === 'get_acceptance_criteria');
    const result = await criteriaTool!.handler({});

    expect(result).toMatchObject({ criteria: ['No criteria available'] });
  });
});
