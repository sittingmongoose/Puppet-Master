/* Opt-in baseline path alignment. Never remove product DOM or mask layout styles. */
export function findExpectedRemoved(selectors) {
  // Runs in the page. Match ordinary CSS selectors in each accessible root.
  const matches = [];
  const visit = (root, prefix) => {
    const counts = new Map();
    for (const el of root.children || []) {
      const tag = el.localName.toLowerCase(), n = (counts.get(tag) || 0) + 1;
      counts.set(tag, n);
      const path = prefix + '/' + tag + '[' + n + ']';
      for (const selector of selectors) if (el.matches(selector)) {
        matches.push({ path, selector, display: getComputedStyle(el).display });
      }
      visit(el, path);
      if (el.shadowRoot) visit(el.shadowRoot, path + '/#shadow-root');
    }
  };
  // Validate even when the document contains no matching elements.
  for (const selector of selectors) document.documentElement.matches(selector);
  visit(document, '');
  return matches;
}

export function verifyRemovedSnapshot(snapshot, matches) {
  if (snapshot.documents.length !== 1) throw Error('Removal alignment requires one snapshot document');
  const { nodes, layout } = snapshot.documents[0], { strings } = snapshot;
  const pseudos = new Map((nodes.pseudoType?.index || []).map((node, i) => [node, nodes.pseudoType.value[i]]));
  const paths = new Map(), byPath = new Map(), counts = new Map();
  for (let i = 0; i < nodes.nodeType.length; i++) {
    const parent = nodes.parentIndex[i];
    if (nodes.nodeType[i] === 9) { paths.set(i, ''); continue; }
    if (nodes.nodeType[i] === 11) { paths.set(i, (paths.get(parent) || '') + '/#shadow-root'); continue; }
    if (nodes.nodeType[i] !== 1 && !pseudos.has(i)) continue;
    let path;
    if (pseudos.has(i)) path = (paths.get(parent) || '') + '::' + strings[pseudos.get(i)];
    else {
      const tag = strings[nodes.nodeName[i]].toLowerCase(), key = parent + ':' + tag, n = (counts.get(key) || 0) + 1;
      counts.set(key, n); path = (paths.get(parent) || '') + '/' + tag + '[' + n + ']';
    }
    paths.set(i, path);
    if (byPath.has(path)) throw Error('Ambiguous removal snapshot path: ' + path);
    byPath.set(path, i);
  }
  const removed = new Map();
  const verified = matches.map(match => {
    const snapshotPath = byPath.has(match.path) ? match.path : match.path.replaceAll('/#shadow-root', '');
    const index = byPath.get(snapshotPath);
    if (index === undefined) throw Error('Expected removed node missing from snapshot: ' + match.path);
    removed.set(index, match);
    return { ...match, snapshotPath, nodeIndex: index, layoutBoxes: 0 };
  });
  // Check text and generated pseudo layout nodes too. A display:contents root
  // cannot hide a rendered descendant, even though the root has no box itself.
  for (const index of layout.nodeIndex) for (let node = index; node >= 0; node = nodes.parentIndex[node]) {
    const match = removed.get(node);
    if (match) throw Error(`Expected removed node has a layout box in its subtree: ${match.selector} at ${match.path} (display:${match.display}; layout node ${index})`);
  }
  return verified;
}

export function alignRemovedEntries(entries, removed) {
  if (!removed.length) return { entries, toRaw: new Map(entries.map(([path]) => [path, path])), removedRecords: 0 };
  const roots = [...new Set(removed.map(row => row.path))];
  const siblings = roots.map(path => {
    const match = /^(.*)\/([^/]+)\[(\d+)\]$/.exec(path);
    if (!match) throw Error('Invalid removed element path: ' + path);
    return { parent: match[1], tag: match[2], ordinal: Number(match[3]) };
  });
  const aligned = [], toRaw = new Map();
  for (const [path, hash] of entries) {
    if (roots.some(root => path === root || path.startsWith(root + '/') || path.startsWith(root + '::'))) continue;
    const key = path.replace(/\/([^/]+?)\[(\d+)\]/g, (part, tag, number, offset) => {
      const parent = path.slice(0, offset);
      const shift = siblings.filter(row => row.parent === parent && row.tag === tag && row.ordinal < Number(number)).length;
      return '/' + tag + '[' + (Number(number) - shift) + ']';
    });
    if (toRaw.has(key)) throw Error('Non-unique aligned DOM path: ' + key);
    toRaw.set(key, path); aligned.push([key, hash]);
  }
  return { entries: aligned, toRaw, removedRecords: entries.length - aligned.length };
}
