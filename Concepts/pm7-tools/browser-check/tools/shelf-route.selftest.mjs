import assert from 'node:assert/strict';
import { runInNewContext } from 'node:vm';
import { test } from 'node:test';
import { copiedFullPath, laterContextRows, pathNotePresent, pickEffectRows, shelfReachStatus } from '../checks/shelf-route.check.mjs';

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

function reachStatus({ opacity = '1', filter = 'none', x = 0 } = {}) {
  const slot = {
    parentElement: null,
    checkVisibility: options => !options?.opacityProperty || Number(opacity) > 0,
    getBoundingClientRect: () => ({ left: x, right: x + 250, top: 0, bottom: 500 }),
  };
  const view = { ...slot, parentElement: slot, checkVisibility: () => true };
  const button = { ...view, parentElement: view, closest: () => view, isConnected: true, getAttribute: () => 'More' };
  const read = runInNewContext('(' + shelfReachStatus.toString() + ')', {
    document: { getElementById: () => slot },
    getComputedStyle: el => ({ filter: el === slot ? filter : 'none' }),
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
  assert.equal(reachStatus({ filter: 'blur(1px) opacity(0.5)' }).shown, true);
  assert.equal(reachStatus({ filter: 'blur(1px) opacity(0)' }).slot, false);
  assert.equal(reachStatus({ filter: 'opacity(0%)' }).shown, false);
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
