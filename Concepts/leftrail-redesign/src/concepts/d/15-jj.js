/* Source Control in Jujutsu mode (lane b-jj, 2026-10-09; decision: pm-polish/out/b-jj/DECISION.md revision 2).
   Jujutsu gets its own strip of five views, Changes · Workspaces · History · Bookmarks · Operation Log, inside the
   shell's .pm7-scm-jj-view, followed by its own scroller and its own Publish and review card. Git's strip stays the
   shell's and is hidden in Jujutsu mode (css/71-source). Today's four Jujutsu cards are hidden (d-hidden) while D is on,
   never removed; every node here goes through inject() and every shell change through addClass(), so "Current" is
   byte-identical after a switch.
   - Tabs use data-jj-tab / data-jj-pane, not data-tab / data-pane: the shell's wireTabber toggles every [data-tab] and
     [data-pane] in the panel and would hide Git's lists.
   - The engine switch opens the tab in the same slot position (1-4); Operation Log (5) opens Git's History.
   - Both Source strips fit by the longest label (24 px inactive tabs), so a strip never changes mode while you click.
   - Every control carries data-command-id = data-demo-action plus a data-demo-arg; every dropdown opens PMR.menu.
   The example data continues today's cards (tastebook, current change nkmwqzvw) and lives here, in concept D only. */

const JJ = { strip: null, scroll: null, panes: {}, tab: 'changes', ink: null, view: null, reasons: [], registered: false };
const JJ_TABS = [
  { id: 'changes', label: 'Changes', icon: 'diff', git: 'changes' },
  { id: 'workspaces', label: 'Workspaces', icon: 'folderOpen', git: 'worktrees' },
  { id: 'history', label: 'History', icon: 'clock', git: 'history' },
  { id: 'bookmarks', label: 'Bookmarks', icon: 'pin', git: 'branches' },
  { id: 'operations', label: 'Operation Log', icon: 'undo', git: 'history' },
];
const JJ_FROM_GIT = { changes: 'changes', worktrees: 'workspaces', history: 'history', branches: 'bookmarks' };
const JJ_AVAIL = 'owner_unavailable_concept_preview';
/* glyphs PM_ICONS does not have, drawn in its style (24 grid, 2 px stroke) */
const JJ_SVG = {
  undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
};
/* the immutable state: a solid badge with a padlock knocked out (00-d.js glyph family) */
SOLID.immutable = {
  shape: '<circle cx="8" cy="8" r="6.5"/>',
  cut: '<rect x="5.2" y="7.4" width="5.6" height="4.3" rx=".8" fill="#000" stroke="none"/><path d="M6.3 7.6V6.3a1.7 1.7 0 0 1 3.4 0v1.3" fill="none" stroke-width="1.3"/>',
};

/* disabled reasons: canon codes (JJI-003 disabled_reason_code, forge) and concept-local ones (DECISION §9 item 6) */
const JJ_REASONS = {
  interactive_editor_session_required: "Splitting needs a picker for which edits go where, and Puppet Master can't show it yet.",
  conflict_state_unresolved: 'Its change has a conflict. Publishing conflicts is blocked.',
  review_capability_not_current: 'Check again first: what the review service allows has not been checked yet.',
  jj_0_44_colocated_import_export_disabled_upstream_race: 'Jujutsu 0.44 can race with Git when it imports or exports in a colocated repository, so both stay off until this setup is certified. There is no Git fallback.',
  change_divergent_ambiguous_target: 'This change has two versions. Act on one of the versions listed under it.',
  immutable_change: 'Jujutsu keeps this change as it is: it is on main. Start a new change on top instead.',
  immutable_parent: 'Squash folds this change into its parent, and its parent is on main, which Jujutsu keeps as it is.',
  workspace_current: "You're working in this workspace. Switch to another one first.",
  bookmark_move_backwards: "That change is not ahead of where the bookmark is now. Moving a bookmark backwards or sideways needs a confirmation Puppet Master can't show yet.",
  remote_bookmark_absent: 'origin has no bookmark by this name yet, so there is nothing to track. Pushing it creates it there.',
  conflict_surface_read_only_on_jujutsu: 'Conflicts are read-only here for now. Inspect them, or edit the markers in the file by hand.',
};
const JJ_CMDS = [
  'cmd.jujutsu.status.refresh', 'cmd.jujutsu.diff.open', 'cmd.jujutsu.history.open', 'cmd.jujutsu.change.new',
  'cmd.jujutsu.change.describe', 'cmd.jujutsu.change.edit', 'cmd.jujutsu.change.split', 'cmd.jujutsu.change.squash',
  'cmd.jujutsu.change.rebase', 'cmd.jujutsu.change.abandon', 'cmd.jujutsu.change.restore', 'cmd.jujutsu.bookmark.create',
  'cmd.jujutsu.bookmark.move', 'cmd.jujutsu.bookmark.rename', 'cmd.jujutsu.bookmark.delete', 'cmd.jujutsu.bookmark.track',
  'cmd.jujutsu.bookmark.untrack', 'cmd.jujutsu.workspace.create', 'cmd.jujutsu.workspace.open',
  'cmd.jujutsu.workspace.switch', 'cmd.jujutsu.workspace.remove', 'cmd.jujutsu.operation.log',
  'cmd.jujutsu.operation.show', 'cmd.jujutsu.operation.undo', 'cmd.jujutsu.operation.restore', 'cmd.jujutsu.git.fetch',
  'cmd.jujutsu.git.push', 'cmd.jujutsu.git.import', 'cmd.jujutsu.git.export', 'cmd.forge.review.refresh',
  'cmd.forge.review.open', 'cmd.source_control.open_merge_editor',
];

/* ---------- small builders ---------- */
const jh = (spec, attrs, ...kids) => PMR.h(spec, attrs, ...kids);
function jjIco(name, cls) {
  const i = jh('i', { class: ['pm-ico', cls], 'data-ico': name, 'aria-hidden': 'true' });
  const raw = JJ_SVG[name]
    ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + JJ_SVG[name] + '</svg>'
    : (typeof window.PMIcon === 'function' ? window.PMIcon(name) : '');
  i.innerHTML = raw || '';
  return i;
}
const jjArg = (cmd, target, what) => cmd + ' -> ' + target + (what ? ' (' + what + ')' : '');
const reasonText = code => JJ_REASONS[code] || code;
/* a state: the glyph's shape is the state, its colour comes from data-d-st (50-status) */
function jjState(shape, word, colour) {
  return jh('span.d-jst', { 'data-d-st': colour || shape }, glyph(shape), jh('span.d-jst-w', { text: capFirst(word) }));
}
/* a command control: { label, cmd, arg, reason, primary, danger, hover, detail, path, menu, cls, attrs } */
function jjBtn(c, base) {
  const a = { type: 'button', class: [base || 'pm-btn', c.primary && 'pm-btn-primary', c.danger && 'danger', c.cls] };
  if (c.cmd) Object.assign(a, { 'data-command-id': c.cmd, 'data-demo-action': c.cmd, 'data-demo-arg': c.arg || c.cmd, 'data-availability': JJ_AVAIL });
  if (c.reason) Object.assign(a, { 'aria-disabled': 'true', 'data-disabled-reason': c.reason, 'data-demo-reason': c.reason });
  if (c.path) a['data-path'] = c.path;
  if (c.menu) Object.assign(a, { 'aria-haspopup': 'menu', 'aria-expanded': 'false' });
  Object.assign(a, c.attrs || {});
  const b = jh('button', a, c.icon && base === 'pm-minibtn' ? jjIco(c.icon) : null, base === 'pm-minibtn' ? null : jh('span', { text: c.label }), c.menu && base !== 'pm-minibtn' ? jjIco('chevD', 'd-jj-chev') : null);
  PMR.hover(b, c.hover || c.label, c.reason ? reasonText(c.reason) : c.detail);
  if (base === 'pm-minibtn') b.setAttribute('aria-label', c.hover || c.label);
  if (c.menu) b.addEventListener('click', ev => { ev.preventDefault(); ev.stopPropagation(); jjMenu(b, c.menu()); });
  return b;
}
/* menu items: { label, cmd, arg, reason, danger, icon, meta } in groups [{ label, items }] -> PMR.menu */
function jjMenuItem(it) {
  const d = { label: it.label, icon: it.icon, meta: it.meta, danger: it.danger };
  if (it.cmd) Object.assign(d, { cmd: it.cmd, arg: it.arg || it.cmd, commandId: it.cmd, availability: JJ_AVAIL });
  if (it.reason) Object.assign(d, { disabled: reasonText(it.reason), disabledReason: it.reason, attrs: { 'data-demo-reason': it.reason } });
  return d;
}
function jjMenu(trig, def) {
  const groups = def.groups.map(g => ({ label: g.label, items: g.items.map(jjMenuItem) }));
  const w = Math.max(230, Math.min(300, Math.round(trig.getBoundingClientRect().width)));
  PMR.menu.toggle({ id: 'd-jj-' + def.id, label: def.label, groups }, trig, { width: w });
}
function jjActs(list) { return jh('div.sh-acts', list.filter(Boolean).map(c => jjBtn(c))); }
function jjKv(k, v, mono) { return jh('div.sh-kv', jh('span.sh-k', { text: k }), jh('span', { class: ['sh-v', mono && 'sh-mono'], text: v })); }
/* "Technical details": raw ids only here (JJI §4.1, SCS §4.2) */
function jjTech(rows) {
  if (!rows || !rows.length) return null;
  return jh('div.d-tech', { 'data-acc': '' },
    jh('div.d-tech-h', { 'data-collapse': '', role: 'button', tabindex: '0', 'aria-expanded': 'false' }, jjIco('chevR', 'sh-accchev'), jh('span', { text: 'Technical details' })),
    jh('div.sh-accb', jh('div.pm-acc-inner', jh('div.d-jkv', rows.map(r => jjKv(r[0], r[1], true))))));
}
/* meta line: the state, the short change id, then facts. The line breaks between pieces; each piece draws its own
   separator dot, and the dot of a piece that starts a line falls outside the clipped box (73-jj .d-jmeta). */
function jjMeta(r) {
  const parts = [];
  if (r.st) parts.push(jjState(r.st[0], r.st[1], r.st[2]));
  if (r.id) parts.push(jh('span.d-jm.d-jid', { text: r.id }));
  (r.meta || []).forEach(m => parts.push(typeof m === 'string' ? jh('span.d-jm', { text: m }) : m));
  parts.forEach(p => p.classList.add('d-jmi'));
  return jh('span.sh-meta', jh('span.d-jmeta', parts));
}
/* a row: line 1 the name (and on the right the letter or the age), line 2 the state, id and facts (and the diff) */
function jjRow(r) {
  const aside = r.letter ? jh('span', { class: ['pm-gs', 'd-jr-aside', r.letter === 'A' ? 'pm-gs-staged' : r.letter === 'C' ? 'd-gs-conflict' : 'pm-gs-mod'], text: r.letter })
    : r.aside ? jh('span.d-jr-aside', { text: r.aside }) : null;
  /* two independent lines, so a wide diff on line 2 never narrows the name on line 1 */
  const head = jh('div', { class: 'sh-chg-h d-jr pmr-cur', 'data-collapse': '', role: 'button', tabindex: '0', 'aria-expanded': String(!!r.open) },
    jjIco('chevR', 'sh-accchev'),
    jh('span.d-jr-l1', jh('span', { class: ['sh-nm-txt', r.mono && 'sh-mono', r.quiet && 'd-jr-quiet'], text: r.name }), aside),
    jh('span.d-jr-l2', jjMeta(r),
      r.ds ? jh('span.sh-ds', jh('b.add', { text: '+' + r.ds[0] }), ' ', jh('b.del', { text: '-' + r.ds[1] })) : null));
  if (r.hover) PMR.hover(head, r.hover, r.hoverDetail);
  const inner = [];
  if (r.hunk) inner.push(jh('div.sh-hunkprev', { text: r.hunk }));
  (r.files || []).forEach(f => inner.push(jh('div.sh-cfl', jh('span.f', { text: f[0] }), jh('span.sh-ds', jh('b.add', { text: '+' + f[1] }), ' ', jh('b.del', { text: '-' + f[2] })))));
  if (r.facts && r.facts.length) inner.push(jh('div.d-jkv', r.facts.map(f => jjKv(f[0], f[1], f[2]))));
  if (r.note) inner.push(jh('div.d-jj-rnote', { text: r.note }));
  if (r.acts) inner.push(jjActs(r.acts));
  const tech = jjTech(r.tech);
  if (tech) inner.push(tech);
  const item = jh('div', { class: ['sh-chg', 'd-jj-row', r.open && 'open', r.cls], 'data-acc': '' }, head, jh('div.sh-accb', jh('div.pm-acc-inner', inner)));
  if (r.owner) item.setAttribute('data-owner', r.owner);
  if (r.rowNote) item.insertBefore(jh('div.d-jj-rownote', { text: r.rowNote }), item.lastChild);
  return item;
}
/* a shelf: the coloured box with its head band (30-shelves) */
function jjShelf(s) {
  const head = jh('div.sh-head', jh('span.sh-hico', jjIco(s.icon, 'sm')), jh('span.sh-hlabel', { text: s.label }),
    s.count != null ? jh('span.sh-hcount', { text: String(s.count) }) : null, (s.headBtns || []).map(c => jjBtn(c, 'pm-minibtn')));
  return jh('section.sh-shelf', { style: '--cat:var(--cat-' + s.cat + ')', 'data-jj-shelf': s.id }, head, jh('div.sh-body', s.body.filter(Boolean)));
}
const jjFoot = text => jh('div.pm-footnote', { text });
const jjWide = c => jjBtn(Object.assign({ cls: 'd-jj-wide' }, c));
function jjGroup(icon, name, count, mono) {
  return jh('div.d-jj-grp', jjIco(icon), jh('span', { class: ['d-jj-grp-n', mono && 'sh-mono'], text: name }), count ? jh('span.d-jj-grp-c', { text: count }) : null);
}

/* ---------- the example repository (tastebook; DECISION §5) ---------- */
const CUR = { id: 'nkmwqzvw', desc: 'Make quantity parsing accept mixed fractions' };
const bmMove = (bm, to, what) => ({ label: bm, icon: 'pin', cmd: 'cmd.jujutsu.bookmark.move', arg: jjArg('cmd.jujutsu.bookmark.move', bm + ' to ' + to, what || 'here only; push to update origin') });
const bmBack = bm => ({ label: bm, icon: 'pin', cmd: 'cmd.jujutsu.bookmark.move', reason: 'bookmark_move_backwards' });
function setBookmarkMenu(change, moves) {
  return { label: 'Set bookmark…', menu: () => ({ id: 'setbm', label: 'Set a bookmark on ' + change, groups: [
    { label: 'Move here', items: moves },
    { label: 'New', items: [{ label: 'New bookmark here…', icon: 'plus', cmd: 'cmd.jujutsu.bookmark.create', arg: jjArg('cmd.jujutsu.bookmark.create', 'new bookmark on ' + change, 'asks for a name') }] },
  ] }) };
}
function rebaseItems(change, onto) {
  return onto.map(o => o.reason ? { label: o.label, meta: o.meta, reason: o.reason, cmd: 'cmd.jujutsu.change.rebase' }
    : { label: o.label, meta: o.meta, cmd: 'cmd.jujutsu.change.rebase', arg: jjArg('cmd.jujutsu.change.rebase', change + ' onto ' + o.label, o.what || 'its descendants follow') });
}

function paneChanges() {
  const more = { label: 'More', hover: 'More actions for the current change', menu: () => ({ id: 'cur-more', label: 'Current change', groups: [
    { label: 'Rebase onto', items: rebaseItems(CUR.id, [{ label: 'main', meta: 'ytsrmlzk · 4 min', what: 'main has moved; its descendants follow' }, { label: 'thread/import-fixes', meta: 'rxwlunkq' }, { label: 'ci/buildx-pin', meta: '2 versions', reason: 'change_divergent_ambiguous_target' }]) },
    { items: [
      { label: 'Split', icon: 'scissors', cmd: 'cmd.jujutsu.change.split', reason: 'interactive_editor_session_required' },
      { label: 'Discard edits', icon: 'x', danger: true, cmd: 'cmd.jujutsu.change.restore', arg: jjArg('cmd.jujutsu.change.restore', CUR.id + ' (every file)', 'confirm: Discard every edit in this change? Its files go back to how they are in its parent change. Undo is in the Operation Log.') },
      { label: 'Abandon', icon: 'trash', danger: true, cmd: 'cmd.jujutsu.change.abandon', arg: jjArg('cmd.jujutsu.change.abandon', CUR.id + ' "' + CUR.desc + '"', 'confirm: its edits are dropped and a new empty change takes its place. Undo is in the Operation Log.') },
    ] },
  ] }) };
  const cur = jjRow({
    name: CUR.desc, st: ['conflict', 'conflicted'], id: CUR.id, meta: ['on an older main'], ds: [262, 37], open: false,
    facts: [['Description', CUR.desc], ['Parent', 'feat(ratings): schema + API + stars UI · on main'], ['Files', '6 changed · 1 conflict'],
      ['Workspace', 'default@ (this one)'], ['Evolution', '4 versions · last rewritten 14:32 by Describe']],
    tech: [['Change ID', 'nkmwqzvwlprsxtyuoqmnwkzlrvptyxso'], ['Commit ID', 'e19a8b3f6c2d4a17b0e95d3c8f21a6b4d7e0c913'], ['Parent change', 'qoxlywutmrsnkpzvlqwyxtoumrksnzpl']],
  });
  const moved = jh('div.pm-note.d-jj-moved', jh('span', { text: 'main has moved since this change started.' }),
    jjBtn({ label: 'Rebase onto main', cmd: 'cmd.jujutsu.change.rebase', arg: jjArg('cmd.jujutsu.change.rebase', CUR.id + ' onto main (ytsrmlzk, feat(search))', 'the counterpart of Pull; the conflict may change'), detail: 'Moves the current change onto the newest main. Jujutsu records the rebase, so Undo can take it back.' }));
  const input = jh('input', { 'aria-label': 'Description of the current change', placeholder: 'Describe this change…', value: CUR.desc });
  input.value = CUR.desc;
  const describe = jh('div.pm-commitrow.d-jj-describe', jh('label.pm-input', input),
    jjBtn({ label: 'Describe', cmd: 'cmd.jujutsu.change.describe', arg: jjArg('cmd.jujutsu.change.describe', CUR.id, 'sets the description to the text in the box'), detail: 'Names the current change. In Jujutsu this replaces writing a commit message.' }));
  const row = jh('div.pm-eqrow.d-jj-curacts',
    jjBtn({ label: 'New change', primary: true, cmd: 'cmd.jujutsu.change.new', arg: jjArg('cmd.jujutsu.change.new', 'on top of ' + CUR.id, 'finishes this change; the new one starts empty'), detail: 'Finishes the current change and starts an empty one on top. This does the job Commit does in Git.' }),
    jjBtn({ label: 'Squash', cmd: 'cmd.jujutsu.change.squash', reason: 'immutable_parent' }),
    jjBtn(more));
  const files = [
    ['recipes.rs', 'src/routes', 'M', 18, 3, '@@ -41,6 +41,9 @@ fn scaled_quantity(&self) -> Quantity {'],
    ['quantity.rs', 'src/parse', 'M', 64, 12, '@@ -8,7 +8,22 @@ pub fn parse_quantity(input: &str) -> Result<Quantity> {'],
    ['mixed_fractions.rs', 'src/parse', 'A', 96, 0, '@@ -0,0 +1,96 @@ //! Mixed fractions: "1 1/2", "1½"'],
    ['QuantityStepper.svelte', 'web/src/lib/components/recipe/editor', 'M', 24, 6, '@@ -12,6 +12,14 @@ <script lang="ts">'],
    ['quantity_parse_proptest.rs', 'tests', 'A', 58, 0, '@@ -0,0 +1,58 @@ proptest! {'],
  ].map(f => jjRow({
    name: f[0], mono: true, letter: f[2], meta: [jh('span.d-jm.d-jdir', { text: f[1] })], ds: [f[3], f[4]], hunk: f[5],
    acts: [
      { label: 'Open diff', cmd: 'cmd.jujutsu.diff.open', arg: jjArg('cmd.jujutsu.diff.open', f[1] + '/' + f[0], 'current change vs its parent') },
      { label: 'Open file', cmd: 'cmd.file.open', arg: jjArg('cmd.file.open', f[1] + '/' + f[0]), path: f[1] + '/' + f[0] },
    ],
  }));
  const conflict = jjRow({
    name: 'import.rs', mono: true, letter: 'C', st: ['conflict', 'conflicted'], meta: [jh('span.d-jm.d-jdir', { text: 'src/services' }), '2 sides'], ds: [31, 9],
    hunk: '<<<<<<< Conflict 1 of 1 · lines 88-104',
    facts: [['Sides', 'this change and feat(ratings)']],
    acts: [
      { label: 'Open diff', cmd: 'cmd.jujutsu.diff.open', arg: jjArg('cmd.jujutsu.diff.open', 'src/services/import.rs', 'both sides of the conflict, read-only'), detail: 'Inspect the conflict: both sides and the base, read-only.' },
      { label: 'Open file', cmd: 'cmd.file.open', arg: jjArg('cmd.file.open', 'src/services/import.rs', 'edit the conflict markers by hand'), path: 'src/services/import.rs' },
      { label: 'Open merge editor', cmd: 'cmd.source_control.open_merge_editor', reason: 'conflict_surface_read_only_on_jujutsu' },
    ],
  });
  return [
    jjShelf({ id: 'current', cat: 'green', icon: 'diff', label: 'Current change', body: [cur, moved, describe, row] }),
    jjShelf({ id: 'conflicts', cat: 'fail', icon: 'warn', label: 'Conflicts', count: 1, body: [
      jh('div.pm-footnote.d-jj-shelfnote', { text: 'Conflicts are read-only here for now. Inspect them, or edit the markers in the file by hand; the conflict clears after Jujutsu records the edit.' }), conflict] }),
    jjShelf({ id: 'files', cat: 'warn', icon: 'spark', label: 'Changed files', count: 5, body: files }),
    jjFoot('No staging or stash in Jujutsu: every edit is part of the current change. To set work aside, start a New change; this one stays in History.'),
  ];
}

function paneWorkspaces() {
  const recover = [
    { label: 'Open Operation Log', cmd: 'cmd.jujutsu.operation.log', arg: jjArg('cmd.jujutsu.operation.log', 'lane-d-infra@', 'see what rewrote its change') },
    { label: 'Inspect last operation', cmd: 'cmd.jujutsu.operation.show', arg: jjArg('cmd.jujutsu.operation.show', 'op 7d41c2 (Rebased 2 changes onto main)') },
  ];
  const ws = (name, o) => jjRow(Object.assign({ name, mono: true }, o));
  const open = n => ({ label: 'Open', cmd: 'cmd.jujutsu.workspace.open', arg: jjArg('cmd.jujutsu.workspace.open', n) });
  const sw = n => ({ label: 'Switch to this workspace', cmd: 'cmd.jujutsu.workspace.switch', arg: jjArg('cmd.jujutsu.workspace.switch', n) });
  const rm = n => ({ label: 'Remove', danger: true, cmd: 'cmd.jujutsu.workspace.remove', arg: jjArg('cmd.jujutsu.workspace.remove', n, 'confirm: removes the workspace from Jujutsu; its folder stays on disk and its change stays in History') });
  const rows = [
    ws('default@', { owner: 'manual', st: ['current', 'you are here', 'current'], meta: ['Manual'], ds: [262, 37],
      facts: [['Working on', CUR.desc], ['Path', '~/Projects/tastebook', true], ['Last activity', '14:32 · Described the current change']],
      acts: [open('default@'), { label: 'Remove', danger: true, cmd: 'cmd.jujutsu.workspace.remove', reason: 'workspace_current' }],
      tech: [['Workspace ID', 'default'], ['@ change ID', 'nkmwqzvwlprsxtyuoqmnwkzlrvptyxso']] }),
    ws('import-fixes@', { owner: 'thread', st: ['live', 'active'], meta: ['Thread', '17 min'],
      facts: [['Working on', 'No description yet (empty, on Fix import of mixed units)'], ['Path', '~/Projects/tastebook/.workspaces/import-fixes', true], ['Last activity', '14:18 · Started a new change']],
      acts: [open('import-fixes@'), sw('import-fixes@'), { label: 'Thread', cmd: null, attrs: { 'data-demo-action': 'demo.toast', 'data-demo-arg': 'cmd.chat.open -> thread import-fixes' } }, rm('import-fixes@')],
      tech: [['Workspace ID', 'import-fixes'], ['@ change ID', 'vqptlmrowkzsnxyulpqmrtwvoyknszlx']] }),
    ws('lane-b-api@', { owner: 'orch', st: ['live', 'active'], meta: ['Orchestrator run #47', '2 h'], ds: [310, 42],
      facts: [['Working on', 'Add the ratings endpoint to the public API'], ['Path', '~/Projects/tastebook/.workspaces/lane-b-api', true], ['Last activity', '12:40 · Described a change']],
      acts: [open('lane-b-api@'), sw('lane-b-api@'), { label: 'Lane', attrs: { 'data-demo-action': 'page.go', 'data-demo-arg': 'orchestrator' } }, rm('lane-b-api@')],
      tech: [['Workspace ID', 'lane-b-api'], ['@ change ID', 'lwpkzrnsqvmoxtyuylqkwnrzpsvmotxk']] }),
    ws('lane-d-infra@', { owner: 'agents', st: ['stale', 'out of date'], meta: ['Infra agent', '3 h'], ds: [188, 23],
      rowNote: 'Another workspace rewrote its change. Jujutsu brings it up to date from inside it: open it and run jj workspace update-stale there.',
      facts: [['Working on', 'Pin buildx for multi-arch builds (version 1 of 2)'], ['Path', '~/Projects/tastebook/.workspaces/lane-d-infra', true], ['Last activity', '11:52 · Described a change']],
      acts: [open('lane-d-infra@'), sw('lane-d-infra@')].concat(recover, [{ label: 'Lane', attrs: { 'data-demo-action': 'page.go', 'data-demo-arg': 'orchestrator' } }, rm('lane-d-infra@')]),
      tech: [['Workspace ID', 'lane-d-infra'], ['@ change ID', 'swkqmnoxlptyrzvuwkqnmslxozprtyvn']] }),
  ];
  const empty = jh('div.d-jj-empty', { hidden: '' }, jh('span.d-jj-empty-t'), jh('button.d-jj-link', { type: 'button', text: 'Show all' }));
  const filter = jjOwnerFilter(rows, empty);
  return [
    jjShelf({ id: 'workspaces', cat: 'purple', icon: 'layers', label: 'Workspaces', count: '4 · 1 out of date', body: [filter].concat(rows, [empty,
      jjWide({ label: 'New workspace', cmd: 'cmd.jujutsu.workspace.create', arg: jjArg('cmd.jujutsu.workspace.create', 'new workspace beside the current change', 'asks for a name; starts on a new change with the same parent; your current edits stay here'), detail: 'Starts the new workspace on a new change beside your current one (same parent). Your current edits stay in this workspace.' })]) }),
    jjFoot('Each workspace is its own working copy of this repository with its own current change. Threads and agents get their own when they start work.'),
  ];
}
/* the owner filter: the same chat-style dropdown as Git's worktrees; a local view filter, no command */
function jjOwnerFilter(rows, empty) {
  const OPTS = [['all', 'All'], ['thread', 'Threads'], ['orch', 'Orchestrator'], ['agents', 'Agents'], ['manual', 'Manual']];
  let cur = 'all';
  const value = jh('span.d-select-v', { text: 'All' });
  const trig = jh('button', { type: 'button', class: 'd-select', 'aria-haspopup': 'menu', 'aria-expanded': 'false' },
    PMR.icon('filter', 'd-select-ico'), jh('span.d-select-k', { text: 'Owner' }), value, PMR.icon('chevD'));
  PMR.hover(trig, 'Filter workspaces by owner', 'Threads, the orchestrator, agents or manual workspaces');
  const set = v => {
    cur = v;
    value.textContent = OPTS.find(o => o[0] === v)[1];
    let shown = 0;
    rows.forEach(r => { const on = v === 'all' || r.getAttribute('data-owner') === v; r.hidden = !on; if (on) shown += 1; });
    empty.hidden = shown > 0;
    empty.firstChild.textContent = 'No workspaces for ' + value.textContent + '.';
    const pane = trig.closest('[data-jj-pane]');
    if (pane && pane.offsetParent) { stackHeads(pane); midFitAll(pane); }
  };
  empty.lastChild.addEventListener('click', () => set('all'));
  trig.addEventListener('click', ev => {
    ev.preventDefault(); ev.stopPropagation();
    const items = OPTS.map(o => ({ label: o[1], value: o[0], selected: o[0] === cur }));
    PMR.menu.toggle({ id: 'd-jj-owner', label: 'Owner', value: cur, groups: [{ items }] }, trig, { width: Math.max(220, Math.round(trig.getBoundingClientRect().width)), onPick: it => set(it.value) });
  });
  return jh('div.d-wtfilter', trig);
}

function paneHistory() {
  const imm = 'immutable_change';
  const diff = (id, what) => ({ label: 'Open diff', cmd: 'cmd.jujutsu.diff.open', arg: jjArg('cmd.jujutsu.diff.open', id, what || 'vs its parent') });
  const edit = (id, desc) => ({ label: 'Edit', cmd: 'cmd.jujutsu.change.edit', arg: jjArg('cmd.jujutsu.change.edit', id + ' "' + desc + '"', 'your edits go into this change from now on'), hover: 'Work on this change', detail: 'Makes this change the one your edits go into. Its descendants follow automatically.' });
  const newOn = (id, what) => ({ label: 'New change on top', cmd: 'cmd.jujutsu.change.new', arg: jjArg('cmd.jujutsu.change.new', 'on top of ' + id, what || 'starts an empty change there') });
  /* the More menu of a change; rewrite items carry `reason` where Jujutsu would refuse */
  const more = (id, desc, o) => {
    const r = o.reason;
    const items = [
      o.noNew ? null : { label: 'New change on top', icon: 'plus', cmd: 'cmd.jujutsu.change.new', arg: jjArg('cmd.jujutsu.change.new', 'on top of ' + id) },
      { label: 'Describe…', icon: 'edit', cmd: 'cmd.jujutsu.change.describe', reason: r, arg: jjArg('cmd.jujutsu.change.describe', id, 'asks for the new description') },
      { label: 'Squash into parent', icon: 'merge', cmd: 'cmd.jujutsu.change.squash', reason: r || o.squash, arg: jjArg('cmd.jujutsu.change.squash', id + ' into its parent') },
      { label: 'Abandon', icon: 'trash', danger: true, cmd: 'cmd.jujutsu.change.abandon', reason: r, arg: jjArg('cmd.jujutsu.change.abandon', id + ' "' + desc + '"', 'confirm: its children move onto its parent. Undo is in the Operation Log.') },
    ].filter(Boolean);
    const onto = r ? [{ label: 'main', reason: r }] : rebaseItems(id, o.onto || [{ label: 'main', meta: 'ytsrmlzk · 4 min' }]);
    const create = { label: 'New bookmark here…', icon: 'plus', cmd: 'cmd.jujutsu.bookmark.create', reason: o.lockAll ? r : undefined, arg: jjArg('cmd.jujutsu.bookmark.create', 'new bookmark on ' + id, 'asks for a name') };
    return { label: 'More', hover: 'More actions for this change', menu: () => ({ id: 'hist-more', label: desc, groups: [
      { items },
      { label: 'Rebase onto', items: onto },
      { label: 'Set bookmark', items: (o.moves || []).concat([create]) },
    ] }) };
  };
  const pushedNote = 'Pushed to origin. Rewriting it is fine; the next push updates origin.';
  const rows = [];
  rows.push(jjGroup('pin', 'feature/mixed-fractions', '', true));
  rows.push(jjRow({ name: CUR.desc, aside: '3 min', st: ['conflict', 'conflicted'], id: CUR.id, meta: ['default@'],
    files: [['src/parse/quantity.rs', 64, 12], ['src/parse/mixed_fractions.rs', 96, 0], ['src/services/import.rs', 31, 9]],
    facts: [['Files', '6 changed · 1 conflict · the rest are in Changes'], ['Evolution', '4 versions · last rewritten 14:32 by Describe']],
    acts: [diff(CUR.id), newOn(CUR.id, 'finishes the current change'), more(CUR.id, CUR.desc, { noNew: true, squash: 'immutable_parent', moves: [bmMove('feature/mixed-fractions', CUR.id, 'already here'), bmBack('main')] })],
    tech: [['Change ID', 'nkmwqzvwlprsxtyuoqmnwkzlrvptyxso'], ['Commit ID', 'e19a8b3f6c2d4a17b0e95d3c8f21a6b4d7e0c913']] }));
  rows.push(jjGroup('pin', 'thread/import-fixes', '3 changes', true));
  rows.push(jjRow({ name: 'No description yet', quiet: true, aside: '17 min', st: ['idle', 'empty'], id: 'vqptlmro', meta: ['import-fixes@'],
    facts: [['Files', 'none yet']],
    acts: [diff('vqptlmro'), edit('vqptlmro', 'No description yet'), more('vqptlmro', 'No description yet', { moves: [bmMove('thread/import-fixes', 'vqptlmro', 'moves it 1 change forward; push to update origin')] })],
    tech: [['Change ID', 'vqptlmrowkzsnxyulpqmrtwvoyknszlx'], ['Commit ID', '3b8e01d94c7fa2e65d1b09c8e4f7a3d2b6c5e901']] }));
  rows.push(jjRow({ name: 'Fix import of mixed units', aside: '2 h', id: 'rxwlunkq', meta: [jh('span.d-jm.d-jbm', { text: 'thread/import-fixes' })],
    files: [['src/services/import.rs', 45, 11]],
    facts: [['Origin', 'not pushed yet: origin is 1 change behind']],
    acts: [diff('rxwlunkq'), edit('rxwlunkq', 'Fix import of mixed units'), more('rxwlunkq', 'Fix import of mixed units', { moves: [bmMove('thread/import-fixes', 'rxwlunkq', 'already here')] })],
    tech: [['Change ID', 'rxwlunkqmzpvtsoyrkwlnqxzmuspvtoy'], ['Commit ID', 'a4c9e27b1d08f63e5b2a7c90d4e1f8b36a5c2d07']] }));
  rows.push(jjRow({ name: 'Normalise unit names before parsing', aside: '5 h', st: ['info', 'pushed', 'info'], id: 'tmzqylws', meta: ['at origin'],
    files: [['src/services/normalize_units.rs', 73, 4]], note: pushedNote,
    acts: [diff('tmzqylws'), edit('tmzqylws', 'Normalise unit names before parsing'), more('tmzqylws', 'Normalise unit names before parsing', { squash: 'immutable_parent', moves: [bmBack('thread/import-fixes')] })],
    tech: [['Change ID', 'tmzqylwsrkpnvxuotlqzmwsykrnpvxut'], ['Commit ID', '5e2d8a13f0b94c67e1a3d52b8f09c7e4a6d1b38f']] }));
  rows.push(jjGroup('branch', 'No bookmark', 'set aside', false));
  rows.push(jjRow({ name: 'Try a regex fraction parser', aside: '1 d', id: 'zkpnwlqo', meta: ['no bookmark', 'yesterday'],
    files: [['src/parse/quantity.rs', 22, 30]],
    note: 'Set aside with New change. It stays here until you abandon it or put a bookmark on it.',
    acts: [diff('zkpnwlqo'), edit('zkpnwlqo', 'Try a regex fraction parser'), more('zkpnwlqo', 'Try a regex fraction parser', { squash: 'immutable_parent', moves: [bmMove('spike/regex-parser', 'zkpnwlqo', 'recreates it here; origin still has the old one')] })],
    tech: [['Change ID', 'zkpnwlqosvmrtyuxqkzlnwpsomrvtyxu'], ['Commit ID', '9f1c3b5e7a2d04f68c1e9b3a5d7f20c4e8a6b1d3']] }));
  rows.push(jjGroup('pin', 'ci/buildx-pin', '', true));
  const div = 'change_divergent_ambiguous_target';
  rows.push(jjRow({ name: 'Pin buildx for multi-arch builds', aside: '1 h', st: ['warn', 'divergent'], id: 'swkqmnox', meta: ['2 versions'], cls: 'd-jj-divergent',
    note: 'Two workspaces rewrote this change at the same time, so it has two versions. Act on one of the versions below.',
    acts: [more('swkqmnox', 'Pin buildx for multi-arch builds', { reason: div, noNew: true, lockAll: true })],
    tech: [['Change ID', 'swkqmnoxlptyrzvuwkqnmslxozprtyvn']] }));
  const ver = (n, who, ws, age, commit, files) => jjRow({ name: 'Version ' + n, aside: age, meta: [who, ws], cls: 'd-jj-ver',
    files, facts: [['Author', who], ['Workspace', ws]],
    acts: [
      { label: 'Open diff', cmd: 'cmd.jujutsu.diff.open', arg: jjArg('cmd.jujutsu.diff.open', 'swkqmnox version ' + n + ' (commit ' + commit.slice(0, 8) + ')') },
      { label: 'Edit this version', cmd: 'cmd.jujutsu.change.edit', arg: jjArg('cmd.jujutsu.change.edit', 'commit ' + commit.slice(0, 8) + ' (version ' + n + ' of swkqmnox)') },
      { label: 'Abandon this version', danger: true, cmd: 'cmd.jujutsu.change.abandon', arg: jjArg('cmd.jujutsu.change.abandon', 'commit ' + commit.slice(0, 8) + ' (version ' + n + ' of swkqmnox)', 'confirm: the other version stays; Undo is in the Operation Log') },
    ],
    tech: [['Commit ID', commit]] });
  rows.push(ver(1, 'Infra agent', 'lane-d-infra@', '3 h', '7c0d2e9f4b1a6c38e5d07f2b9a4c1e6d8b3f5a20', [['.github/workflows/docker-publish-multi-arch.yml', 12, 3]]));
  rows.push(ver(2, 'you', 'default@', '1 h', 'd81f5a3c9e07b24f6a1d8c3e5b90f7a2c4e6d1b8', [['.github/workflows/docker-publish-multi-arch.yml', 14, 3], ['docker/buildx.toml', 6, 0]]));
  rows.push(jjGroup('pin', 'main', 'immutable', true));
  rows.push(jjRow({ name: 'feat(search): tantivy query endpoint + ranked results', aside: '4 min', st: ['immutable', 'immutable', 'idle'], id: 'ytsrmlzk', meta: ['main@origin'],
    files: [['src/routes/search.rs', 182, 6], ['src/services/search/tantivy_query.rs', 240, 0]],
    acts: [diff('ytsrmlzk'), newOn('ytsrmlzk', 'this is how you start from main'), more('ytsrmlzk', 'feat(search): tantivy query endpoint + ranked results', { reason: imm, noNew: true, moves: [bmMove('feature/search', 'ytsrmlzk', 'moves it back onto main; push to update origin')] })],
    tech: [['Change ID', 'ytsrmlzkqpwnvxoutsrmlzkqpwnvxout'], ['Commit ID', 'abc12ef90d4c6b1a3e5f7d9c2b4a6e8f0d1c3b57']] }));
  rows.push(jjRow({ name: 'feat(ratings): schema + API + stars UI', aside: '2 h', st: ['immutable', 'immutable', 'idle'], id: 'qoxlywut', meta: ['parent of the current change'],
    files: [['migrations/0007_ratings.sql', 38, 0], ['src/routes/ratings.rs', 120, 4], ['web/src/lib/components/recipe/StarsRating.svelte', 86, 0]],
    acts: [diff('qoxlywut'), newOn('qoxlywut'), more('qoxlywut', 'feat(ratings): schema + API + stars UI', { reason: imm, noNew: true, moves: [bmBack('main')] })],
    tech: [['Change ID', 'qoxlywutmrsnkpzvlqwyxtoumrksnzpl'], ['Commit ID', 'def34ab17c9e2f05d8b6a4c1e3f7d9b20a5c8e64']] }));
  return [
    jjShelf({ id: 'history', cat: 'amber', icon: 'clock', label: 'History', count: '6 not on main', body: rows.concat([
      jh('div.pm-footnote.d-jj-shelfnote', { text: 'Showing your changes that are not on main, and main. Everything else is in the full history.' }),
      jjWide({ label: 'Open full history', cmd: 'cmd.jujutsu.history.open', arg: jjArg('cmd.jujutsu.history.open', 'tastebook', 'the full graph, every head and the root'), detail: 'Opens the History and graph view with every change, every head and the root.' }),
    ]) }),
  ];
}

function paneBookmarks() {
  const push = (bm, remote, what) => ({ label: 'Push to ' + remote, cmd: 'cmd.jujutsu.git.push', arg: jjArg('cmd.jujutsu.git.push', bm + ' to ' + remote, 'one remote' + (what ? '; ' + what : '')), detail: 'Pushes ' + bm + ' to ' + remote + ' only. Other remotes are not touched.' });
  const newHere = (bm, id) => ({ label: 'New change here', cmd: 'cmd.jujutsu.change.new', arg: jjArg('cmd.jujutsu.change.new', 'on top of ' + bm + ' (' + id + ')', "Jujutsu's answer to switching branch") });
  const moveHere = (bm, targets) => ({ label: 'Move here…', menu: () => ({ id: 'bm-move', label: 'Move ' + bm + ' to', groups: [{ label: 'Here only; push to update origin', items: targets }] }), detail: 'Moves the bookmark here only. Push it to update origin.' });
  const tgt = (bm, label, id, meta) => ({ label, meta, cmd: 'cmd.jujutsu.bookmark.move', arg: jjArg('cmd.jujutsu.bookmark.move', bm + ' to ' + id, 'here only; push to update origin') });
  const back = (label, meta) => ({ label, meta, cmd: 'cmd.jujutsu.bookmark.move', reason: 'bookmark_move_backwards' });
  const rename = bm => ({ label: 'Rename…', icon: 'edit', cmd: 'cmd.jujutsu.bookmark.rename', arg: jjArg('cmd.jujutsu.bookmark.rename', bm, 'confirm: renaming a tracked bookmark untracks it first; the old name stays on origin until you delete it there, and the new name is not on origin yet') });
  const del = (bm, tracked) => ({ label: 'Delete', icon: 'trash', danger: true, cmd: 'cmd.jujutsu.bookmark.delete', arg: jjArg('cmd.jujutsu.bookmark.delete', bm, tracked ? 'confirm: deletes it here; the copy on origin stays until you push this deletion' : 'confirm: deletes it here; origin is not affected') });
  const menu = (bm, items) => ({ label: 'More', hover: 'More actions for ' + bm, menu: () => ({ id: 'bm-more', label: bm, groups: [{ items }] }) });
  const curTarget = bm => tgt(bm, CUR.desc, CUR.id, 'current change');
  const rows = [
    jjRow({ name: 'main', mono: true, st: ['ok', 'synced'], meta: ['with origin'],
      facts: [['Points at', 'feat(search): tantivy query endpoint + ranked results · ytsrmlzk'], ['origin', 'same change']],
      acts: [newHere('main', 'ytsrmlzk'), moveHere('main', [back(CUR.desc, 'sideways'), back('feat(ratings): schema + API + stars UI', 'behind')]), menu('main', [rename('main'), { label: 'Untrack at origin', icon: 'eyeOff', cmd: 'cmd.jujutsu.bookmark.untrack', arg: jjArg('cmd.jujutsu.bookmark.untrack', 'main@origin', 'one remote: origin') }, del('main', true)])] }),
    jjRow({ name: 'feature/mixed-fractions', mono: true, st: ['idle', 'absent'], meta: ['at origin', 'on your current change'],
      facts: [['Points at', CUR.desc + ' · ' + CUR.id], ['origin', 'not there yet; pushing creates it']],
      acts: [Object.assign(push('feature/mixed-fractions', 'origin', 'creates it there'), { reason: 'conflict_state_unresolved' }), newHere('feature/mixed-fractions', CUR.id),
        menu('feature/mixed-fractions', [{ label: 'Track at origin', icon: 'eye', cmd: 'cmd.jujutsu.bookmark.track', reason: 'remote_bookmark_absent' }, rename('feature/mixed-fractions'), del('feature/mixed-fractions', false)])] }),
    jjRow({ name: 'thread/import-fixes', mono: true, st: ['dirty', 'unsynced', 'warn'], meta: ['origin is 1 change behind'],
      facts: [['Points at', 'Fix import of mixed units · rxwlunkq'], ['origin', 'Normalise unit names before parsing · tmzqylws']],
      acts: [push('thread/import-fixes', 'origin', 'moves it 1 change forward'), newHere('thread/import-fixes', 'rxwlunkq'),
        menu('thread/import-fixes', [{ label: 'Move here…', icon: 'pin', cmd: 'cmd.jujutsu.bookmark.move', arg: jjArg('cmd.jujutsu.bookmark.move', 'thread/import-fixes to vqptlmro', 'here only; push to update origin') }, { label: 'Untrack at origin', icon: 'eyeOff', cmd: 'cmd.jujutsu.bookmark.untrack', arg: jjArg('cmd.jujutsu.bookmark.untrack', 'thread/import-fixes@origin', 'one remote: origin') }, rename('thread/import-fixes'), del('thread/import-fixes', true)])] }),
    jjRow({ name: 'release/1.4', mono: true, st: ['ok', 'combined'], meta: ['origin and upstream in step'],
      facts: [['Points at', 'chore(release): 1.4.0 · mpqzrstw'], ['origin', 'same change'], ['upstream', 'same change']],
      acts: [newHere('release/1.4', 'mpqzrstw'), menu('release/1.4', [rename('release/1.4'), del('release/1.4', true)])] }),
    jjRow({ name: 'feature/search', mono: true, st: ['info', 'tracked per remote'], meta: ['upstream 2 behind'],
      facts: [['Points at', 'Rank search results by rating · kwvznpqo'], ['origin', 'synced'], ['upstream', 'unsynced · 2 changes behind']],
      acts: [push('feature/search', 'upstream', 'moves it 2 changes forward there'), newHere('feature/search', 'kwvznpqo'),
        menu('feature/search', [{ label: 'Untrack at upstream', icon: 'eyeOff', cmd: 'cmd.jujutsu.bookmark.untrack', arg: jjArg('cmd.jujutsu.bookmark.untrack', 'feature/search@upstream', 'one remote: upstream; origin stays tracked') }, rename('feature/search'), del('feature/search', true)])] }),
    jjRow({ name: 'docs/schema-org', mono: true, st: ['conflict', 'conflicted'], meta: ['2 targets'],
      facts: [['Here', 'Add schema.org coverage notes · lqvmspxt'], ['origin', 'Draft schema.org notes · npwtzkqr (moved on origin)']],
      note: 'It points at two changes. Pick one with the buttons below; there is no picker yet.',
      acts: [
        { label: 'Move to the one here', cmd: 'cmd.jujutsu.bookmark.move', arg: jjArg('cmd.jujutsu.bookmark.move', 'docs/schema-org to lqvmspxt "Add schema.org coverage notes"', 'resolves the conflict here; push to update origin') },
        { label: "Move to origin's", cmd: 'cmd.jujutsu.bookmark.move', arg: jjArg('cmd.jujutsu.bookmark.move', 'docs/schema-org to npwtzkqr "Draft schema.org notes"', 'resolves the conflict here') },
        Object.assign(push('docs/schema-org', 'origin'), { reason: 'conflict_state_unresolved' }),
        menu('docs/schema-org', [del('docs/schema-org', true)])] }),
    jjRow({ name: 'spike/regex-parser', mono: true, st: ['orphan', 'deleted here'], meta: ['still on origin'],
      facts: [['Here', 'deleted'], ['origin', 'Try a regex fraction parser · zkpnwlqo']],
      acts: [{ label: 'Push deletion to origin', cmd: 'cmd.jujutsu.git.push', arg: jjArg('cmd.jujutsu.git.push', 'deletion of spike/regex-parser to origin', 'one remote; deletes it there') }] }),
  ];
  const fetchMenu = () => ({ id: 'fetch', label: 'Fetch', groups: [{ items: [
    { label: 'From origin', meta: 'default', icon: 'fetch', cmd: 'cmd.jujutsu.git.fetch', arg: jjArg('cmd.jujutsu.git.fetch', 'origin', 'the default remote') },
    { label: 'From upstream', icon: 'fetch', cmd: 'cmd.jujutsu.git.fetch', arg: jjArg('cmd.jujutsu.git.fetch', 'upstream', 'one remote') },
    { label: 'From origin and upstream', icon: 'fetch', cmd: 'cmd.jujutsu.git.fetch', arg: jjArg('cmd.jujutsu.git.fetch', 'origin and upstream', 'both remotes, named') },
  ] }] });
  return [
    jjShelf({ id: 'bookmarks', cat: 'neutral', icon: 'pin', label: 'Bookmarks', count: 7, headBtns: [
      { label: 'New bookmark', icon: 'plus', cmd: 'cmd.jujutsu.bookmark.create', arg: jjArg('cmd.jujutsu.bookmark.create', 'new bookmark on ' + CUR.id, 'asks for a name'), hover: 'New bookmark', detail: 'Puts a new bookmark on the current change. You only need one to push it.' },
      { label: 'Fetch', icon: 'fetch', menu: fetchMenu, hover: 'Fetch', detail: 'From origin by default. Pick upstream, or both, by name.' },
    ], body: rows }),
    jjShelf({ id: 'git', cat: 'blue', icon: 'source', label: 'Git', count: 'colocated', body: [
      jjKv('Git copy', 'Colocated: this folder is also a Git repository'),
      jjKv('Import and export', 'Off: Jujutsu 0.44 can race with Git here'),
      jjActs([
        { label: 'Import from Git', cmd: 'cmd.jujutsu.git.import', reason: 'jj_0_44_colocated_import_export_disabled_upstream_race' },
        { label: 'Export to Git', cmd: 'cmd.jujutsu.git.export', reason: 'jj_0_44_colocated_import_export_disabled_upstream_race' },
      ]),
      jh('div.pm-footnote.d-jj-shelfnote', { text: "@git is Git's own copy of each bookmark, not a remote, so it is not listed." }),
    ] }),
    jjFoot("Bookmarks don't move by themselves: move one onto a change before you push it. Each remote keeps its own copy."),
  ];
}

function paneOperations() {
  const restore = (op, at, what) => ({ label: 'Restore to this point…', cmd: 'cmd.jujutsu.operation.restore', arg: jjArg('cmd.jujutsu.operation.restore', 'op ' + op + ' (' + at + ')', 'preview first: ' + what), detail: 'Previews first and names what goes back. This is not Undo and not a backup restore.' });
  const inspect = (op, what) => ({ label: 'Inspect', cmd: 'cmd.jujutsu.operation.show', arg: jjArg('cmd.jujutsu.operation.show', 'op ' + op, what) });
  const op = (o) => jjRow({ name: o.what, aside: o.at, st: o.st, meta: o.meta, facts: o.facts,
    acts: [inspect(o.op, o.what), o.at === '14:32' ? null : restore(o.op, o.at, o.back)], tech: [['Operation ID', o.full]] });
  const rows = [
    op({ what: 'Described the current change', at: '14:32', op: '8f314d', full: '8f314d2ae9c07b5d1e3f6a8c0b2d4e6f81a3c5e7', meta: ['you', 'default@'],
      facts: [['Rewrote', CUR.desc + ' (version 3 → 4)']] }),
    op({ what: 'Fetched from origin', at: '14:30', op: '9c20ab', full: '9c20ab71d4e6f8a0c2b4d6e8f0a1c3e5b7d9f1a2', meta: ['you', '2 bookmarks updated'],
      facts: [['Moved', 'main: 2 changes forward · feature/search: 1 change forward']], back: 'main and feature/search go back to before the fetch' }),
    op({ what: 'Started a new change', at: '14:18', op: '38b7ca', full: '38b7ca04e2d6f8a1c3b5d7e9f0a2c4e6b8d0f1a3', meta: ['import-fixes thread', 'import-fixes@'],
      facts: [['Created', 'No description yet · vqptlmro, on Fix import of mixed units']], back: 'the empty change goes away' }),
    op({ what: 'Rebased 2 changes onto main', at: '13:55', op: '7d41c2', full: '7d41c2e8f0a2b4c6d8e0f1a3b5c7d9e1f2a4b6c8', st: ['unknown', 'outside Puppet Master'], meta: ['origin unknown'],
      facts: [['Rewrote', 'Normalise unit names before parsing · Fix import of mixed units'], ['Who', 'Not recorded by Puppet Master (JJI-011)'], ['Workspaces', 'lane-d-infra@ went out of date']], back: 'both changes go back onto the older main' }),
    op({ what: 'Saved the working copy', at: '13:40', op: '1e5f9b', full: '1e5f9b3d7a0c2e4f6b8d0a1c3e5f7b9d1a3c5e7f', meta: ['automatic', 'default@'],
      facts: [['Rewrote', CUR.desc + ' (version 2 → 3) · 2 files']], back: 'the change goes back to version 2; your files on disk are not touched until you edit again' }),
    op({ what: 'Abandoned an empty change', at: '13:20', op: '4a8c2e', full: '4a8c2e6f0b1d3a5c7e9f2b4d6a8c0e1f3b5d7a9c', meta: ['you', 'default@'],
      facts: [['Abandoned', 'No description yet · wlqmzpos (empty)']], back: 'the empty change comes back' }),
  ];
  return [
    jjShelf({ id: 'operations', cat: 'blue', icon: 'undo', label: 'Operation Log', count: '6 shown', body: [
      jjWide({ label: 'Undo: Described the current change', primary: true, cmd: 'cmd.jujutsu.operation.undo', arg: jjArg('cmd.jujutsu.operation.undo', 'op 8f314d "Described the current change" (14:32)', 'the newest operation; the description goes back to version 3'), detail: 'Undo always reverts the newest operation, and this button names it. To go further back, use Restore to this point on an older one.', cls: 'd-jj-wide d-jj-undo' }),
    ].concat(rows, [
      jh('div.pm-footnote.d-jj-shelfnote', { text: 'Every Jujutsu action is recorded here and can be undone. Project backups are separate: Backup history, below.' }),
      jjWide({ label: 'Open full log', cmd: 'cmd.jujutsu.operation.log', arg: jjArg('cmd.jujutsu.operation.log', 'tastebook', 'every operation, with filters') }),
    ]) }),
  ];
}

/* the Publish and review card for Jujutsu, below the scroller like Git's (DECISION §5.6) */
function jjCard() {
  const card = jh('section.pm7-post-card.d-jj-card', { 'data-scm-section': 'jj-publication-review' },
    jh('div.pm7-post-card-head', jh('div', jh('div.pm7-post-card-title', { text: 'Publish and review' }), jh('div.pm7-post-card-subtitle', { text: 'Where a push goes and the review it feeds, before anything is sent.' })),
      jh('span.pm7-post-state', { 'data-state': 'blocked', text: 'blocked' })),
    jh('dl.pm7-post-kv',
      jh('dt', { text: 'Push' }), jh('dd', { text: 'feature/mixed-fractions → origin (new there)' }),
      jh('dt', { text: 'Fetch from' }), jh('dd', { text: 'origin (default) · upstream' }),
      jh('dt', { text: 'Protection' }), jh('dd', { text: 'Review required on main' }),
      jh('dt', { text: 'Review' }), jh('dd', { text: 'Pull request #128 · could not check' })),
    jjTech([['Expected head', 'nkmwqzvw · e19a8b3f6c2d']]),
    jh('div.pm7-post-actions',
      jjBtn({ label: 'Preview publish', cmd: 'cmd.jujutsu.git.push', reason: 'conflict_state_unresolved', hover: 'Preview publish' }),
      jjBtn({ label: 'Check again', cmd: 'cmd.forge.review.refresh', arg: jjArg('cmd.forge.review.refresh', 'Pull request #128 on GitHub'), detail: "Reads the review's state and what you may do with it again." }),
      jjBtn({ label: 'Open review', cmd: 'cmd.forge.review.open', reason: 'review_capability_not_current' }),
      (() => { const b = jh('button', { type: 'button', class: 'pm-btn', 'data-pm7-open-backup': 'project', 'data-ui-action-id': 'ui.source_control.backup_history.open', 'data-availability': 'concept_local_controller_available' }, jh('span', { text: 'Backup history' })); PMR.hover(b, 'Browse project backups', "Opens read-only backup history for this project; it does not change the current files."); return b; })()));
  return jh('div.d-jj-foot', card);
}
/* the card folds like Git's; one remembered preference for both engines */
function jjWireFold(card) {
  const head = card.querySelector('.pm7-post-card-head');
  const btn = jh('button', { type: 'button', class: 'd-fold', 'aria-expanded': 'true' }, PMR.icon('chevD'));
  PMR.hover(btn, 'Show or hide the destinations', 'Where this publishes, the expected head and the review state');
  head.appendChild(btn);
  const set = (folded, animate) => {
    const h0 = card.offsetHeight;
    card.classList.toggle('d-folded', folded);
    btn.setAttribute('aria-expanded', String(!folded));
    if (!animate || reduced()) return;
    const f = spec();
    card.animate([{ height: h0 + 'px', overflow: 'hidden' }, { height: card.offsetHeight + 'px', overflow: 'hidden' }], { duration: f.dur, easing: f.ease });
  };
  set(!!PMR.state.get('d.publish.folded', false), false);
  const toggle = ev => {
    if (ev.target.closest('.pm-btn')) return;
    ev.preventDefault();
    const folded = !card.classList.contains('d-folded');
    PMR.state.set('d.publish.folded', folded);
    set(folded, true);
  };
  btn.addEventListener('click', toggle);
  head.addEventListener('click', toggle);
}

/* ---------- the strip ---------- */
function jjBuildStrip() {
  const strip = jh('div', { class: 'pm-segtab d-jj-strip', role: 'tablist', 'aria-label': 'Jujutsu views', style: '--cat:var(--cat-blue)' },
    jh('span.pm-segtab-ink', { 'aria-hidden': 'true' }),
    JJ_TABS.map(t => {
      const b = jh('button', { type: 'button', class: 'pm-segtab-item', role: 'tab', id: 'd-jj-tab-' + t.id, 'data-jj-tab': t.id, 'aria-controls': 'd-jj-pane-' + t.id, 'aria-selected': 'false', tabindex: '-1' },
        jjIco(t.icon), jh('span', { text: t.label }));
      PMR.hover(b, t.label);
      return b;
    }));
  strip.addEventListener('click', ev => {
    const b = ev.target.closest('[data-jj-tab]');
    if (b) jjSelect(b.getAttribute('data-jj-tab'), { animate: true });
  });
  strip.addEventListener('keydown', ev => {
    const keys = { ArrowLeft: -1, ArrowRight: 1, Home: -99, End: 99 };
    if (!(ev.key in keys)) return;
    ev.preventDefault();
    const i = JJ_TABS.findIndex(t => t.id === JJ.tab), d = keys[ev.key];
    const n = d === -99 ? 0 : d === 99 ? JJ_TABS.length - 1 : (i + d + JJ_TABS.length) % JJ_TABS.length;
    jjSelect(JJ_TABS[n].id, { animate: true });
    strip.querySelector('[data-jj-tab="' + JJ_TABS[n].id + '"]').focus();
  });
  return strip;
}
/* the fit rule for both Source strips (DECISION §4.4): decided by the longest label, so the mode never flips on a click */
function jjStripMode(st) {
  const items = Array.from(st.querySelectorAll(':scope > .pm-segtab-item'));
  if (!items.length || !st.offsetWidth) return null;
  const cs = getComputedStyle(st);
  const room = st.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  const longest = Math.max(...items.map(it => { const l = labelOf(it); return l ? Math.ceil(l.scrollWidth) : 0; }));
  const ICON = 15, GAP = 5, PAD = 12, INACTIVE = 24, n = items.length;
  if (longest + ICON + GAP + PAD <= room / n) return 'full';
  if (n > 1 && longest + ICON + GAP + PAD + (n - 1) * INACTIVE <= room) return 'active';
  return 'icons';
}
function jjFit(st) {
  const mode = st && jjStripMode(st);
  if (mode && st.getAttribute('data-d-tabs') !== mode) st.setAttribute('data-d-tabs', mode);
}
/* a folder on line 2 keeps both ends (D's middle truncation, 20-fit midFit): web/…/recipe/editor */
function jjFitDirs(root) { if (root) root.querySelectorAll('.d-jdir').forEach(el => { if (el.offsetParent) midFit(el); }); }
function jjInk(animate) {
  const st = JJ.strip;
  if (!st || !st.offsetWidth) return;
  if (!JJ.ink && window.PM6_LIQUID_INK) {
    JJ.ink = window.PM6_LIQUID_INK.attach({ strip: st, ink: st.querySelector('.pm-segtab-ink'), axis: 'h', getActive: () => st.querySelector('.pm-segtab-item.active') });
  }
  if (JJ.ink) JJ.ink.resync(!!animate);
}
function jjSelect(id, o) {
  if (!JJ.strip || !JJ.panes[id]) return;
  const was = JJ_TABS.findIndex(t => t.id === JJ.tab), now = JJ_TABS.findIndex(t => t.id === id);
  JJ.tab = id;
  JJ.strip.querySelectorAll('[data-jj-tab]').forEach(b => {
    const on = b.getAttribute('data-jj-tab') === id;
    b.classList.toggle('active', on);
    b.setAttribute('aria-selected', String(on));
    b.tabIndex = on ? 0 : -1;
  });
  Object.keys(JJ.panes).forEach(k => { JJ.panes[k].hidden = k !== id; });
  if (JJ.scroll) JJ.scroll.scrollTop = 0;
  jjFit(JJ.strip);
  const pane = JJ.panes[id];
  if (!JJ.strip.offsetWidth) return;
  requestAnimationFrame(() => {
    jjInk(o && o.animate && was !== now);
    stackHeads(pane); stackRows(pane); midFitAll(pane); jjFitDirs(pane);
    if (o && o.animate && was !== now) enterPane(pane, now > was ? 1 : -1);
  });
}

/* ---------- build and wire ---------- */
function jjBuild(panel) {
  const view = panel.querySelector(':scope > .pm7-scm-jj-view');
  if (!view || view.querySelector(':scope > .d-jj-strip')) return;
  jjRegister();
  JJ.view = view;
  Array.from(view.children).forEach(c => addClass(c, 'd-hidden'));      // today's four cards stay in the DOM
  addClass(view, 'd-jj');
  const strip = jjBuildStrip();
  const scroll = jh('div.d-jj-scroll');
  JJ.panes = {};
  const build = { changes: paneChanges, workspaces: paneWorkspaces, history: paneHistory, bookmarks: paneBookmarks, operations: paneOperations };
  JJ_TABS.forEach(t => {
    const pane = jh('div', { class: 'd-jj-pane', id: 'd-jj-pane-' + t.id, 'data-jj-pane': t.id, role: 'tabpanel', 'aria-labelledby': 'd-jj-tab-' + t.id, hidden: '' }, build[t.id]());
    JJ.panes[t.id] = pane;
    scroll.appendChild(pane);
  });
  const foot = jjCard();
  inject(view, strip, view.firstChild);
  inject(view, scroll, strip.nextSibling);
  inject(view, foot, scroll.nextSibling);
  JJ.strip = strip; JJ.scroll = scroll; JJ.ink = null;
  jjWireFold(foot.querySelector('.pm7-post-card'));
  /* the content hairline under the strip once something has scrolled under it */
  scroll.addEventListener('scroll', () => strip.classList.toggle('d-jj-scrolled', scroll.scrollTop > 2), { passive: true });
  /* an expander opened near the bottom scrolls itself into view (D's revealInView only knows .sh-scroll) */
  scroll.addEventListener('click', ev => {
    const head = ev.target.closest('[data-collapse]');
    if (!head || ev.target.closest('button, a, input')) return;
    const item = head.closest('[data-acc]');
    setTimeout(() => {
      if (!item || !item.classList.contains('open')) return;
      const ir = item.getBoundingClientRect(), sr = scroll.getBoundingClientRect(), over = ir.bottom - sr.bottom + 8;
      if (over > 0) scroll.scrollBy({ top: Math.min(over, Math.max(0, ir.top - sr.top - 40)), behavior: reduced() ? 'auto' : 'smooth' });
    }, reduced() ? 0 : 120);
  });
  /* the panel head in Jujutsu mode: Undo (names the newest operation) and Refresh; the status line names the engine */
  const banner = panel.querySelector(':scope > .sh-banner');
  if (banner) {
    inject(banner, jh('span.sh-bhead-acts.d-jj-acts',
      jjBtn({ label: 'Undo', icon: 'undo', cmd: 'cmd.jujutsu.operation.undo', arg: jjArg('cmd.jujutsu.operation.undo', 'op 8f314d "Described the current change" (14:32)', 'the newest operation'), hover: 'Undo: Described the current change', detail: 'Reverts the newest Jujutsu operation. Everything is in the Operation Log.' }, 'pm-minibtn'),
      jjBtn({ label: 'Refresh', icon: 'refresh', cmd: 'cmd.jujutsu.status.refresh', arg: jjArg('cmd.jujutsu.status.refresh', 'tastebook', 'reads the working copy, bookmarks and operations again; read-only'), hover: 'Refresh', detail: 'Reads the working copy, bookmarks and operations again. It does not bring an out-of-date workspace up to date.' }, 'pm-minibtn')));
    const bst = banner.querySelector(':scope > .sh-bstatus');
    if (bst) inject(bst, jh('span.sh-btext.d-jj-btext', { text: 'Jujutsu · GitHub' }));
  }
  /* the D passes over the new nodes now, so nothing shows unskinned for a frame */
  applyChips(view, false);
  applyCounts(view, false);
  const gitTab = panel.querySelector(':scope > .pm-segtab .pm-segtab-item.active');
  jjSelect(JJ_FROM_GIT[gitTab && gitTab.getAttribute('data-tab')] || 'changes', { animate: false });
  jjWatch(panel);
}
function jjWatch(panel) {
  /* engine switch: open the tab in the same slot position; Operation Log has no Git slot and opens History */
  const mo = new MutationObserver(() => {
    if (!D.on) return;
    const engine = panel.getAttribute('data-scm-engine');
    if (engine === JJ.engine) return;
    JJ.engine = engine;
    if (engine === 'jj') {
      const g = panel.querySelector(':scope > .pm-segtab .pm-segtab-item.active');
      jjSelect(JJ_FROM_GIT[g && g.getAttribute('data-tab')] || 'changes', { animate: false });
    } else {
      const want = (JJ_TABS.find(t => t.id === JJ.tab) || JJ_TABS[0]).git;
      const tab = panel.querySelector(':scope > .pm-segtab [data-tab="' + want + '"]');
      if (tab && !tab.classList.contains('active')) tab.click();      // the shell's own handler switches Git's panes
    }
  });
  JJ.engine = panel.getAttribute('data-scm-engine');
  mo.observe(panel, { attributes: true, attributeFilter: ['data-scm-engine'] });
  D.observers.push(mo);
  /* the strip refits and its ink snaps whenever its box changes (shown, resized, theme, text size) */
  if (window.ResizeObserver) {
    const ro = new ResizeObserver(() => { if (!D.on) return; jjFit(JJ.strip); jjInk(false); jjFitDirs(JJ.panes[JJ.tab]); });
    ro.observe(JJ.strip);
    D.observers.push(ro);
  }
  const mo2 = new MutationObserver(() => { if (D.on) requestAnimationFrame(() => { jjFit(JJ.strip); jjInk(false); jjFitDirs(JJ.panes[JJ.tab]); }); });
  mo2.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-o55-nier', 'style'] });
  D.observers.push(mo2);
  /* Git's strip follows the same longest-label rule: correct the mode right after D's fitTabs writes it */
  const gitStrip = panel.querySelector(':scope > .pm-segtab');
  if (gitStrip) {
    const mo3 = new MutationObserver(() => { if (D.on && gitStrip.hasAttribute('data-d-tabs')) jjFit(gitStrip); });
    mo3.observe(gitStrip, { attributes: true, attributeFilter: ['data-d-tabs'] });
    D.observers.push(mo3);
  }
}
/* toast handlers only where the shell has none (its toastReg pattern), and the reasons the guard reads */
function jjRegister() {
  const demo = window.PM_DEMO;
  if (demo && demo.actions && demo.actions.register && !JJ.registered) {
    JJ.registered = true;
    JJ_CMDS.forEach(id => { if (!(demo.actions.get && demo.actions.get(id))) demo.actions.register(id, ctx => ({ toast: (ctx && ctx.arg) || id })); });
  }
  const R = demo && demo.guard && demo.guard.reasons;
  if (R) Object.keys(JJ_REASONS).forEach(k => { if (!(k in R)) { R[k] = JJ_REASONS[k]; JJ.reasons.push(k); } });
}

panelHook('panel-source', {
  apply(panel) { jjBuild(panel); },
  show(panel) { if (JJ.strip) { jjFit(JJ.strip); jjInk(false); } },
  unmount() {
    const R = window.PM_DEMO && window.PM_DEMO.guard && window.PM_DEMO.guard.reasons;
    if (R) JJ.reasons.forEach(k => { delete R[k]; });
    JJ.reasons = [];
    Object.assign(JJ, { strip: null, scroll: null, panes: {}, ink: null, view: null, engine: null });
  },
});
