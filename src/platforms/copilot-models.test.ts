import { describe, it, expect } from 'vitest';
import { getCopilotModels, COPILOT_MODELS } from './copilot-models.js';

describe('Copilot models', () => {
  it('returns models with reasoningLevels for GPT-5 and Claude Opus 4.6', () => {
    const models = getCopilotModels();
    const gpt5 = models.find(m => m.id === 'gpt-5');
    const claudeOpus = models.find(m => m.id === 'claude-opus-4.6');

    expect(gpt5?.reasoningLevels).toEqual(['Low', 'Medium', 'High', 'Extra high']);
    expect(claudeOpus?.reasoningLevels).toEqual(['Low', 'Medium', 'High']);
  });

  it('has reasoningLevels on known reasoning-supporting models', () => {
    const reasoningModels = ['gpt-5', 'gpt-5.1', 'gpt-5.1-codex', 'gpt-5.1-codex-mini', 'gpt-5.1-codex-max', 'gpt-5.2', 'gpt-5.2-codex', 'gpt-5-mini', 'claude-opus-4.6'];
    for (const id of reasoningModels) {
      const m = COPILOT_MODELS.find(mod => mod.id === id);
      expect(m, `Model ${id} should exist`).toBeDefined();
      expect(m!.reasoningLevels, `Model ${id} should have reasoningLevels`).toBeDefined();
      expect(Array.isArray(m!.reasoningLevels)).toBe(true);
    }
  });
});
