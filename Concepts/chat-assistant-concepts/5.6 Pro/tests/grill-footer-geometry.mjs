/* Browser-side measurement shared with the row-wrap negative control.
 * A physical row shares a vertical band; absolute rounded y/8 buckets can
 * split one row at 19/20px even when every button overlaps vertically. */
export function grillFooterGeometry() {
  const root = window.PM56_HOST?.root?.() || document;
  const card = root.querySelector('.qs-grill');
  if (!card) return { missing: true, note: false, tally: false, accept: '', rows: 0, tops: [], rects: [] };
  const vis = el => !!el && getComputedStyle(el).display !== 'none' && el.getClientRects().length > 0;
  const rects = [...card.querySelectorAll('.qs-grill-foot > button')].filter(vis).map(b => {
    const r = b.getBoundingClientRect(); return { top: r.top, bottom: r.bottom, height: r.height, width: r.width };
  });
  const bands = [];
  for (const r of [...rects].sort((a, b) => a.top - b.top)) {
    const band = bands.find(b => Math.min(b.bottom, r.bottom) - Math.max(b.top, r.top) > 1);
    if (band) { band.top = Math.max(band.top, r.top); band.bottom = Math.min(band.bottom, r.bottom); }
    else bands.push({ top: r.top, bottom: r.bottom });
  }
  const acc = card.querySelector('[data-action="qs-accept-round"]');
  return { note: vis(card.querySelector('.qs-grill-note')), tally: vis(card.querySelector('.qs-grill-tally')),
    accept: acc ? acc.innerText.replace(/\s+/g, ' ').trim() : '', rows: rects.every(r => r.width > 0 && r.height > 0) ? bands.length : 0,
    tops: rects.map(r => Math.round(r.top)), rects, bands,
    root: root.id || 'document', candidates: [...document.querySelectorAll('.qs-grill')].map(el => ({ root: el.closest('.pm56-host')?.id, height: el.getBoundingClientRect().height })) };
}
