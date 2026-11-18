// Shared page-side sampler. Keep the function self-contained for browser evaluate().
export function paintedChip(chip, layer = chip.parentElement) {
 const box = (e) => { const r = e.getBoundingClientRect(); return [r.left, r.top, r.right, r.bottom]; };
 const alpha = (c) => { const m = /rgba?\(([^)]*)\)/.exec(c || ''); if (!m) return c && c !== 'transparent' ? 1 : 0; const v = m[1].split(/[\s,/]+/).filter(Boolean); return v.length > 3 ? +v[3] : 1; };
 const shadows = (v) => { const out = []; let d = 0, cur = ''; for (const ch of v || '') { if (ch === '(') d++; if (ch === ')') d--; if (ch === ',' && !d) { out.push(cur); cur = ''; } else cur += ch; } if (cur.trim()) out.push(cur); return out; };
 const parts = [];
 for (const e of [chip, ...chip.querySelectorAll('*')]) {
  if (e.closest('.lg-carry-twins') || !e.getClientRects().length) continue;
  const cs = getComputedStyle(e);
  const borders = ['Top', 'Right', 'Bottom', 'Left'].map(s => cs['border' + s + 'Style'] !== 'none' && alpha(cs['border' + s + 'Color']) ? parseFloat(cs['border' + s + 'Width']) : 0);
  let rim = 0;
  for (const sh of shadows(cs.boxShadow === 'none' ? '' : cs.boxShadow)) { if (!/inset/.test(sh)) continue; const col = (/(rgba?\([^)]*\)|#[0-9a-f]+|transparent)/i.exec(sh) || [''])[0]; if (alpha(col) <= 0) continue; const n = sh.replace(/(rgba?\([^)]*\)|#[0-9a-f]+|transparent|inset)/gi, '').trim().split(/\s+/).map(parseFloat); if (n.length >= 4) rim = Math.max(rim, n[3]); }
  if (cs.backgroundImage === 'none' && !alpha(cs.backgroundColor) && !rim && !borders.some(Boolean)) continue;
  let bounds = box(e), m = new DOMMatrix(), visible = true;
  for (let x = e; x && x !== layer; x = x.parentElement) {
   const s = getComputedStyle(x); if (+s.opacity <= 0 || s.visibility === 'hidden') visible = false;
   if (x !== e) { const b = box(x); if (s.overflowX !== 'visible') { bounds[0] = Math.max(bounds[0], b[0]); bounds[2] = Math.min(bounds[2], b[2]); } if (s.overflowY !== 'visible') { bounds[1] = Math.max(bounds[1], b[1]); bounds[3] = Math.min(bounds[3], b[3]); } }
   if (s.transform !== 'none') m = new DOMMatrix(s.transform).multiply(m);
  }
  if (!visible || bounds[2] <= bounds[0] || bounds[3] <= bounds[1]) continue;
  const sx = Math.hypot(m.a, m.b), sy = Math.hypot(m.c, m.d), round = v => +v.toFixed(2);
  const corners = ['TopLeft', 'TopRight', 'BottomRight', 'BottomLeft'].map(k => { const r = cs['border' + k + 'Radius'].split(/\s+/).map(parseFloat); return { rx: round(r[0] * sx), ry: round((r[1] ?? r[0]) * sy) }; });
  parts.push({ ...corners[0], rimX: round(rim * sx), rimY: round(rim * sy), corners, borders: borders.map((v,i) => round(v * (i % 2 ? sx : sy))), bounds, sx, sy });
 }
 if (!parts.length) return null;
 const b = [Math.min(...parts.map(p=>p.bounds[0])), Math.min(...parts.map(p=>p.bounds[1])), Math.max(...parts.map(p=>p.bounds[2])), Math.max(...parts.map(p=>p.bounds[3]))];
 return { ...parts[0], parts, box: [b[0], b[1], b[2]-b[0], b[3]-b[1]] };
}
// evaluate() serializes its function; embed the shared sampler in both recording entry points.
export const withPaintedChip = fn => new Function('opts', `const paintedChip = (${paintedChip.toString()}); return (${fn.toString()})(opts);`);
