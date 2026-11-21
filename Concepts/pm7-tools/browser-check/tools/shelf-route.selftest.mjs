import assert from 'node:assert/strict';
import { runInNewContext } from 'node:vm';
import { test } from 'node:test';
import { copiedFullPath, pathNotePresent, pickEffectRows } from '../checks/shelf-route.check.mjs';

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
