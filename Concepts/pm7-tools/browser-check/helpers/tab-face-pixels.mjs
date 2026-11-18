// FO-229: is a tab's label and kind glyph painted in a frame? Read from real pixels (a CDP screencast PNG in the run, or a
// native frame of the run's 60 fps film in tools/home-retro-tab-face-film-reader.mjs), one rule for both.
//
// A part (a label's or a kind glyph's box, window pixels) is read against the same part in a reference frame of the same
// press, taken when the switch has settled: there its glyph pixels G are those at least STRONG:1 from the box's median
// colour, and its ground pixels N those within WEAK:1 of it. In a frame being judged, the part is painted when the median
// colour of G and the median colour of N differ by at least PAINTED:1 (WCAG contrast of the two medians). A blank part
// (ink the colour of what is under it, A12D-7's phosphor words on the phosphor chip) reads about 1.0:1; a drawn one, either
// ink on either ground, reads several times that. The reference must have glyph pixels (MIN_GLYPH), or the part is not
// judged and the caller fails it as unread.
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

// the glyph and ground pixel positions of a part, from its settled reference
export function partMask(ref, box) {
	const px = pixels(ref, box), bg = median(px), g = [], n = [];
	px.forEach((p, i) => { const c = contrast(p, bg); if (c >= STRONG) g.push(i); else if (c <= WEAK) n.push(i); });
	return { box, g, n, size: px.length, bg, ok: g.length >= MIN_GLYPH && n.length >= MIN_GLYPH };
}
// the part's contrast in one frame: the median of its glyph pixels against the median of its ground pixels
export function partContrast(img, mask) {
	const px = pixels(img, mask.box);
	if (px.length !== mask.size) return { c: 0, ink: null, ground: null };
	const ink = median(mask.g.map((i) => px[i])), ground = median(mask.n.map((i) => px[i]));
	return { c: Math.round(contrast(ink, ground) * 100) / 100, ink, ground };
}
