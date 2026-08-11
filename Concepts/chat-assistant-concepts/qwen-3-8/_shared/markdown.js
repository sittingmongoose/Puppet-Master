window.PMChatMarkdown = (() => {
  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function inline(s) {
    var codes = [];
    s = s.replace(/`([^`]+)`/g, function (m, c) { codes.push(c); return "@@" + codes.length + "@@"; });
    s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    s = s.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
    s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a class="pmq-md-link" href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    s = s.replace(/@@(\d+)@@/g, function (m, n) { return "<code>" + codes[+n - 1] + "</code>"; });
    return s;
  }

  function plain(body) {
    var t = String(body == null ? "" : body);
    t = t.replace(/```[\s\S]*?```/g, " ");
    t = t.replace(/^\s*>/gm, "");
    t = t.replace(/^\s*#{1,6}\s+/gm, "");
    t = t.replace(/^\s*([-*]|\d+[.)])\s+/gm, "");
    t = t.replace(/`([^`]+)`/g, "$1");
    t = t.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");
    t = t.replace(/\*\*([^*]+)\*\*/g, "$1");
    t = t.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1$2");
    t = t.replace(/\s+/g, " ").trim();
    return t;
  }

  function plainPreview(body, n) {
    n = n || 280;
    var p = plain(body);
    var cut = p.length > n ? p.slice(0, n).replace(/\s+$/, "") + "…" : p;
    return "<p>" + esc(cut) + "</p>";
  }

  function isSep(s) { return /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)+\|?\s*$/.test(s); }
  function splitRow(s) { var x = s.trim(); if (x.charAt(0) === "|") x = x.slice(1); if (x.charAt(x.length - 1) === "|") x = x.slice(0, -1); return x.split("|").map(function (c) { return c.trim(); }); }
  function alignsOf(sepLine) {
    return splitRow(sepLine).map(function (c) {
      var l = /^:/.test(c), r = /:$/.test(c);
      return l && r ? "center" : r ? "right" : "left";
    });
  }
  function indentOf(s) { var m = s.match(/^(\s*)/); return m[1].replace(/\t/g, "  ").length; }

  function renderList(lines, i) {
    var out = "";
    var stack = [];
    var base = indentOf(lines[i]);
    function openAt(ind, ordered) { out += ordered ? '<ol class="pmq-md-list">' : '<ul class="pmq-md-list">'; stack.push({ ind: ind, ordered: ordered }); }
    function closeOne() { var s = stack.pop(); out += s.ordered ? "</ol>" : "</ul>"; }
    while (i < lines.length) {
      var m = lines[i].match(/^(\s*)([-*]|\d+[.)])\s+(.*)$/);
      if (!m) break;
      var ind = m[1].replace(/\t/g, "  ").length;
      if (ind < base) break;
      var ordered = /\d/.test(m[2]);
      if (!stack.length) openAt(ind, ordered);
      else if (ind > stack[stack.length - 1].ind) openAt(ind, ordered);
      else { while (stack.length && stack[stack.length - 1].ind > ind) closeOne(); if (!stack.length) openAt(ind, ordered); }
      out += "<li>" + inline(esc(m[3])) + "</li>";
      i++;
    }
    while (stack.length) closeOne();
    return { html: out, next: i };
  }

  function render(src) {
    var lines = String(src == null ? "" : src).split(/\n/);
    var out = "";
    var i = 0;
    var para = [];
    function flushPara() { if (!para.length) return ""; var j = para.join("\n").trim(); para = []; if (!j) return ""; return "<p>" + inline(esc(j)).replace(/\n/g, "<br>") + "</p>"; }
    while (i < lines.length) {
      var line = lines[i];
      var fence = line.match(/^\s*```(\w*)\s*$/);
      if (fence) {
        out += flushPara();
        var lang = (fence[1] || "").toLowerCase();
        var code = [];
        i++;
        while (i < lines.length && !/^\s*```\s*$/.test(lines[i])) { code.push(lines[i]); i++; }
        i++;
        if (lang === "mermaid") {
          out += '<div class="pmq-md-diagram"><span class="pmq-md-diagram-title"><i data-ico="graph"></i>Diagram</span>' +
            '<span class="pmq-md-diagram-sub">Visual module rendered via sandboxed host bridge</span>' +
            '<pre class="pmq-md-diagram-src">' + esc(code.join("\n")) + "</pre></div>";
        } else {
          out += '<pre class="pmq-md-code"><code>' + esc(code.join("\n")) + "</code></pre>";
        }
        continue;
      }
      var h = line.match(/^(#{1,6})\s+(.*)$/);
      if (h) { out += flushPara(); var lvl = Math.min(h[1].length + 2, 6); out += "<h" + lvl + ' class="pmq-md-h">' + inline(esc(h[2])) + "</h" + lvl + ">"; i++; continue; }
      if (/^\s*$/.test(line)) { out += flushPara(); i++; continue; }
      if (/^(\s*)([-*]|\d+[.)])\s+/.test(line)) { out += flushPara(); var lr = renderList(lines, i); out += lr.html; i = lr.next; continue; }
      if (/^\s*>/.test(line)) {
        out += flushPara();
        var q = [];
        while (i < lines.length && /^\s*>/.test(lines[i])) { q.push(lines[i].replace(/^\s*>\s?/, "")); i++; }
        out += '<blockquote class="pmq-md-quote">' + inline(esc(q.join("\n"))).replace(/\n/g, "<br>") + "</blockquote>";
        continue;
      }
      if (line.indexOf("|") >= 0 && i + 1 < lines.length && isSep(lines[i + 1])) {
        out += flushPara();
        var hdr = splitRow(line);
        var aligns = alignsOf(lines[i + 1]);
        i += 2;
        var rows = [];
        while (i < lines.length && lines[i].indexOf("|") >= 0 && !/^\s*$/.test(lines[i])) { rows.push(splitRow(lines[i])); i++; }
        function mdCell(tag, c, ci) {
          var al = aligns[ci] && aligns[ci] !== "left" ? ' style="text-align:' + aligns[ci] + '"' : "";
          return "<" + tag + al + ">" + inline(esc(c)) + "</" + tag + ">";
        }
        out += '<div class="pmq-md-tablewrap"><table class="pmq-md-table"><thead><tr>' + hdr.map(function (c, ci) { return mdCell("th", c, ci); }).join("") + "</tr></thead><tbody>" +
          rows.map(function (r) { return "<tr>" + r.map(function (c, ci) { return mdCell("td", c, ci); }).join("") + "</tr>"; }).join("") + "</tbody></table></div>";
        continue;
      }
      para.push(line);
      i++;
    }
    out += flushPara();
    return out || "<p></p>";
  }

  return { render: render, plainPreview: plainPreview, plain: plain, inline: inline, esc: esc };
})();
