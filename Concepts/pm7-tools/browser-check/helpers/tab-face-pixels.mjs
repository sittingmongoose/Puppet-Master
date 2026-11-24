// FO-229: is a tab's label and kind glyph painted in a frame? Read from real pixels (a CDP screencast PNG in the run, or a
// native frame of the run's 60 fps film in tools/home-retro-tab-face-film-reader.mjs), one rule for both.
//
// A part (a label's or a kind glyph's box, window pixels) is read against the same part in a reference frame of the same
// press, taken when the switch has settled: there its glyph pixels G are those at least STRONG:1 from the box's median
// colour, and its ground pixels N those within WEAK:1 of it. With the frame before the press as a second reference, G and
// N keep only the positions that are glyph (or ground) in both frames (FO-236, partMask). In a frame being judged, the
// part is painted when every group of G (a colon's dot, a letter's stroke) has at least one pixel PAINTED:1 or more from
// the frame's ground colour N.
//
// Why per group, not the median of G (FO236-WIN158-FIVE-PIXEL-REFERENCE): on Windows Chrome 158 the Retro `::` glyph's
// core reads 1.999:1 against its chip and one pixel per dot passes STRONG, so G can be a handful of dot cores plus as
// many antialiasing edges; their median sat at 1.67-1.79 on frames whose dots are plainly there (the four-location read
// in streams/F/reviews/astra-max-12e13.md found every dot at 1.999:1 or more), and a real press failed. Each group's
// strongest pixel is the dot's own ink; a blank part (the double paint FO-229 fixed: ink the colour of the ground) still
// reads about 1.0 at every pixel, and a part with one dot or one letter stroke missing fails on that group alone.
//
// A part is judgeable when the settled reference shows a real glyph and ground (MIN_GLYPH each) and the pre-press frame
// keeps at least one pixel of every glyph group the settled frame shows: only the positions are narrowed, never the bar.
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
const boxWidth = (img, box) => Math.max(0, Math.min(img.width, Math.round(box[0] + box[2])) - Math.max(0, Math.round(box[0])));
const median = (list) => [0, 1, 2].map((k) => { const v = list.map((p) => p[k]).sort((a, b) => a - b); return v.length ? v[v.length >> 1] : 0; });

// the groups of a part's glyph positions, 8-connected in the box's own grid: one colon dot or one letter stroke each
function groups(positions, w) {
	const set = new Set(positions), seen = new Set(), out = [];
	for (const start of positions) {
		if (seen.has(start)) continue;
		const stack = [start], group = [];
		seen.add(start);
		while (stack.length) {
			const i = stack.pop(); group.push(i);
			const x = i % w, y = (i - x) / w;
			for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
				const nx = x + dx, ny = y + dy;
				if (nx < 0 || nx >= w || ny < 0) continue;
				const k = ny * w + nx;
				if (k !== i && set.has(k) && !seen.has(k)) { seen.add(k); stack.push(k); }
			}
		}
		out.push(group);
	}
	return out;
}

// the glyph and ground pixel positions of a part, from its settled reference and, when given, the frame before the press.
// FO-236: with both, a position is a glyph pixel only when it is one in both frames, and a ground pixel only when it is
// ground in both. A press changes each part's polarity (the tab chosen before, dark ink on the paper or chip-coloured ink
// on the chip, becomes the other), and a raster can spread one polarity further than the other: on Alexis (Windows, RTX
// 3080) Retro Light's settled cream `::` on the chip took 22 glyph pixels where the VM's took 16, its extra edge pixels
// near the ground colour in the dark-on-paper frame before the press, so the median over them read the hovered Agents
// glyph, drawn in its own ink (#2F7A3D, 3.5-3.65:1 at its strongest pixels on both hosts), as 1.72:1. The positions both
// frames agree on are the glyph's core in either polarity. Only ever fewer positions are read, never a lower bar: a blank
// part (ink the colour of its ground) still reads about 1.0:1 at every position.
//
// FO236-WIN158-FIVE-PIXEL-REFERENCE: that narrowing can leave five positions of a real four-dot colon (Windows Chrome 158
// at DPR 1, one core pixel per dot, the dot's own ink at 1.999:1), so the narrowed mask is judgeable when it keeps one
// pixel of every glyph group the settled frame shows (not a flat six pixels, which a real five-pixel press never reaches);
// the settled reference still needs MIN_GLYPH glyph and ground pixels, so a part that is blank there is unread, not judged.
export function partMask(ref, box, before) {
	const classify = (img) => { const px = pixels(img, box), bg = median(px); return { px, w: boxWidth(img, box), bg, k: px.map((p) => { const c = contrast(p, bg); return c >= STRONG ? 'g' : c <= WEAK ? 'n' : ''; }) }; };
	const a = classify(ref), b = before ? classify(before) : null, g = [], n = [], settled = [];
	if (b && b.px.length !== a.px.length) return { box, g, n, size: a.px.length, bg: a.bg, ok: false, both: true, gSettled: 0, clusters: [], groupsSettled: 0, groupsKept: 0 };
	a.k.forEach((k, i) => { if (k === 'g') settled.push(i); if (k === 'g' && (!b || b.k[i] === 'g')) g.push(i); else if (k === 'n' && (!b || b.k[i] === 'n')) n.push(i); });
	const kept = new Set(g), groupsSettled = groups(settled, a.w), preserved = groupsSettled.filter((group) => group.some((i) => kept.has(i)));
	const ok = settled.length >= MIN_GLYPH && n.length >= MIN_GLYPH && g.length > 0 && preserved.length === groupsSettled.length;
	return { box, g, n, size: a.px.length, bg: a.bg, ok, both: !!b, gSettled: settled.length, clusters: groups(g, a.w), groupsSettled: groupsSettled.length, groupsKept: preserved.length };
}
// the part's contrast in one frame: its weakest glyph group's strongest pixel against the frame's ground colour (the
// ground being the median of N; ink is the median of G, kept for the log and the report). A group whose strongest pixel
// is under PAINTED:1 is a dot or stroke that is not drawn in this frame.
export function partContrast(img, mask) {
	const px = pixels(img, mask.box);
	if (px.length !== mask.size) return { c: 0, ink: null, ground: null, groups: 0, weakest: null };
	const ink = median(mask.g.map((i) => px[i])), ground = median(mask.n.map((i) => px[i]));
	const cores = (mask.clusters || [mask.g]).map((group) => { let best = 0, at = group[0]; for (const i of group) { const c = contrast(px[i], ground); if (c > best) { best = c; at = i; } } return { c: best, at }; });
	if (!cores.length) return { c: 0, ink, ground, groups: 0, weakest: null };
	const weakest = cores.reduce((p, q) => (q.c < p.c ? q : p));
	return { c: Math.round(weakest.c * 100) / 100, ink, ground, groups: cores.length, weakest, core: px[weakest.at], median: Math.round(contrast(ink, ground) * 100) / 100 };
}
