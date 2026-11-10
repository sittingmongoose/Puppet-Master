#!/usr/bin/env python3
"""Make one pilot fixture page from a PMConcept7 build.

usage: make_fixture.py <base.html> <out.html> <variant>     variant: 0 (no defect) or 1..4 (one seeded defect)

Every fixture gets the same additions: a build stamp in <head>, and `data-ui-element-id` on the Activity bar items and
on the file rows and their row buttons (the row's path is the item key). Variants 1 to 4 add one defect each.
A sidecar <out>.json records the application build identity. Nothing in the page or the sidecar names the variant.
"""
import hashlib, json, sys

IDS = r"""
(() => {
  const rowAction = { 'cmd.file.copy_path': 'copy_path', 'cmd.chat.add_file_reference': 'add_to_chat', 'cmd.terminal.show': 'open_terminal' };
  const tag = () => {
    for (const el of document.querySelectorAll('.activity-bar .icon[data-ab-id]')) if (!el.dataset.uiElementId) el.dataset.uiElementId = 'activity.' + el.dataset.abId;
    const tg = document.getElementById('activityBarToggle'); if (tg && !tg.dataset.uiElementId) tg.dataset.uiElementId = 'activity.toggle';
    for (const row of document.querySelectorAll('#fmTree .fm-row[data-path]')) {
      if (!row.dataset.uiElementId) row.dataset.uiElementId = 'files.row#' + row.dataset.path;
      for (const b of row.querySelectorAll('.fm-quick button')) if (!b.dataset.uiElementId) b.dataset.uiElementId = 'files.row.' + (rowAction[b.dataset.demoAction] || 'action') + '#' + row.dataset.path;
    }
    if (window.__pmAfterTag) window.__pmAfterTag();
  };
  let due = 0; const later = () => { if (!due) due = setTimeout(() => { due = 0; tag(); }, 120); };
  new MutationObserver(later).observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener('DOMContentLoaded', tag); tag();
})();
"""

DEFECTS = {
 0: "",
 # 1: a click on one Activity bar item never reaches the page
 1: r"""window.addEventListener('click', (e) => { const el = e.target && e.target.closest && e.target.closest('.activity-bar [data-ab-id="docker"]'); if (el) { e.stopImmediatePropagation(); e.preventDefault(); } }, true);""",
 # 2: one item keeps saying it is expanded after its panel closes
 2: r"""(() => { const arm = () => { const el = document.querySelector('.activity-bar [data-ab-id="source"]'); if (!el || el.__s) return; el.__s = 1; let seen = false;
   new MutationObserver(() => { const v = el.getAttribute('aria-expanded'); if (v === 'true') seen = true; else if (seen && v !== 'true') el.setAttribute('aria-expanded', 'true'); }).observe(el, { attributes: true, attributeFilter: ['aria-expanded'] }); };
   window.__pmAfterTag = arm; })();""",
 # 3: Enter on one focused item does nothing
 3: r"""window.addEventListener('keydown', (e) => { if (e.key !== 'Enter') return; const el = document.activeElement && document.activeElement.closest && document.activeElement.closest('.activity-bar [data-ab-id="testing"]'); if (el) { e.stopImmediatePropagation(); e.preventDefault(); } }, true);
window.addEventListener('keyup', (e) => { if (e.key !== 'Enter') return; const el = document.activeElement && document.activeElement.closest && document.activeElement.closest('.activity-bar [data-ab-id="testing"]'); if (el) { e.stopImmediatePropagation(); e.preventDefault(); } }, true);""",
 # 4: one row's copy button names the row above it
 4: r"""window.__pmAfterTag = () => { const row = document.querySelector('#fmTree .fm-row[data-path="Dockerfile"]'); const b = row && row.querySelector('.fm-quick button[data-demo-action="cmd.file.copy_path"]'); if (b && !/docker-compose/.test(b.dataset.demoArg || '')) b.dataset.demoArg = 'cmd.file.copy_path -> docker-compose.yml (relative)'; };""",
}

def main():
    base, out, variant = sys.argv[1], sys.argv[2], int(sys.argv[3])
    html = open(base, "rb").read()
    base_sha = hashlib.sha256(html).hexdigest()
    block = ("<script>" + DEFECTS[variant] + IDS + "</script>").encode()
    build_id = hashlib.sha256(base_sha.encode() + b"\n" + block).hexdigest()
    head = html.find(b"<head>")
    body_end = html.rfind(b"</body>")
    assert head >= 0 and body_end >= 0
    stamp = b'<head><meta name="pm-build-id" content="' + build_id.encode() + b'">'
    html = html[:head] + stamp + html[head + 6:body_end] + block + html[body_end:]
    open(out, "wb").write(html)
    side = {"app_build_id": build_id, "base_page_sha256": base_sha, "page_file_sha256": hashlib.sha256(html).hexdigest(), "bytes": len(html)}
    json.dump(side, open(out[:-5] + ".json", "w"), indent=1)
    print(json.dumps(side))

if __name__ == "__main__":
    main()
