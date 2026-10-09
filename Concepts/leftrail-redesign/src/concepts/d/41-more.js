/* The activity bar's More tray (lane F): the icons hidden from the bar open as the chat-style PMR.menu beside the More
   button. The shell still owns the tray and every behaviour of it (F3-419): its own click handler builds .pm-ab-tray
   (kept out of sight under D, 81-more.src.css), the menu is drawn from that tray's rows, a pick clicks the shell's own
   row (restore at the end of the bar), and pressing a row and dragging hands the gesture to the shell's row, so a row
   dragged back onto the bar is restored where it is dropped. With nothing hidden, the menu says how to hide an icon.
   Called from mountBar (40-bar.js); destroy() removes every listener and the hidden tray. */

const LF_MORE_ICON = { chat: 'chat', dashboard: 'layers', files: 'files', search: 'search', source: 'source', repository_automation: 'actions', docker: 'docker', testing: 'tests', run: 'play', agents: 'agents', artifacts: 'artifacts' };
/* the shell labels a tray row by the icon's title and falls back to its raw id; these icons have no title */
const LF_MORE_NAME = { source: 'Source Control', repository_automation: 'Actions & Pipelines', run: 'Debug & Run', dashboard: 'Home', chat: 'Chat' };

function lfMountMore() {
  const btn = document.getElementById('abMoreBtn');
  if (!btn) return { destroy() {} };
  const offs = [];
  const hadExpanded = btn.hasAttribute('aria-expanded'), hadPopup = btn.hasAttribute('aria-haspopup');
  if (!hadPopup) btn.setAttribute('aria-haspopup', 'menu');
  const on = (t, type, fn, opts) => { t.addEventListener(type, fn, opts); offs.push(() => t.removeEventListener(type, fn, opts)); };
  const tray = () => document.querySelector('body > .pm-ab-tray');
  const dropTray = () => document.querySelectorAll('body > .pm-ab-tray').forEach(t => t.remove());
  const rowFor = id => { const t = tray(); return t ? Array.from(t.querySelectorAll('.pm-ab-tray-row')).find(r => r.getAttribute('data-ab-id') === id) : null; };

  function rowsOf(t) {
    return Array.from(t.querySelectorAll('.pm-ab-tray-row')).map(r => {
      const id = r.getAttribute('data-ab-id') || '', text = r.textContent.trim();
      return { id, label: (!text || text === id) ? (LF_MORE_NAME[id] || id) : text, svg: r.querySelector('svg') };
    });
  }

  /* press a row and move: the shell's own row takes the gesture (its drag engine listens on window) */
  function armDrag(ev) {
    const b = ev.target && ev.target.closest && ev.target.closest('.pmr-mi');
    if (!b || ev.button !== 0 || !b._pmrItem || !b._pmrItem._id) return;
    const id = b._pmrItem._id, s = { x: ev.clientX, y: ev.clientY, pid: ev.pointerId, type: ev.pointerType || 'mouse' };
    const stop = () => {
      window.removeEventListener('pointermove', move, true);
      window.removeEventListener('pointerup', stop, true);
      window.removeEventListener('pointercancel', stop, true);
    };
    function move(e) {
      if (e.pointerId !== s.pid || (Math.abs(e.clientX - s.x) < 5 && Math.abs(e.clientY - s.y) < 5)) return;
      stop();
      const row = rowFor(id);
      if (!row) return;
      PMR.menu.closeAll();
      const base = { bubbles: true, cancelable: true, composed: true, pointerId: s.pid, pointerType: s.type, isPrimary: true, buttons: 1 };
      row.dispatchEvent(new PointerEvent('pointerdown', Object.assign({}, base, { button: 0, clientX: s.x, clientY: s.y })));
      window.dispatchEvent(new PointerEvent('pointermove', Object.assign({}, base, { button: -1, clientX: e.clientX, clientY: e.clientY })));
    }
    window.addEventListener('pointermove', move, true);
    window.addEventListener('pointerup', stop, true);
    window.addEventListener('pointercancel', stop, true);
  }

  function open() {
    const t = tray(), list = t ? rowsOf(t) : [];
    const items = list.map(r => ({ label: r.label, icon: LF_MORE_ICON[r.id] || 'layers', _id: r.id }));
    const el = PMR.menu.open({
      id: 'd-ab-more', label: 'Hidden from the bar', emptyText: 'Nothing is hidden. Drag an icon onto More to hide it.',
      groups: [{ label: items.length ? 'Hidden from the bar' : null, items }],
    }, btn, {
      side: true, width: 236,
      onPick: it => { const r = rowFor(it._id); if (r) r.click(); },
    });
    if (!el) return;
    /* each row shows the bar's own drawing of its icon */
    el.querySelectorAll('.pmr-mi').forEach(b => {
      const src = list.find(r => r.id === (b._pmrItem && b._pmrItem._id)), slot = b.querySelector('.pmr-mi-ico');
      if (src && src.svg && slot) { slot.textContent = ''; slot.appendChild(src.svg.cloneNode(true)); }
    });
    el.addEventListener('pointerdown', armDrag);
  }

  /* before the shell (window capture): a second click closes the menu; a stale hidden tray goes, so the shell builds a
     fresh one; once the shell's handler has run, the menu is drawn from what it built */
  on(window, 'click', ev => {
    if (!D.on || !ev.target || !ev.target.closest || !ev.target.closest('#abMoreBtn')) return;
    if (PMR.menu.isOpen(btn)) {
      ev.stopPropagation(); ev.preventDefault();
      PMR.menu.closeAll();
      dropTray();
      return;
    }
    dropTray();
    setTimeout(() => { if (D.on && !PMR.menu.isOpen(btn)) open(); }, 0);
  }, true);

  return {
    destroy() {
      offs.forEach(off => off());
      if (PMR.menu.isOpen(btn)) PMR.menu.closeAll();
      dropTray();
      /* PMR.menu marks its anchor; the shell's button goes back exactly as it was */
      btn.classList.remove('is-menu-open');
      if (!hadExpanded) btn.removeAttribute('aria-expanded');
      if (!hadPopup) btn.removeAttribute('aria-haspopup');
    },
  };
}
