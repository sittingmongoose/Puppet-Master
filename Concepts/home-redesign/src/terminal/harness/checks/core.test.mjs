import { loadT } from './load.mjs';
import assert from 'node:assert/strict';
const T = loadT(['00-core.js', '10-parser.js', '12-grid.js', '14-terminal.js']);
const txt = (t) => { const b = t.buf; const out = []; for (let y = 0; y < b.rows; y++) out.push(b.line(y).text()); return out; };
let t = new T.Terminal({ cols: 20, rows: 5, nonce: 'abc' });
t.write('hello\r\n\x1b[31mred\x1b[0m world');
assert.deepEqual(txt(t).slice(0, 2), ['hello', 'red world']);
assert.equal(t.styles.get(t.buf.line(1).st[0]).fg, 0x100 + 1);
// wrap + reflow
t = new T.Terminal({ cols: 10, rows: 4 });
t.write('abcdefghijKLMNO');
assert.deepEqual(txt(t).slice(0, 2), ['abcdefghij', 'KLMNO']);
assert.equal(t.buf.line(0).wrapped, true);
t.resize(20, 4);
assert.equal(txt(t)[0], 'abcdefghijKLMNO');
assert.equal(t.cursor.x, 15);
t.resize(5, 4);
assert.deepEqual(txt(t).slice(0, 3), ['abcde', 'fghij', 'KLMNO']);
// wide chars
t = new T.Terminal({ cols: 6, rows: 2 });
t.write('ab中文x');
assert.equal(t.buf.line(0).text(), 'ab中文');
assert.equal(t.buf.line(1).text(), 'x');
// shell integration nonce
t = new T.Terminal({ cols: 30, rows: 6, nonce: 'n1' });
let ends = [], forged = 0;
t.on('command', e => { if (e.type === 'end') ends.push(e.cmd); });
t.on('forged', () => forged++);
t.write('\x1b]133;A;pmn=n1\x07$ \x1b]133;B;pmn=n1\x07ls\r\n\x1b]133;C;pmn=n1\x07a b c\r\n\x1b]133;D;0;pmn=n1\x07');
t.write('\x1b]133;A\x07fake\x1b]133;D;1\x07');
assert.equal(ends.length, 1); assert.equal(ends[0].exit, 0); assert.equal(ends[0].cmdline, 'ls'); assert.equal(forged, 2);
assert.equal(t.commandOutput(ends[0]), 'a b c');
// SGR colon truecolor and curly underline
t = new T.Terminal({ cols: 10, rows: 2 });
t.write('\x1b[38:2::10:20:30;4:3;58:5:196mX');
const s = t.styles.get(t.buf.line(0).st[0]);
assert.equal(s.fg, 0x1000000 | (10 << 16 | 20 << 8 | 30)); assert.equal((s.flags & 0x38) >> 3, 3); assert.equal(s.ul, 0x100 + 196);
// replies
t = new T.Terminal({ cols: 10, rows: 3 }); let rep = '';
t.on('reply', r => rep += r); t.write('\x1b[6n\x1b[c\x1b[?2026$p');
assert.equal(rep, '\x1b[1;1R\x1b[?62;4;22c\x1b[?2026;2$y');
// scrollback + clear
t = new T.Terminal({ cols: 10, rows: 3, scrollback: 300 });
for (let i = 0; i < 1000; i++) t.write('line ' + i + '\r\n');
assert.ok(t.buf.lines.length <= 3 + 300 + 256);
// alt screen
t = new T.Terminal({ cols: 10, rows: 3 }); t.write('main'); t.write('\x1b[?1049h'); t.write('\x1b[Halt'); assert.equal(t.buf.line(0).text(), 'alt'); t.write('\x1b[?1049l'); assert.equal(t.buf.line(0).text(), 'main');
// OSC 8
t = new T.Terminal({ cols: 30, rows: 2 }); t.write('\x1b]8;;https://example.com\x1b\\link\x1b]8;;\x1b\\ no');
assert.equal(t.links.get(t.styles.get(t.buf.line(0).st[0]).link).uri, 'https://example.com'); assert.equal(t.styles.get(t.buf.line(0).st[5]).link, 0);
// parser perf
t = new T.Terminal({ cols: 120, rows: 40 });
const chunk = ('\x1b[32mok\x1b[0m test result: 214 passed; 0 failed; ' + 'x'.repeat(40) + '\r\n').repeat(2000);
const t0 = performance.now(); t.write(chunk); const dt = performance.now() - t0;
console.log('throughput MB/s', (chunk.length / 1e6 / (dt / 1000)).toFixed(1));
console.log('core tests ok');
