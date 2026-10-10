/* Secrets in saved scrollback (D36). Before a terminal's scrollback is written to disk, well-known secret formats are
   replaced in the saved copy: vendor API keys, bearer tokens and JWTs, KEY=value assignments whose name says secret,
   and the body of private-key blocks. The live screen keeps the original; only what 38-saved.js writes changes.
   A secret's cells are rewritten in place, cell for cell, so the line keeps its width and every image anchor, command
   mark and column stays where it was. Where the secret is long enough the cells read "[API key · not saved]" (or
   token, secret, private key) and the rest of its cells are blank; a shorter one is filled with "•". A private key's
   BEGIN and END lines stay; its first body line carries the marker and the rest of the body is left empty.
   Command lines and link targets are scrubbed the same way. Nothing here is a vault: it is a floor that keeps the
   common formats off the disk, not a guarantee that no secret is ever saved. */
(function () {
  var PATTERNS = [
    { label: 'API key', re: /\bsk-(?:ant-|proj-|live-)?[A-Za-z0-9_-]{20,}/g },
    { label: 'API key', re: /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/g },
    { label: 'API key', re: /\bgh[pousr]_[A-Za-z0-9]{36,}|\bgithub_pat_[A-Za-z0-9_]{22,}/g },
    { label: 'API key', re: /\bglpat-[0-9A-Za-z_-]{20,}/g },
    { label: 'API key', re: /\bxox[abprs]-[A-Za-z0-9-]{10,}/g },
    { label: 'API key', re: /\bAIza[0-9A-Za-z_-]{35}/g },
    { label: 'API key', re: /\b[sr]k_(?:live|test)_[0-9A-Za-z]{16,}/g },
    { label: 'token', re: /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/g },
    { label: 'token', re: /\b(?:Bearer|Token)\s+([A-Za-z0-9._~+\/-]{16,}=*)/gi, group: 1 },
    { label: 'secret', re: /\b[A-Za-z0-9_]*(?:API_?KEY|APIKEY|SECRET|TOKEN|PASSWORD|PASSWD)[A-Za-z0-9_]*\s*[=:]\s*["']?([^\s"'`]{8,})/gi, group: 1 }
  ];
  var KEY_BEGIN = /-----BEGIN [A-Z0-9 ]*PRIVATE KEY(?: BLOCK)?-----/, KEY_END = /-----END [A-Z0-9 ]*PRIVATE KEY(?: BLOCK)?-----/;
  var KEY_BODY = /^\s*(?:[A-Za-z0-9+\/=]+|[A-Za-z-]+:.*)?\s*$/;
  var DOT = 0x2022;

  function marker(label) { return '[' + label + ' · not saved]'; }

  /* spans [start, end, label] of the secrets in one string, merged where they overlap */
  function spans(s) {
    var out = [];
    PATTERNS.forEach(function (p) {
      p.re.lastIndex = 0;
      var m;
      while ((m = p.re.exec(s))) {
        var v = p.group ? m[p.group] : m[0], at = p.group ? m.index + m[0].lastIndexOf(v) : m.index;
        out.push([at, at + v.length, p.label]);
        if (m[0].length === 0) p.re.lastIndex++;
      }
    });
    out.sort(function (a, b) { return a[0] - b[0] || b[1] - a[1]; });
    var merged = [];
    out.forEach(function (x) { var l = merged[merged.length - 1]; if (l && x[0] <= l[1]) l[1] = Math.max(l[1], x[1]); else merged.push(x.slice()); });
    return merged;
  }
  /* the text a span is replaced with, exactly n characters */
  function fill(n, label) {
    var m = marker(label);
    if (m.length <= n) return m + new Array(n - m.length + 1).join(' ');
    return new Array(n + 1).join('•');
  }

  /* a plain string (a command line, a link target): secrets become their marker; the length may change */
  function text(s) {
    if (!s || typeof s !== 'string') return { text: s, count: 0 };
    var sp = spans(s), count = sp.length;
    for (var i = sp.length - 1; i >= 0; i--) s = s.slice(0, sp[i][0]) + marker(sp[i][2]) + s.slice(sp[i][1]);
    if (KEY_BEGIN.test(s)) {
      var b = s.search(KEY_BEGIN), bm = s.match(KEY_BEGIN)[0], rest = s.slice(b + bm.length), e = rest.search(KEY_END);
      s = s.slice(0, b + bm.length) + (e >= 0 ? marker('private key') + rest.slice(e)
        : rest.replace(/[A-Za-z0-9+\/=]{16,}/g, function () { return marker('private key'); }));
      count++;
    }
    return { text: s, count: count };
  }

  /* Saved line packs (38-saved.js packLine: n used cells, c code points, f flags, g graphemes, w soft-wrapped into the
     next). Returns { packs, count, masked }, masked: row -> the columns rewritten (38-saved.js draws them dim): the packs that changed are copies, so the live lines' cached packs stay as they
     are. A logical line (a run of soft-wrapped rows) is searched as one string, so a token that wrapped is found. */
  function packs(list) {
    var out = list.slice(), count = 0, inKey = false, keyMarked = false, masked = new Map();
    function cellChar(cp) { return cp === 0 ? ' ' : cp > 0xffff ? '\u0001' : String.fromCharCode(cp); }
    function edit(i) {
      var pk = out[i];
      if (pk === list[i]) out[i] = pk = Object.assign({}, pk, { c: pk.c.slice(), f: pk.f ? pk.f.slice() : null, g: pk.g ? pk.g.slice() : null });
      return pk;
    }
    function setCell(i, x, ch) {
      var pk = edit(i);
      (masked.get(i) || masked.set(i, []).get(i)).push(x);
      pk.c[x] = ch;
      if (pk.f) pk.f[x] = 0;
      if (pk.g) for (var k = pk.g.length - 2; k >= 0; k -= 2) if (pk.g[k] === x) pk.g.splice(k, 2);
    }
    var i = 0;
    while (i < list.length) {
      /* one logical line: rows i..j, joined while a row soft-wraps into the next */
      var j = i; while (j < list.length - 1 && list[j].w) j++;
      var s = '', map = [];
      for (var r = i; r <= j; r++) for (var x = 0; x < list[r].n; x++) { s += cellChar(list[r].c[x]); map.push([r, x]); }
      /* a key body is base64 rows (and PEM header rows, blanks) up to its END line; anything else ends it unmasked, so a
         cut-off block (head -3 id_rsa) never swallows the output after it */
      if (inKey && s.search(KEY_END) < 0 && !KEY_BODY.test(s)) inKey = false;
      if (inKey) {
        var e = s.search(KEY_END);
        var upto = e >= 0 ? e : s.length;
        if (upto > 0) {
          var t = keyMarked ? '' : marker('private key');
          for (var q = 0; q < upto; q++) setCell(map[q][0], map[q][1], q < t.length ? t.charCodeAt(q) : 0);
          keyMarked = true;
        }
        if (e >= 0) inKey = false;
      } else {
        var sp = spans(s);
        sp.forEach(function (z) {
          var f = fill(z[1] - z[0], z[2]);
          for (var q = z[0]; q < z[1]; q++) { var ch = f.charCodeAt(q - z[0]); setCell(map[q][0], map[q][1], ch === 0x20 ? 0x20 : ch === 0x2022 ? DOT : ch); }
        });
        count += sp.length;
        var bm = s.match(KEY_BEGIN);
        if (bm) {
          var from = s.indexOf(bm[0]) + bm[0].length, tail = s.slice(from), e2 = tail.search(KEY_END);
          if (e2 !== 0) {
            var t2 = marker('private key'), to = e2 >= 0 ? from + e2 : s.length;
            for (var q2 = from; q2 < to; q2++) setCell(map[q2][0], map[q2][1], q2 - from < t2.length ? t2.charCodeAt(q2 - from) : 0);
            count++;
            keyMarked = to > from;
            inKey = e2 < 0;
          }
        }
      }
      i = j + 1;
    }
    return { packs: out, count: count, masked: masked };
  }

  T.Scrub = { text: text, packs: packs, spans: spans, marker: marker };
})();
