// Loads src/terminal/js files into one shared scope the way the layer assembles them; returns T.
import fs from 'node:fs'; import path from 'node:path'; import url from 'node:url';
const here = path.dirname(url.fileURLToPath(import.meta.url));
export function loadT(files, extra = {}) {
  const dir = path.join(here, '..', '..', 'js');
  const src = files.map(f => fs.readFileSync(path.join(dir, f), 'utf8')).join('\n;\n');
  const window = Object.assign({ matchMedia: () => ({ matches: false }) }, extra.window || {});
  const document = extra.document || { documentElement: { getAttribute: () => null } };
  const fn = new Function('window', 'document', 'PM_HOME', '"use strict";' + src + '\n;return T;');
  return fn(window, document, extra.PM_HOME || null);
}
