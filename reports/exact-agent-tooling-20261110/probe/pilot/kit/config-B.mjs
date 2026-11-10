import { makeConfig } from './pilotkit.mjs';
import { idHelpers } from './idkit.mjs';
export default (ctx) => makeConfig(ctx, { arm: 'B', helpers: idHelpers });
