import assert from 'node:assert/strict';
import { test } from 'node:test';
import { copiedFullPath, pathNotePresent } from '../checks/shelf-route.check.mjs';

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
