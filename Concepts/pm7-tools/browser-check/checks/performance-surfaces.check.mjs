// Shared surface gates for the performance lane. Keep the assertions in their existing owner checks.
import looks from './looks.check.mjs';
import widths from './widths.check.mjs';
import reduced from './reduced-motion.check.mjs';
import plates from './plate-style.check.mjs';
import { tests as idle } from './idle-in-drag.check.mjs';
export const tests = {
 'all ten looks': looks,
 'standard widths, narrow and short': widths,
 'Reduced Motion through reload': reduced,
 'plate and schedule-manager tokens (FO-54)': plates,
 ...idle
};
