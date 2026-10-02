/* The concept switcher: one status-bar item ("Rail  A · Ledger") opening a chat-style menu of the concepts and today's
   rail. Review-copy chrome only, never part of the product. Alt+Shift+1..4 switch directly; ?rail=a|b|c|current
   picks the first concept on load; the last choice is remembered per viewer. */

function switcherMenu() {
  const cur = PMR.concepts.current();
  return {
    id: 'pmr-concepts', label: 'Rail concept', value: cur,
    groups: [{
      label: 'Left rail concepts',
      items: PMR.concepts.list().map(c => ({
        value: c.id, label: (c.id === 'current' ? '' : c.id.toUpperCase() + ' · ') + c.label,
        meta: c.blurb,
      })),
    }],
  };
}
function switcherText(id) {
  const c = PMR.concepts.list().find(x => x.id === id);
  if (!c) return 'Current';
  return c.id === 'current' ? 'Current rail' : c.id.toUpperCase() + ' · ' + c.label;
}

function installSwitcher() {
  const bar = document.getElementById('pm7GlobalStatusBar');
  if (!bar) return false;
  if (bar.querySelector('.pmr-switch')) return true;
  const strong = PMR.h('strong.pmr-switch-name', { text: switcherText(PMR.concepts.current()) });
  const btn = PMR.h('button', { type: 'button', class: 'pm7-statusitem pmr-switch', 'aria-haspopup': 'menu', 'aria-expanded': 'false' },
    PMR.icon('layers', 'pmr-switch-ico'), PMR.h('span.pmr-switch-k', { text: 'Rail' }), strong, PMR.icon('chevD', 'pmr-switch-chev'));
  PMR.hover(btn, 'Left rail concept', 'Review copy only. Switches between the three rail concepts and the current rail (Alt+Shift+1 to 4).');
  btn.addEventListener('click', ev => {
    ev.preventDefault();
    PMR.menu.toggle(switcherMenu(), btn, { width: 300, onPick: it => PMR.concepts.set(it.value) });
  });
  const group = PMR.h('div.pm7-statusbar-group.pmr-switch-group', btn);
  bar.insertBefore(group, bar.firstChild);
  document.addEventListener('pmr:concept', ev => { strong.textContent = switcherText(ev.detail.id); });
  return true;
}

function initialConcept() {
  let id = null;
  try { const q = new URLSearchParams(window.location.search).get('rail'); if (q) id = q.toLowerCase(); } catch (e) { /* ignore */ }
  if (!id) { try { id = localStorage.getItem('pmr.concept'); } catch (e) { id = null; } }
  return id || 'a';
}

document.addEventListener('keydown', ev => {
  if (!ev.altKey || !ev.shiftKey || ev.ctrlKey || ev.metaKey) return;
  const n = { Digit1: 0, Digit2: 1, Digit3: 2, Digit4: 3 }[ev.code];
  if (n == null) return;
  const list = PMR.concepts.list();
  if (!list[n]) return;
  ev.preventDefault();
  PMR.concepts.set(list[n].id);
});

PMR.switcher = { install: installSwitcher, initial: initialConcept };
