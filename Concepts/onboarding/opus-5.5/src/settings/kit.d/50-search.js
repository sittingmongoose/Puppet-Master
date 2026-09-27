/* O55 · search speaks the same words as the rows. A result used the inventory's title ("Jobs This Account May Do")
   while the row it lands on reads "Jobs an account may do"; now the result shows the row's own label and help, and
   the old title stays searchable, so either wording finds it. */
const o55SearchIndex = buildSearchIndex;
buildSearchIndex = function () {
  const fresh = searchIndexDirty || !searchIndexCache;
  const list = o55SearchIndex.apply(this, arguments);
  if (!fresh || !Array.isArray(list)) return list;
  for (const e of list) {
    if (e.type !== 'setting') continue;
    const r = O55R[e.id]; if (!r) continue;
    if (r.label && r.label !== e.title) { e.hay += ' ' + String(r.label).toLowerCase(); e.title = r.label; }
    if (r.help) { e.hay += ' ' + String(r.help).toLowerCase(); e.description = r.help; }
  }
  return list;
};
