// SW-36: what the compositor shows while an iframe shrinks. Chrome's screencast PNGs carry the frame-swap time
// (ScreencastFrameMetadata.timestamp); they are decoded only after capture, so the classification cannot delay the
// frames it measures. No product marker: frames are compared with the settled image before and after the resize.
import {decodePng} from './activity-cover-pixels.mjs';

export async function captureResize(page, resize, {ms = 3000} = {}) {
	const client = await page.context().newCDPSession(page);
	const shot = async () => Buffer.from((await client.send('Page.captureScreenshot', {format: 'png', fromSurface: true, captureBeyondViewport: false})).data, 'base64');
	const before = await shot();
	const frames = [];
	const onFrame = event => {
		client.send('Page.screencastFrameAck', {sessionId: event.sessionId}).catch(() => {});
		frames.push({wall: event.metadata.timestamp * 1000, png: Buffer.from(event.data, 'base64')});
	};
	client.on('Page.screencastFrame', onFrame);
	await client.send('Page.startScreencast', {format: 'png', everyNthFrame: 1});
	let wall;
	try {
		wall = await resize();
		await page.waitForTimeout(ms);
	} finally {
		await client.send('Page.stopScreencast').catch(() => {});
		client.off('Page.screencastFrame', onFrame);
	}
	const after = await shot();
	await client.detach().catch(() => {});
	return {before, after, frames: frames.sort((a, b) => a.wall - b.wall), wall};
}

// Share of sampled pixels in rect r whose largest channel differs by more than 24 levels.
function differs(p, q, r, step = 2) {
	let n = 0, d = 0;
	for (let y = Math.round(r.y0); y < r.y1; y += step) for (let x = Math.round(r.x0); x < r.x1; x += step) {
		const i = (y * p.width + x) * 4;
		n++;
		if (Math.max(Math.abs(p.data[i] - q.data[i]), Math.abs(p.data[i + 1] - q.data[i + 1]), Math.abs(p.data[i + 2] - q.data[i + 2])) > 24) d++;
	}
	return n ? d / n : 1;
}

// box: the iframe in window pixels at its old width; toWidth: its new width; column: the chat column's settled rect
// inside the child at the new width. strip = the part of the old box the parent takes back (its own ground once it
// applies the new size); chat = the column's area at the new width, where the old image, a docked panel and the
// settled cover all differ. A frame is old while the chat area is still the image before the resize (within a quarter
// of how much the two settled images differ there: the child's compositor keeps animating the old image, a working
// card's orbit is 3-4 % of the area), final when it is the settled image after it (within 2 %), and intermediate
// otherwise: a new-sized layout that is not the settled one (a panel docked beside the messages, a panel fading in).
export function classifyResize(cap, box, toWidth, column, {finalTol = 0.02} = {}) {
	const B = decodePng(cap.before), A = decodePng(cap.after);
	const strip = {x0: box.x + toWidth + 4, y0: box.y + 4, x1: box.x + box.width - 4, y1: box.y + box.height - 4};
	const chat = {x0: box.x + Math.max(0, column.x), y0: box.y + Math.max(0, column.y), x1: box.x + Math.min(toWidth, column.x + column.width), y1: box.y + Math.min(box.height, column.y + column.height)};
	const contrast = {strip: differs(B, A, strip), chat: differs(B, A, chat)};
	if (contrast.strip < 0.2 || contrast.chat < 0.2) throw Error('Settled images do not tell the old and new layouts apart: ' + JSON.stringify(contrast));
	const oldTol = contrast.chat / 4;
	const samples = cap.frames.map(f => {
		const F = decodePng(f.png);
		const s = {wall: f.wall, ms: f.wall - cap.wall, clipped: differs(F, A, strip) < 0.02, old: differs(F, B, chat), final: differs(F, A, chat)};
		s.kind = s.old < oldTol && s.old < s.final ? (s.clipped ? 'old-clipped' : 'old') : s.final < finalTol ? 'final' : 'intermediate';
		return s;
	}).filter(s => s.ms >= -50);
	const firstClip = samples.find(s => s.clipped);
	const firstNew = samples.find(s => s.kind === 'final' || s.kind === 'intermediate');
	const after = firstNew ? samples.filter(s => s.wall >= firstNew.wall) : [];
	const lastNew = after.at(-1);
	return {
		contrast, oldTol, frames: samples.length,
		firstClipMs: firstClip ? firstClip.ms : null,
		firstNewMs: firstNew ? firstNew.ms : null,
		// how long the parent showed the old child image clipped to the new width (0 when both change in one frame)
		retainedMs: firstClip && firstNew ? Math.max(0, firstNew.wall - firstClip.wall) : null,
		retainedFrames: samples.filter(s => s.kind === 'old-clipped').length,
		firstNewKind: firstNew ? firstNew.kind : null,
		intermediate: after.filter(s => s.kind === 'intermediate').map(s => Math.round(s.ms)),
		settled: !!lastNew && lastNew.kind === 'final',
		samples: samples.map(s => ({ms: Math.round(s.ms * 10) / 10, kind: s.kind, old: Math.round(s.old * 1000) / 1000, final: Math.round(s.final * 1000) / 1000, clipped: s.clipped}))
	};
}
