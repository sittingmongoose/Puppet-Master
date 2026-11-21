'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const filename = path.join(__dirname, 'pm7-qa2-source-probe.cjs');
const source = fs.readFileSync(filename, 'utf8');
const slots = 'Concepts/liquid-glass/opus-5.5/src/slots/';

function probe(cut) {
  let output = '';
  const process = { stdout: { write: text => { output += text; } } };
  const fixtureFs = {
    readFileSync(file, encoding) {
      const value = fs.readFileSync(file, encoding);
      if (file !== cut?.file) return value;
      assert.equal(value.match(/background:\s*none;/g)?.length, 1);
      return value.replace(/background:\s*none;/, cut.declaration);
    },
  };
  vm.runInNewContext(source, {
    __dirname, console, process, require: name => name === 'fs' ? fixtureFs : require(name),
  }, { filename });
  return { report: JSON.parse(output), exitCode: process.exitCode };
}

test('Glass hover source probe accepts the committed CSS', () => {
  const { report, exitCode } = probe();
  assert.equal(exitCode, 0);
  assert.deepEqual(report.failures, []);
});

for (const [slot, unit] of [
  ['onboarding/opus-5.5/src/css/22-hover/G0601.css', 'G0601'],
  ['usage-redesign/src/css/20-board/G1238.css', 'G1238'],
]) {
  const file = path.resolve(__dirname, '..', slots + slot);
  for (const [change, declaration] of [['removed', ''], ['restored fill', 'background: red;']]) {
    test(`Glass hover source probe rejects ${unit} with ${change}`, () => {
      const { report, exitCode } = probe({ file, declaration });
      assert.equal(exitCode, 1);
      assert.deepEqual(report.failures, [`Glass hover painter ${unit} must declare background: none`]);
    });
  }
}
