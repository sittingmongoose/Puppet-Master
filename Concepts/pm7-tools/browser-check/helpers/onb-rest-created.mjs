// Which of a childList record's added nodes count as created at rest in checks/perf-onb-rest.check.mjs, kept apart
// from the browser so tools/onb-rest-created.selftest.mjs can judge it on recorded mutation lists.
//
// PM7PERF-ONBREST-NIER-LABEL-NODES-FLAP: a target change inside the sample window is legitimate, not a rebuild. It
// re-sets the target's words in two places (recorded on Alexis, main.html, NieR Dark Where: one change makes both):
// the HUD target word b.pst-target (hudTarget's textContent) and the bracket label gHud.__b[8] (renderBrackets'
// innerHTML, 54-art-nier.js). Each is one childList record that removes the old words and adds the new text node in
// the same record; the old row counted both and read "2 nodes created". Those added text nodes do not count. Added
// elements always count, and text added without the words changing in the same record counts.
//
// R124 F4-1: "without the words changing" is compared, not assumed. The record used to carry a boolean set from the
// removal alone, so a page that re-created the label's same text every frame was excused (exactly the per-frame
// innerHTML fault 54-art-nier.js:101-102 guards against). `reset` now carries the removed and added text, and a
// reset excuses its text nodes only when those differ.
// record: { reset: { removedText, addedText } | null, added: [{ text, seen, desc }] } — reset is the record's removal
// of text under the bracket label or the target word; seen: the node was in the stage when the window began; desc:
// for the failure log. Returns the added nodes that count, in order.
export function createdAdded(record) {
	const reset = record.reset;
	const wordsChanged = !!(reset && reset.removedText !== reset.addedText);
	const out = [];
	for (const n of record.added) {
		if (n.seen) continue;
		if (wordsChanged && n.text) continue;
		out.push(n);
	}
	return out;
}
