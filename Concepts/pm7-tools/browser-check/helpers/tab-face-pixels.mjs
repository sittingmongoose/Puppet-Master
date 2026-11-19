// FO-229: is a tab's label and kind glyph painted in a frame? Read from real pixels (a CDP screencast PNG in the run, or a
// native frame of the run's 60 fps film in tools/home-retro-tab-face-film-reader.mjs), one rule for both.
//
// A part (a label's or a kind glyph's box, window pixels) is read against the same part in a reference frame of the same
// press, taken when the switch has settled: there its glyph pixels G are those at least STRONG:1 from the box's median
// colour, and its ground pixels N those within WEAK:1 of it. With the frame before the press as a second reference, G and
// N keep only the positions that are glyph (or ground) in both frames (FO-236, partMask). In a frame being judged, the
// part is painted when the median colour of G and the median colour of N differ by at least PAINTED:1 (WCAG contrast of
// the two medians). A blank part (ink the colour of what is under it, A12D-7's phosphor words on the phosphor chip) reads
// about 1.0:1; a drawn one, either ink on either ground, reads several times that. The references must leave glyph pixels
// (MIN_GLYPH), or the part is not judged and the caller fails it as unread.
export const STRONG = 2.0, WEAK = 1.25, PAINTED = 1.8, MIN_GLYPH = 6;

const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
export const luminance = (c) => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
export const contrast = (a, b) => { const x = luminance(a), y = luminance(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };

// img: { width, height, data, channels } (channels 4 for decodePng's RGBA, 3 for raw rgb24); box: [x, y, w, h] in img pixels
function pixels(img, box) {
	const ch = img.channels || 4, out = [];
	const x0 = Math.max(0, Math.round(box[0])), y0 = Math.max(0, Math.round(box[1]));
	const x1 = Math.min(img.width, Math.round(box[0] + box[2])), y1 = Math.min(img.height, Math.round(box[1] + box[3]));
	for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { const i = (y * img.width + x) * ch; out.push([img.data[i], img.data[i + 1], img.data[i + 2]]); }
	return out;
}
const median = (list) => [0, 1, 2].map((k) => { const v = list.map((p) => p[k]).sort((a, b) => a - b); return v.length ? v[v.length >> 1] : 0; });

// the glyph and ground pixel positions of a part, from its settled reference and, when given, the frame before the press.
// FO-236: with both, a position is a glyph pixel only when it is one in both frames, and a ground pixel only when it is
// ground in both. A press changes each part's polarity (the tab chosen before, dark ink on the paper or chip-coloured ink
// on the chip, becomes the other), and a raster can spread one polarity further than the other: on Alexis (Windows, RTX
// 3080) Retro Light's settled cream `::` on the chip took 22 glyph pixels where the VM's took 16, its extra edge pixels
// near the ground colour in the dark-on-paper frame before the press, so the median over them read the hovered Agents
// glyph, drawn in its own ink (#2F7A3D, 3.5-3.65:1 at its strongest pixels on both hosts), as 1.72:1. The positions both
// frames agree on are the glyph's core in either polarity. Only ever fewer positions are read, never a lower bar: a blank
// part (ink the colour of its ground) still reads about 1.0:1 at every position.
export function partMask(ref, box, before) {
	const classify = (img) => { const px = pixels(img, box), bg = median(px); return { px, bg, k: px.map((p) => { const c = contrast(p, bg); return c >= STRONG ? 'g' : c <= WEAK ? 'n' : ''; }) }; };
	const a = classify(ref), b = before ? classify(before) : null, g = [], n = [];
	if (b && b.px.length !== a.px.length) return { box, g, n, size: a.px.length, bg: a.bg, ok: false, both: true };
	a.k.forEach((k, i) => { if (k === 'g' && (!b || b.k[i] === 'g')) g.push(i); else if (k === 'n' && (!b || b.k[i] === 'n')) n.push(i); });
	return { box, g, n, size: a.px.length, bg: a.bg, ok: g.length >= MIN_GLYPH && n.length >= MIN_GLYPH, both: !!b, gSettled: a.k.filter((k) => k === 'g').length };
}
// the part's contrast in one frame: the median of its glyph pixels against the median of its ground pixels
export function partContrast(img, mask) {
	const px = pixels(img, mask.box);
	if (px.length !== mask.size) return { c: 0, ink: null, ground: null };
	const ink = median(mask.g.map((i) => px[i])), ground = median(mask.n.map((i) => px[i]));
	return { c: Math.round(contrast(ink, ground) * 100) / 100, ink, ground };
}
