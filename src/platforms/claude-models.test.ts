import { describe, it, expect } from 'vitest';
import { getClaudeModels } from './claude-models.js';

describe('claude model catalog', () => {
  it('labels alias models with version context', () => {
    const models = getClaudeModels();
    const byId = new Map(models.map((m) => [m.id, m]));

    expect(byId.get('default')?.label).toMatch(/sonnet/i);
    expect(byId.get('sonnet')?.label).toMatch(/v4\.5/i);
    expect(byId.get('opus')?.label).toMatch(/v4\.6/i);
    expect(byId.get('opusplan')?.label).toMatch(/v4\.6/i);
    expect(byId.get('claude-opus-4-6')?.label).toMatch(/opus/i);
  });
});
