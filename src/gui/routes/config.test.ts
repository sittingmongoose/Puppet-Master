import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const getCursorModelsWithDiscoveryMock = vi.fn();

vi.mock('../../platforms/cursor-models.js', async () => {
  const actual = await vi.importActual<typeof import('../../platforms/cursor-models.js')>('../../platforms/cursor-models.js');
  return {
    ...actual,
    getCursorModelsWithDiscovery: (...args: unknown[]) => getCursorModelsWithDiscoveryMock(...args),
  };
});

import { createConfigRoutes } from './config.js';

function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use('/api', createConfigRoutes());
  return app;
}

describe('config routes', () => {
  beforeEach(() => {
    getCursorModelsWithDiscoveryMock.mockReset();
  });

  it('uses Cursor model discovery on non-refresh loads (best-effort)', async () => {
    getCursorModelsWithDiscoveryMock.mockResolvedValue([
      { id: 'auto', label: 'Auto', source: 'discovered' },
      { id: 'composer-1', label: 'Composer 1', source: 'discovered' },
    ]);

    const app = createTestApp();
    const res = await request(app).get('/api/config/models').expect(200);

    expect(getCursorModelsWithDiscoveryMock).toHaveBeenCalled();
    expect(Array.isArray(res.body.cursor)).toBe(true);
    expect(res.body.cursor.some((m: { id: string }) => m.id === 'composer-1')).toBe(true);
  });
});

