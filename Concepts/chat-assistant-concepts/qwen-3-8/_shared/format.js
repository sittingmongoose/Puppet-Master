window.PMFmt = (() => {
  const p2 = n => String(n).padStart(2, "0");

  function dur(seconds) {
    if (seconds == null || isNaN(seconds)) return "0s";
    const s = Math.max(0, Math.round(seconds));
    if (s < 60) return s + "s";
    const m = Math.floor(s / 60);
    if (m < 60) return s % 60 ? m + "m " + (s % 60) + "s" : m + "m";
    const h = Math.floor(m / 60);
    return m % 60 ? h + "h " + (m % 60) + "m" : h + "h";
  }

  function clock(iso) {
    const d = new Date(iso);
    return p2(d.getHours()) + ":" + p2(d.getMinutes());
  }

  function clockFull(iso) {
    const d = new Date(iso);
    return p2(d.getHours()) + ":" + p2(d.getMinutes()) + ":" + p2(d.getSeconds());
  }

  function dayLabel(iso) {
    const d = new Date(iso);
    const today = new Date();
    const yest = new Date(today.getTime() - 86400000);
    const same = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
    if (same(d, today)) return "Today";
    if (same(d, yest)) return "Yesterday";
    return d.toLocaleDateString(undefined, { month: "long", day: "numeric", year: d.getFullYear() === today.getFullYear() ? undefined : "numeric" });
  }

  function dayKey(iso) {
    return iso.slice(0, 10);
  }

  function ago(iso) {
    const ms = Date.now() - new Date(iso).getTime();
    const m = Math.floor(ms / 60000);
    if (m < 1) return "just now";
    if (m < 60) return m + "m ago";
    const h = Math.floor(m / 60);
    if (h < 24) return h + "h ago";
    const dd = Math.floor(h / 24);
    if (dd < 14) return dd + "d ago";
    return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }

  function fullStamp(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" }) + " · " + clockFull(iso);
  }

  function tokens(n) {
    if (n == null) return "—";
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
    return String(n);
  }

  function cost(n) {
    if (n == null) return "—";
    return "$" + n.toFixed(2);
  }

  function context(used, limit) {
    if (used == null || !limit) return "—";
    return tokens(used) + " / " + tokens(limit);
  }

  function workedLabel(running, seconds) {
    return (running ? "Working for " : "Worked for ") + dur(seconds);
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function bodyHtml(body) {
    return esc(body).split(/\n{2,}/).map(p => "<p>" + p.replace(/\n/g, "<br>") + "</p>").join("");
  }

  return { dur, clock, clockFull, dayLabel, dayKey, ago, fullStamp, tokens, cost, context, workedLabel, esc, bodyHtml };
})();
