import assert from 'node:assert/strict';
import { runInNewContext } from 'node:vm';
import { test } from 'node:test';
import { copiedFullPath, foldCensusControls, laterContextRows, noteShelfBranchMiss, pathNotePresent, pickEffectRows, pressShelfBranch, retryShelfBranch, shelfReachStatus } from '../checks/shelf-route.check.mjs';

test('T78 copied path notes name the exact copied value', () => {
  assert.equal(pathNotePresent(['Copied src'], 'src', 'copy'), true);
  assert.equal(pathNotePresent(['Copied src/routes'], 'src', 'copy'), false);
  assert.equal(pathNotePresent(['Copied backup/src'], 'src', 'copy'), false);
});

test('T78 Open with notes name the exact file or folder', () => {
  assert.equal(pathNotePresent(['cmd.file.open_with -> image_viewer · src'], 'src', 'open-with'), true);
  assert.equal(pathNotePresent(['cmd.file.open_with -> source_editor · web/src/routes/+page.svelte'], 'src', 'open-with'), false);
});

test('T79 full path copy requires the authored project root', () => {
  assert.equal(copiedFullPath(['~/tastebook/api/src/main.rs'], 'src/main.rs'), '~/tastebook/api/src/main.rs');
  assert.equal(copiedFullPath(['~/wrong/src/main.rs'], 'src/main.rs'), undefined);
});

test('T117 rejects an added row even when every live row has data-path', () => {
  const makeRow = path => {
    const attrs = new Map([['data-path', path]]);
    return {
      closest: () => null,
      checkVisibility: () => false,
      getAttribute: name => attrs.get(name) ?? null,
      setAttribute: (name, value) => attrs.set(name, value),
    };
  };
  const live = [makeRow('wrong.rs'), makeRow('extra.rs')];
  const pick = runInNewContext('(' + pickEffectRows.toString() + ')', {
    document: {
      getElementById: () => ({ querySelectorAll: () => live }),
      querySelectorAll: () => [],
    },
    CSS: { escape: value => value },
  });
  const mismatches = authored => Array.from(pick(['files', ['fm-row'], { 'fm-row': authored }]).mismatch, item => ({ ...item }));
  assert.deepEqual(mismatches(['authored.rs']),
    [{ tok: 'fm-row', live: 2, authored: 1 }]);
  assert.equal(live[0].getAttribute('data-shelf-fx-want'), null);
  assert.equal(live[1].getAttribute('data-shelf-fx-want'), null);
  assert.deepEqual(mismatches(['authored.rs', 'second.rs']), []);
  assert.equal(live[0].getAttribute('data-shelf-fx-want'), 'authored.rs');
});

function reachStatus({ opacity = '1', filter = 'none', wrapperFilter = 'none', x = 0 } = {}) {
  const slot = {
    parentElement: null,
    checkVisibility: options => !options?.opacityProperty || Number(opacity) > 0,
    getBoundingClientRect: () => ({ left: x, right: x + 250, top: 0, bottom: 500 }),
  };
  const view = { ...slot, parentElement: slot, checkVisibility: () => true };
  const wrapper = { ...view, parentElement: view };
  const button = { ...view, parentElement: wrapper, closest: () => view, isConnected: true, getAttribute: () => 'More' };
  const read = runInNewContext('(' + shelfReachStatus.toString() + ')', {
    document: { getElementById: () => slot },
    getComputedStyle: el => ({ filter: el === slot ? filter : el === wrapper ? wrapperFilter : 'none' }),
    innerWidth: 1280,
    innerHeight: 500,
  });
  return read(button);
}

test('T98 rejects transparent or offscreen panels while their controls are scrollable', () => {
  assert.equal(reachStatus().slot, true);
  assert.equal(reachStatus({ opacity: '0' }).slot, false);
  assert.equal(reachStatus({ x: -250 }).slot, false);
});

test('T124 rejects a transparent filter on a hit-testable ancestor', () => {
  assert.equal(reachStatus({ filter: 'blur(1px) opacity(0.5)' }).view, true);
  assert.equal(reachStatus({ filter: 'blur(1px) opacity(0)' }).slot, false);
  assert.equal(reachStatus({ filter: 'opacity(0%)' }).view, false);
});

test('T124 (R133-3): an opacity(0) filter on a wrapper below the view is caught from the control', () => {
  const s = reachStatus({ wrapperFilter: 'blur(1px) opacity(0)' });
  assert.equal(s.view, true, 'the view itself is shown');
  assert.equal(s.shown, false, 'the control under a transparent wrapper below the view is not shown');
  // the control's default layout visibility check is preserved: a non-zero filter keeps it shown
  assert.equal(reachStatus({ wrapperFilter: 'blur(1px) opacity(0.5)' }).shown, true);
  assert.equal(reachStatus().shown, true);
});

test('T98 later context walk includes the middle row of a known route', () => {
  const live = ['recipes.rs', 'image.rs', 'ci.yml'].map(path => ({
    getAttribute: () => path,
    setAttribute: () => {},
  }));
  const read = runInNewContext('(' + laterContextRows.toString() + ')', {
    __shelf: { rows: () => live, sig: () => 'modified file' },
  });
  const panel = { querySelectorAll: () => [] };
  assert.deepEqual(Array.from(read(panel, 'modified file').rows, r => r.which), ['image.rs', 'ci.yml']);
  live.splice(1);
  assert.deepEqual(Array.from(read(panel, 'modified file').rows, r => r.which), ['recipes.rs']);
});

test('T98 fold guard keeps each census control distinct, even with the same label', () => {
  const make = (role, shown = true) => ({ role, checkVisibility: () => shown, closest: () => null, matches: sel => sel.includes(role) });
  const first = make('popup'), second = make('popup'), head = make('accordion'), disclosure = make('disclosure');
  const row = make('treeitem'), hidden = make('popup', false), knownContextRow = make('known-class');
  const read = runInNewContext('(' + foldCensusControls.toString() + ')', {
    __shelf: { rows: () => [knownContextRow], sig: e => e.role },
  });
  const region = {
    querySelectorAll: sel => sel.includes('data-collapse') ? [first, second, head, disclosure, row, hidden] : [first, second, hidden],
  };
  assert.deepEqual(Array.from(read(region, ['known-class'])), [first, second, head, disclosure, row, knownContextRow]);
});

test('T85 preserves branch closure and hit owner when an actionability wait fails', async () => {
  const closed = { branchOpen: false, onTop: 'Save local copy', ownItem: false, pointer: { x: 200, y: 80 } };
  const miss = await pressShelfBranch(async () => { throw new Error('click timed out'); }, async () => closed);
  assert.deepEqual(miss, { error: 'click timed out', trace: closed });
  assert.equal(await pressShelfBranch(async () => {}, async () => assert.fail('unexpected failure capture')), null);
});

test('T143 prints first misses in the summary and fails a branch missed in two views', async () => {
  const checks = [], logs = [], history = new Map();
  const t = {
    log: message => logs.push(message),
    check: async (name, ok, detail, options) => checks.push({ name, ok, detail, options }),
  };
  const miss = { panel: 'panel-files', state: 'explorer', menu: 'fileContextMenu', branch: 'Copy path',
    item: 'Copy relative path', row: 'src/main.rs', error: 'click timed out', trace: { branchOpen: false } };
  await noteShelfBranchMiss(t, history, miss);
  assert.ok(checks.some(c => c.options?.notice && c.name.includes('Copy path')));
  await noteShelfBranchMiss(t, history, { ...miss, item: 'Copy full path' });
  assert.equal(checks.filter(c => !c.ok).length, 0);
  await noteShelfBranchMiss(t, history, { ...miss, state: 'open' });
  assert.deepEqual(checks.filter(c => !c.ok).map(c => c.name), ['FO-93b Copy path first press misses in multiple views']);
  assert.ok(logs.some(log => log.includes('"branchOpen":false')));
});

test('T143 retry closes a still-open submenu and its parent before reopening the same row', async () => {
  let menus = 2, retries = 0, reopened = 0;
  const actions = {
    isOpen: async () => menus > 0,
    escape: async () => { menus--; },
    shut: async () => menus === 0,
    reopen: async () => { reopened++; return true; },
    attempt: async () => { retries++; return null; },
  };
  const miss = { trace: { pressedItem: false } };
  assert.equal(await retryShelfBranch(miss, actions), null);
  assert.deepEqual([menus, reopened, retries], [0, 1, 1]);
  const delivered = { trace: { pressedItem: true } };
  const unobserved = { trace: { error: 'frame detached' } };
  assert.equal(await retryShelfBranch(delivered, actions), delivered);
  assert.equal(await retryShelfBranch(unobserved, actions), unobserved);
  assert.equal(retries, 1);
});
