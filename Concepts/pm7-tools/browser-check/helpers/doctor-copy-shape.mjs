// FO17-DOCTOR-COPY-CRLF: the shape of the two texts Settings › Readiness & Doctor copies, as the check and its selftest
// read it. Chrome on Windows writes the clipboard with CRLF, so a shape test that split on '\n' alone kept a trailing
// '\r' on every line: both Copy rows failed 6 of 18 normal runs on the copy's own line endings while the copy worked.
// Support details is its six "Label: value" lines, secrets left out; the checkup summary is each group's title
// followed by its findings, "  - title: state (checked when)".
export const copyLines = (v) => String(v || '').replace(/\r\n?/g, '\n').split('\n');

export const supportDetails = (v) => {
	const l = copyLines(v);
	return l.length === 6 && /^Computer: ./.test(l[0]) && /^Browser engine: ./.test(l[1]) && /^Screen: \d+ × \d+$/.test(l[2]) && /^Puppet Master: ./.test(l[3]) && /^Server: ./.test(l[4]) && l[5] === 'Left out: Passwords, keys, tokens and file contents';
};

export const checkupSummary = (v) => {
	const l = copyLines(v);
	const groups = l.filter((x) => /^\S/.test(x)), items = l.filter((x) => /^  - .+: .+ \(checked .+\)$/.test(x));
	return groups.length >= 3 && items.length >= groups.length && groups.length + items.length === l.length;
};
