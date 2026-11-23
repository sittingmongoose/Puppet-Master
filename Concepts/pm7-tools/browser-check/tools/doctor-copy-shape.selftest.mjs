// Selftest for helpers/doctor-copy-shape.mjs: the two texts Settings › Readiness & Doctor copies are recognised by
// their shape whichever line endings the platform's clipboard wrote (FO17-DOCTOR-COPY-CRLF: Chrome on Windows writes
// CRLF, and a split on '\n' alone kept a trailing '\r' on every line, failing both Copy rows 6 of 18 normal runs).
import assert from 'node:assert/strict';
import { copyLines, supportDetails, checkupSummary } from '../helpers/doctor-copy-shape.mjs';

const CRLF = (s) => String(s).replace(/\n/g, '\r\n');
const SUPPORT_LF = ['Computer: Windows 11 PC', 'Browser engine: Chrome 158', 'Screen: 1920 × 1080', 'Puppet Master: 2.0.71', 'Server: local', 'Left out: Passwords, keys, tokens and file contents'].join('\n');
const SUMMARY_LF = ['AI providers', '  - OpenAI: ready (checked just now)', 'Storage', '  - Backups: ready (checked 2 minutes ago)', 'Sign-ins', '  - GitHub: ready (checked just now)'].join('\n');

// the same text with CRLF and with a lone CR is the same text
assert.deepEqual(copyLines(CRLF(SUPPORT_LF)), copyLines(SUPPORT_LF));
assert.deepEqual(copyLines(SUPPORT_LF.replace(/\n/g, '\r')), copyLines(SUPPORT_LF));
assert.equal(supportDetails(SUPPORT_LF), true);
assert.equal(supportDetails(CRLF(SUPPORT_LF)), true, 'a CRLF copy of Support details is recognised');
assert.equal(checkupSummary(SUMMARY_LF), true);
assert.equal(checkupSummary(CRLF(SUMMARY_LF)), true, 'a CRLF copy of the checkup summary is recognised');
// the shape still bites: a missing line, a changed last line, a line ending the split would leave (`\r` inside a line)
assert.equal(supportDetails(SUPPORT_LF.split('\n').slice(0, 5).join('\n')), false);
assert.equal(supportDetails(SUPPORT_LF.replace('Left out: Passwords, keys, tokens and file contents', 'Left out: nothing')), false);
assert.equal(supportDetails(CRLF(SUPPORT_LF).replace('Computer: Windows 11 PC', 'Computer: Windows\r11 PC')), false, 'a lone CR is a line break wherever it sits, so a CR inside a line splits it');
assert.equal(checkupSummary(SUMMARY_LF.replace('  - GitHub: ready (checked just now)', '  - GitHub ready')), false);
assert.equal(checkupSummary(''), false);
// CRLF is not accepted as *part of a line* where the shape is exact: the text is compared after normalising only
assert.equal(copyLines('a\r\nb\r\n')[2], '');
console.log('PASS doctor copy shapes: Support details and the checkup summary read the same from LF, CRLF and lone-CR text, and still fail a missing or altered line');
