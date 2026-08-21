(() => {
  'use strict';

  const D = window.PM56_DATA;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
  const escapeHTML = (value = '') => String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const uid = (prefix = 'id') => `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

  const ICONS = {
    activity:'<path d="M4 12h3l2-6 4 12 2-6h5"/>',
    agent:'<rect x="5" y="7" width="14" height="12" rx="4"/><path d="M9 3h6M12 3v4M8.5 12h.01M15.5 12h.01M9 16h6"/>',
    archive:'<path d="M4 7h16v13H4zM3 4h18v3H3zM9 11h6"/>',
    architecture:'<rect x="3" y="3" width="6" height="5" rx="1"/><rect x="15" y="3" width="6" height="5" rx="1"/><rect x="9" y="16" width="6" height="5" rx="1"/><path d="M6 8v4h12V8M12 12v4"/>',
    artifact:'<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v5h5M10 13h5M10 17h5"/>',
    book:'<path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H12v18H7.5A3.5 3.5 0 0 0 4 23zM20 5.5A3.5 3.5 0 0 0 16.5 2H12v18h4.5A3.5 3.5 0 0 1 20 23z"/>',
    bolt:'<path d="m13 2-8 12h7l-1 8 8-12h-7z"/>',
    branch:'<circle cx="6" cy="5" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="6" cy="19" r="2"/><path d="M6 7v10M8 8c4 0 5-2 8-2"/>',
    browser:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 8h18M7 6h.01M10 6h.01"/>',
    bug:'<path d="M8 9h8v9a4 4 0 0 1-8 0zM9 9V7a3 3 0 0 1 6 0v2M4 13h4M16 13h4M5 18h3M16 18h3M6 7l2 2M18 7l-2 2"/>',
    camera:'<path d="M4 7h4l2-2h4l2 2h4v12H4z"/><circle cx="12" cy="13" r="4"/>',
    chart:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    chat:'<path d="M4 4h16v13H8l-4 4z"/><path d="M8 9h8M8 13h5"/>',
    check:'<path d="m5 12 4 4L19 6"/>',
    checklist:'<path d="m4 6 1.5 1.5L8 5M11 6h9M4 12l1.5 1.5L8 11M11 12h9M4 18l1.5 1.5L8 17M11 18h9"/>',
    chevron:'<path d="m9 6 6 6-6 6"/>',
    close:'<path d="M6 6l12 12M18 6 6 18"/>',
    code:'<path d="m8 9-4 3 4 3M16 9l4 3-4 3M14 5l-4 14"/>',
    copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V4H4v12h4"/>',
    diagram:'<rect x="3" y="4" width="6" height="5" rx="1"/><rect x="15" y="4" width="6" height="5" rx="1"/><rect x="9" y="16" width="6" height="5" rx="1"/><path d="M6 9v3h12V9M12 12v4"/>',
    diff:'<path d="M7 3v18M4 6h6M4 17h6M15 6h6M18 3v6M15 17h6"/>',
    down:'<path d="m6 9 6 6 6-6"/>',
    edit:'<path d="m4 20 4.5-1 10-10-3.5-3.5-10 10zM13.5 7l3.5 3.5"/>',
    eye:'<path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z"/><circle cx="12" cy="12" r="2.5"/>',
    files:'<path d="M5 3h6l2 2h6v15H5z"/><path d="M8 9h8M8 13h8M8 17h5"/>',
    flow:'<rect x="3" y="3" width="6" height="5" rx="1"/><rect x="15" y="3" width="6" height="5" rx="1"/><rect x="9" y="16" width="6" height="5" rx="1"/><path d="M9 5.5h6M12 8v8"/>',
    fork:'<circle cx="7" cy="5" r="2"/><circle cx="17" cy="5" r="2"/><circle cx="12" cy="19" r="2"/><path d="M7 7v3c0 2 2 3 5 3s5-1 5-3V7M12 13v4"/>',
    globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    hand:'<path d="M7 12V6a2 2 0 0 1 4 0v4-6a2 2 0 0 1 4 0v6-4a2 2 0 0 1 4 0v8c0 5-3 7-7 7h-1c-3 0-4-2-6-5l-2-3a2 2 0 0 1 3-2z"/>',
    image:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m4 18 5-5 3 3 3-3 5 5"/>',
    layers:'<path d="m12 3 9 5-9 5-9-5zM3 12l9 5 9-5M3 16l9 5 9-5"/>',
    lens:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5M10.5 7.5v6M7.5 10.5h6"/>',
    lightbulb:'<path d="M9 18h6M10 22h4M8 15a7 7 0 1 1 8 0c-1 .7-1 1.4-1 3H9c0-1.6 0-2.3-1-3z"/>',
    link:'<path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.5 1.5M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.5-1.5"/>',
    lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
    minus:'<path d="M5 12h14"/>',
    model:'<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9zM4 7.5l8 4.5 8-4.5M12 12v9"/>',
    monitor:'<rect x="3" y="4" width="18" height="14" rx="2"/><path d="M8 22h8M12 18v4"/>',
    more:'<circle cx="5" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none"/>',
    palette:'<path d="M12 3a9 9 0 0 0 0 18h1.5a2 2 0 0 0 0-4H12a2 2 0 0 1 0-4h3a6 6 0 0 0 0-12z"/><circle cx="7" cy="10" r="1" fill="currentColor"/><circle cx="9" cy="6" r="1" fill="currentColor"/><circle cx="14" cy="6" r="1" fill="currentColor"/>',
    paperclip:'<path d="m8 12 6-6a3 3 0 0 1 4 4l-8 8a5 5 0 0 1-7-7l8-8"/>',
    person:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    pin:'<path d="m9 3 6 6-2 2 4 4-2 2-4-4-2 2-6-6 2-2 2 2 4-4zM8 16l-4 4"/>',
    plan:'<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v5h5M9 12h7M9 16h7"/>',
    plug:'<path d="M8 3v5M16 3v5M6 8h12v3a6 6 0 0 1-6 6v4M8 21h8"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    quiz:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-1 .5-1 1.2-1 2.2M12 17h.01"/>',
    redo:'<path d="M18 8V4l4 4-4 4V8h-6a7 7 0 1 0 7 7"/>',
    rename:'<path d="M4 20h4l11-11-4-4L4 16zM13 7l4 4"/>',
    restore:'<path d="M4 8V3M4 3h5M4.5 7a9 9 0 1 1-1 8"/>',
    search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/>',
    send:'<path d="m3 11 18-8-8 18-2-8zM11 13l10-10"/>',
    settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9A1.7 1.7 0 0 0 21 10h.2v4H21a1.7 1.7 0 0 0-1.6 1z"/>',
    shield:'<path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6z"/><path d="m9 12 2 2 4-4"/>',
    sidebar:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/>',
    sliders:'<path d="M4 6h10M18 6h2M4 12h3M11 12h9M4 18h8M16 18h4"/><circle cx="16" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="14" cy="18" r="2"/>',
    sparkles:'<path d="m12 3 1.3 3.7L17 8l-3.7 1.3L12 13l-1.3-3.7L7 8l3.7-1.3zM18 14l.8 2.2L21 17l-2.2.8L18 20l-.8-2.2L15 17l2.2-.8zM5 14l.7 1.8L7.5 16.5l-1.8.7L5 19l-.7-1.8-1.8-.7 1.8-.7z"/>',
    split:'<path d="M4 4h16v16H4zM12 4v16"/>',
    star:'<path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
    steering:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2"/><path d="M12 10V3M10 12H3M14 12h7M12 14v7"/>',
    table:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M8 9v11M15 9v11"/>',
    target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1" fill="currentColor"/>',
    terminal:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="m7 9 3 3-3 3M13 15h4"/>',
    text:'<path d="M5 5h14M12 5v14M8 19h8"/>',
    thought:'<path d="M9 18h6M10 22h4M7 15a7 7 0 1 1 10 0c-1.3.8-1.8 1.8-2 3H9c-.2-1.2-.7-2.2-2-3z"/><path d="M9 11h6"/>',
    trash:'<path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14M10 11v6M14 11v6"/>',
    undo:'<path d="M9 7H4V2M4.5 6.5A9 9 0 1 1 3 15"/>',
    unlock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 7-2.5"/>',
    unpin:'<path d="m9 3 6 6-2 2 4 4-2 2-4-4-2 2-6-6 2-2 2 2 4-4zM4 4l16 16M8 16l-4 4"/>',
    users:'<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20a6 6 0 0 1 12 0M14 15a5 5 0 0 1 7 5"/>',
    wand:'<path d="m4 20 11-11 3 3L7 23zM13 4l1-2 1 2 2 1-2 1-1 2-1-2-2-1zM19 7l.7-1.5L21 5l-1.3-.5L19 3l-.7 1.5L17 5l1.3.5z"/>',
    warning:'<path d="M12 3 2.8 20h18.4z"/><path d="M12 9v5M12 17h.01"/>
  };

  function icon(name, className = 'icon') {
    const body = ICONS[name] || ICONS.sparkles;
    return `<svg class="${className}" viewBox="0 0 24 24" aria-hidden="true">${body}</svg>`;
  }

  function hydrateIcons(root = document) {
    $$('[data-icon]', root).forEach(el => {
      const name = el.dataset.icon;
      el.innerHTML = icon(name);
      el.removeAttribute('data-icon');
    });
  }

  const defaultFamily = Object.fromEntries(D.families.map(f => [f.id, 1]));
  const state = {
    theme: localStorage.getItem('pm56-theme') || 'puppet-dark',
    recipe: 'refined',
    family: {...defaultFamily},
    activeThread: 'query-performance',
    historyVisible: true,
    historyPinned: true,
    archivedExpanded: false,
    historyFilter: '',
    activityDomain: null,
    activityPinned: false,
    activityBlockedDemo: false,
    persona: 'product',
    model: 'sonnet-46',
    mode: 'agent',
    thoroughness: {plan:'Standard','deep-plan':'Thorough'},
    permissions: 'auto',
    worktree: 'main',
    providerScope: 'favorites',
    providerFilter: 'all',
    capabilities: {goal:'on',crew:'auto',bsd:'auto',lens:'focus',eli5:'off',thought:'auto'},
    subcompactPending: false,
    workingState: 'subagents',
    workingExpanded: true,
    messageExpansions: new Set(),
    editorTabs: [],
    activeEditorTab: null,
    questionPage: 0,
    questionAnswers: {},
    questionQueue: ['planning-foundations','runtime-constraints'],
    questionSubmitted: false,
    planRevisionText: '',
    searchScope: 'all',
    searchQuery: '',
    draftByThread: {},
    selectedDemoCategory: D.demos[0].category,
    toastCounter: 0,
    messageCounter: 0,
    assistantWidth: Number(localStorage.getItem('pm56-assistant-width')) || null,
    historyWidth: Number(localStorage.getItem('pm56-history-width')) || 218,
    activityWidth: Number(localStorage.getItem('pm56-activity-width')) || 286,
    threads: D.threads.map(t => ({...t})),
    models: D.models.map(m => ({...m})),
    transcriptAppend: []
  };

  const refs = {};
  function cacheRefs() {
    ['app','assistant-body','thread-history','history-scroll','history-filter','archived-count','chat-scroll','transcript','chat-activity-bar','chat-activity-zone','activity-detail-dock','activity-detail-content','activity-detail-title','activity-detail-subtitle','activity-detail-icon','composer-input','composer-shell','active-capabilities','persona-label','model-label','mode-label','worktree-label','permissions-label','fast-indicator','status-worktree','status-message','active-thread-title','active-thread-status','active-thread-meta','editor-tabs','editor-breadcrumbs','editor-canvas','overlay-root','toast-root','jump-latest'].forEach(id => {
      refs[id.replace(/-([a-z])/g,(_,c)=>c.toUpperCase())] = document.getElementById(id);
    });
  }

  class OverlayManager {
    constructor(root) {
      this.root = root;
      this.overlays = new Map();
      this.sidecarTimer = null;
      this.boundReposition = () => this.scheduleReposition();
      this.raf = 0;
      document.addEventListener('pointerdown', event => this.handleOutside(event), true);
      window.addEventListener('resize', this.boundReposition, {passive:true});
      document.addEventListener('scroll', this.boundReposition, true);
      document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
          if ($('.modal-layer', this.root)) closeModal();
          else if ($('.context-drawer', this.root)) closeContextDrawer();
          else this.closeAll();
        }
      });
    }

    open({id = uid('popover'), anchor, html = '', node = null, placement = 'top-start', className = '', parentId = null, rootId = null, offset = 7, onClose = null, closeOthers = true}) {
      if (!anchor || !anchor.isConnected) return null;
      const existing = this.overlays.get(id);
      if (existing) this.close(id, true);
      if (closeOthers) {
        const keepRoot = rootId || id;
        [...this.overlays.entries()].forEach(([key, record]) => {
          if (record.rootId !== keepRoot && key !== parentId) this.close(key, true);
        });
      }
      const el = document.createElement('div');
      el.className = `pm-popover ${className}`.trim();
      el.dataset.overlayId = id;
      el.dataset.placement = placement;
      el.setAttribute('role','dialog');
      const content = document.createElement('div');
      content.className = 'popover-content';
      if (node) content.append(node);
      else content.innerHTML = html;
      el.append(content);
      el.style.visibility = 'hidden';
      this.root.append(el);
      hydrateIcons(el);
      const record = {id, el, anchor, placement, parentId, rootId:rootId || (parentId ? this.overlays.get(parentId)?.rootId || parentId : id), offset, onClose};
      this.overlays.set(id, record);
      if (parentId) {
        const parent = this.overlays.get(parentId);
        if (parent) parent.childId = id;
      }
      this.position(record);
      el.style.visibility = '';
      anchor.setAttribute('aria-expanded','true');
      el.addEventListener('pointerenter', () => clearTimeout(this.sidecarTimer));
      return el;
    }

    openSidecar({parentId, anchor, html = '', node = null, placement = 'right-start', className = '', offset = 5}) {
      const parent = this.overlays.get(parentId);
      if (!parent) return null;
      if (parent.childId) this.close(parent.childId, true);
      const id = `${parentId}-sidecar`;
      return this.open({id, anchor, html, node, placement, className:`sidecar ${className}`, parentId, rootId:parent.rootId, offset, closeOthers:false});
    }

    scheduleSidecar(options, delay = 110) {
      clearTimeout(this.sidecarTimer);
      this.sidecarTimer = setTimeout(() => this.openSidecar(options), delay);
    }

    close(id, immediate = false) {
      const record = this.overlays.get(id);
      if (!record) return;
      if (record.childId) this.close(record.childId, true);
      if (record.parentId) {
        const parent = this.overlays.get(record.parentId);
        if (parent?.childId === id) parent.childId = null;
      }
      record.anchor?.setAttribute('aria-expanded','false');
      this.overlays.delete(id);
      if (record.onClose) {
        try { record.onClose(); } catch (_) {}
      }
      if (immediate) record.el.remove();
      else {
        record.el.classList.add('closing');
        setTimeout(() => record.el.remove(), 190);
      }
    }

    closeRoot(rootId, immediate = false) {
      [...this.overlays.entries()].filter(([,r]) => r.rootId === rootId).sort((a,b) => b[1].parentId ? 1 : -1).forEach(([id]) => this.close(id, immediate));
    }

    closeAll(immediate = false) {
      clearTimeout(this.sidecarTimer);
      [...this.overlays.keys()].forEach(id => this.close(id, immediate));
    }

    handleOutside(event) {
      if (!this.overlays.size) return;
      const path = event.composedPath();
      const withinOverlay = path.some(node => node instanceof HTMLElement && (node.classList?.contains('pm-popover') || node.closest?.('.pm-popover')));
      const withinAnchor = [...this.overlays.values()].some(record => path.includes(record.anchor));
      if (!withinOverlay && !withinAnchor) this.closeAll();
    }

    scheduleReposition() {
      cancelAnimationFrame(this.raf);
      this.raf = requestAnimationFrame(() => this.repositionAll());
    }

    repositionAll() {
      [...this.overlays.values()].forEach(record => {
        if (!record.anchor?.isConnected) this.close(record.id, true);
        else this.position(record);
      });
    }

    position(record) {
      const {el, anchor, offset} = record;
      const ar = anchor.getBoundingClientRect();
      const er = {width: el.offsetWidth, height: el.offsetHeight};
      const margin = 8;
      let [side, align = 'start'] = record.placement.split('-');
      let actual = side;
      const available = {
        top: ar.top - margin,
        bottom: window.innerHeight - ar.bottom - margin,
        left: ar.left - margin,
        right: window.innerWidth - ar.right - margin
      };
      if (side === 'top' && available.top < er.height + offset && available.bottom > available.top) actual = 'bottom';
      if (side === 'bottom' && available.bottom < er.height + offset && available.top > available.bottom) actual = 'top';
      if (side === 'right' && available.right < er.width + offset && available.left > available.right) actual = 'left';
      if (side === 'left' && available.left < er.width + offset && available.right > available.left) actual = 'right';
      let left = ar.left;
      let top = ar.top;
      if (actual === 'top' || actual === 'bottom') {
        top = actual === 'top' ? ar.top - er.height - offset : ar.bottom + offset;
        if (align === 'end') left = ar.right - er.width;
        else if (align === 'center') left = ar.left + (ar.width - er.width) / 2;
        else left = ar.left;
      } else {
        left = actual === 'left' ? ar.left - er.width - offset : ar.right + offset;
        if (align === 'end') top = ar.bottom - er.height;
        else if (align === 'center') top = ar.top + (ar.height - er.height) / 2;
        else top = ar.top;
      }
      left = clamp(left, margin, Math.max(margin, window.innerWidth - er.width - margin));
      top = clamp(top, margin, Math.max(margin, window.innerHeight - er.height - margin));
      el.style.left = `${Math.round(left)}px`;
      el.style.top = `${Math.round(top)}px`;
      el.dataset.placement = `${actual}-${align}`;
      el.style.setProperty('--enter-y', actual === 'top' ? '7px' : '-7px');
      el.style.setProperty('--enter-x', actual === 'left' ? '9px' : '-9px');
    }
  }

  let overlays;
  let activeModal = null;
  let contextDrawer = null;

  function openModal(content, {className = '', dismissible = true, onClose = null} = {}) {
    overlays.closeAll(true);
    closeContextDrawer(true);
    closeModal(true);
    const layer = document.createElement('div');
    layer.className = 'modal-layer';
    const scrim = document.createElement('div');
    scrim.className = 'modal-scrim';
    const modal = document.createElement('section');
    modal.className = `pm-modal ${className}`.trim();
    modal.setAttribute('role','dialog');
    modal.setAttribute('aria-modal','true');
    const body = document.createElement('div');
    body.className = 'modal-content';
    if (content instanceof Node) body.append(content);
    else body.innerHTML = content;
    modal.append(body);
    layer.append(scrim, modal);
    refs.overlayRoot.append(layer);
    hydrateIcons(layer);
    activeModal = {layer, modal, onClose};
    if (dismissible) scrim.addEventListener('click', () => closeModal());
    requestAnimationFrame(() => modal.querySelector('button,input,textarea,[tabindex]')?.focus({preventScroll:true}));
    return activeModal;
  }

  function closeModal(immediate = false) {
    if (!activeModal) return;
    const {layer, onClose} = activeModal;
    activeModal = null;
    if (onClose) {
      try { onClose(); } catch (_) {}
    }
    if (immediate) layer.remove();
    else {
      layer.classList.add('closing');
      setTimeout(() => layer.remove(), 200);
    }
  }

  function animateModalHeight(mutator) {
    if (!activeModal) return mutator();
    const modal = activeModal.modal;
    const oldHeight = modal.getBoundingClientRect().height;
    mutator();
    const newHeight = modal.getBoundingClientRect().height;
    if (Math.abs(newHeight - oldHeight) < 2) return;
    modal.animate([
      {height:`${oldHeight}px`, transform:'translateY(0) scale(1)'},
      {height:`${newHeight + Math.min(8, Math.abs(newHeight-oldHeight)*.08)}px`, offset:.72, transform:'translateY(-1px) scale(1.003)'},
      {height:`${newHeight}px`, transform:'translateY(0) scale(1)'}
    ], {duration:420,easing:'cubic-bezier(.2,1.24,.32,1)'}).onfinish = () => { modal.style.height=''; };
  }

  function closeContextDrawer(immediate = false) {
    if (!contextDrawer) return;
    const drawer = contextDrawer;
    contextDrawer = null;
    if (immediate) drawer.remove();
    else {
      drawer.classList.add('closing');
      setTimeout(() => drawer.remove(), 210);
    }
  }

  function toast(title, detail = '', iconName = 'check', timeout = 3600) {
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = `<span class="toast-icon">${icon(iconName)}</span><span class="toast-copy"><strong>${escapeHTML(title)}</strong>${detail ? `<small>${escapeHTML(detail)}</small>` : ''}</span><button class="icon-button tiny" aria-label="Dismiss">${icon('close')}</button>`;
    refs.toastRoot.append(el);
    const close = () => {
      if (!el.isConnected) return;
      el.classList.add('closing');
      setTimeout(() => el.remove(), 190);
    };
    $('button',el).addEventListener('click',close);
    if (timeout) setTimeout(close,timeout);
    return el;
  }

  function setStatus(message, timeout = 2600) {
    refs.statusMessage.textContent = message;
    if (timeout) setTimeout(() => { if (refs.statusMessage.textContent === message) refs.statusMessage.textContent = 'Ready'; }, timeout);
  }

  function applyTheme(id) {
    const theme = D.themes.find(t => t.id === id) || D.themes[0];
    state.theme = theme.id;
    document.documentElement.dataset.theme = theme.id;
    localStorage.setItem('pm56-theme', theme.id);
  }

  function applyFamilyClasses() {
    Object.entries(state.family).forEach(([id,value]) => document.body.dataset[`${id}Option`] = String(value));
  }

  function applyRecipe(id, announce = true) {
    const recipe = D.recipes.find(r => r.id === id) || D.recipes[0];
    state.recipe = recipe.id;
    state.family = {...recipe.values};
    applyFamilyClasses();
    if (announce) toast(`${recipe.name} applied`, 'All component renderers switched without resetting the thread.', 'sliders');
  }

  function applyWidths() {
    const rootStyle = document.documentElement.style;
    const maxAssistant = Math.max(430, window.innerWidth - 250);
    const assistantWidth = state.assistantWidth ? clamp(state.assistantWidth, 430, maxAssistant) : null;
    if (assistantWidth) rootStyle.setProperty('--assistant-w',`${assistantWidth}px`);
    rootStyle.setProperty('--history-w',`${clamp(state.historyWidth,170,320)}px`);
    rootStyle.setProperty('--activity-w',`${clamp(state.activityWidth,240,420)}px`);
  }

  function activeThread() { return state.threads.find(t => t.id === state.activeThread) || state.threads[0]; }
  function activeModel() { return state.models.find(m => m.id === state.model) || state.models[0]; }
  function activePersona() { return D.personas.find(p => p.id === state.persona) || D.personas[0]; }
  function activeMode() { return D.modes.find(m => m.id === state.mode) || D.modes[1]; }
  function activePermission() { return D.permissions.find(p => p.id === state.permissions) || D.permissions[2]; }
  function activeWorktree() { return D.worktrees.find(w => w.id === state.worktree) || D.worktrees[0]; }

  function renderHeader() {
    const thread = activeThread();
    refs.activeThreadTitle.textContent = thread.title;
    refs.activeThreadStatus.className = `thread-live-status ${thread.status === 'complete' ? 'complete' : thread.status === 'blocked' ? 'blocked' : ''}`;
    refs.activeThreadStatus.innerHTML = `<i></i><span>${thread.status === 'working' ? 'Working' : thread.status === 'blocked' ? 'Blocked' : thread.status === 'waiting' ? 'Waiting' : 'Complete'}</span>`;
    refs.activeThreadMeta.textContent = `${activeMode().name} · ${activeModel().name} · ${thread.time}`;
  }

  function renderSelectors() {
    refs.personaLabel.textContent = activePersona().name;
    refs.modelLabel.textContent = activeModel().name;
    refs.modeLabel.textContent = activeMode().name;
    refs.permissionsLabel.textContent = activePermission().name;
    refs.worktreeLabel.textContent = activeWorktree().name;
    refs.statusWorktree.textContent = activeWorktree().name;
    refs.fastIndicator.hidden = !(activeModel().fast && activeModel().fastEnabled);
    renderActiveCapabilities();
  }

  function renderActiveCapabilities() {
    const visible = [];
    if (state.capabilities.goal === 'on') visible.push({name:'Goal',icon:'target'});
    if (state.capabilities.crew !== 'off') visible.push({name:`Crew ${capitalize(state.capabilities.crew)}`,icon:'users'});
    if (state.capabilities.bsd !== 'off') visible.push({name:`BSD ${capitalize(state.capabilities.bsd)}`,icon:'steering'});
    if (state.capabilities.lens && state.capabilities.lens !== 'off') visible.push({name:`Lens ${capitalize(state.capabilities.lens)}`,icon:'lens'});
    if (state.capabilities.eli5 && state.capabilities.eli5 !== 'off') visible.push({name:`ELI5 ${capitalize(state.capabilities.eli5)}`,icon:'lightbulb'});
    if (state.capabilities.thought === 'expanded') visible.push({name:'Thought expanded',icon:'thought'});
    refs.activeCapabilities.innerHTML = visible.map(v => `<span class="capability-pill">${icon(v.icon)}<span>${escapeHTML(v.name)}</span></span>`).join('');
  }

  function capitalize(s='') { return s.charAt(0).toUpperCase()+s.slice(1); }

  function renderHistory() {
    const query = state.historyFilter.trim().toLowerCase();
    const visibleThreads = state.threads.filter(t => !query || `${t.title} ${t.summary}`.toLowerCase().includes(query));
    const groups = [
      {id:'pinned',label:'Pinned',items:visibleThreads.filter(t=>t.pinned&&!t.archived)},
      {id:'recent',label:'Recent',items:visibleThreads.filter(t=>!t.pinned&&!t.archived)},
      {id:'archived',label:'Archived',items:visibleThreads.filter(t=>t.archived),hidden:!state.archivedExpanded && !query}
    ];
    refs.archivedCount.textContent = String(state.threads.filter(t=>t.archived).length);
    refs.historyScroll.innerHTML = groups.filter(g=>!g.hidden).map(group => `
      <section class="history-section" data-history-section="${group.id}">
        <div class="history-section-header"><span>${group.label}</span>${group.id==='archived'?`<button data-action="toggle-archived">${icon(state.archivedExpanded?'down':'chevron')}<span>${group.items.length}</span></button>`:`<span>${group.items.length}</span>`}</div>
        ${group.items.length ? group.items.map(threadRowHTML).join('') : `<div class="history-empty">${query?'No matching threads':'Nothing here yet'}</div>`}
      </section>`).join('');
    hydrateIcons(refs.historyScroll);
  }

  function threadRowHTML(thread) {
    return `<div class="thread-row ${thread.id===state.activeThread?'active':''}" data-thread-id="${thread.id}" role="button" tabindex="0" aria-label="Open ${escapeHTML(thread.title)}">
      <span class="thread-status-cell">
        <span class="thread-status-indicator" data-status="${thread.status}"><i></i></span>
        <button class="thread-more-button" data-action="thread-row-menu" data-thread-id="${thread.id}" aria-label="More actions for ${escapeHTML(thread.title)}" data-tooltip="Rename, pin, fork, archive, restore, or delete this thread">${icon('more')}</button>
      </span>
      <span class="thread-row-copy"><span class="thread-row-title">${escapeHTML(thread.title)}</span><span class="thread-row-summary">${escapeHTML(thread.summary)}</span></span>
      <time class="thread-row-time">${escapeHTML(thread.time)}</time>
    </div>`;
  }

  function selectThread(id, {scroll = true} = {}) {
    const thread = state.threads.find(t => t.id === id);
    if (!thread) return;
    state.draftByThread[state.activeThread] = refs.composerInput.value;
    state.activeThread = id;
    state.transcriptAppend = [];
    refs.composerInput.value = state.draftByThread[id] || '';
    autoGrowComposer();
    renderHeader();
    renderHistory();
    renderTranscript();
    if (scroll) requestAnimationFrame(() => { refs.chatScroll.scrollTop = refs.chatScroll.scrollHeight; });
    const row = $(`.thread-row[data-thread-id="${CSS.escape(id)}"]`, refs.historyScroll);
    row?.classList.add('switching');
    setTimeout(()=>row?.classList.remove('switching'),420);
  }

  function renderHistoryVisibility() {
    refs.assistantBody.classList.toggle('history-hidden',!state.historyVisible);
    refs.threadHistory.hidden = !state.historyVisible;
    refs.threadHistory.dataset.pinned = String(state.historyPinned);
    const resizer = $('.history-resizer');
    if (resizer) resizer.hidden = !state.historyVisible;
  }

  function renderActivityBar() {
    const domains = [
      {id:'goal',name:'Goal',icon:'target',count:'72%',state:state.activityBlockedDemo?'blocked':'active'},
      {id:'todo',name:'Todo',icon:'checklist',count:'3/8',state:'active'},
      {id:'subagents',name:'Subagents',icon:'users',count:'3',state:'active'},
      {id:'changes',name:'Changes',icon:'diff',count:'4',state:'complete'},
      {id:'artifacts',name:'Artifacts',icon:'artifact',count:'12',state:'complete'}
    ];
    refs.chatActivityBar.innerHTML = domains.map(d => `<button class="activity-domain ${state.activityDomain===d.id?'active':''}" data-action="open-activity" data-domain="${d.id}" data-state="${d.state}" data-tooltip="Open ${d.name} details; pin the panel to keep it beside the thread">${icon(d.icon)}<span>${d.name}</span><span class="domain-count">${d.count}</span></button>`).join('');
  }

  function renderActivityDock() {
    refs.assistantBody.classList.toggle('activity-pinned',state.activityPinned);
    refs.activityDetailDock.hidden = !state.activityPinned;
    const resizer = $('.activity-resizer');
    if (resizer) resizer.hidden = !state.activityPinned;
    if (!state.activityPinned || !state.activityDomain) return;
    const meta = activityDomainMeta(state.activityDomain);
    refs.activityDetailTitle.textContent = meta.title;
    refs.activityDetailSubtitle.textContent = meta.subtitle;
    refs.activityDetailIcon.innerHTML = icon(meta.icon);
    refs.activityDetailContent.innerHTML = activityDetailHTML(state.activityDomain,true);
    hydrateIcons(refs.activityDetailDock);
  }

  function activityDomainMeta(domain) {
    return {
      goal:{title:'Goal',subtitle:'Current objective and evidence',icon:'target'},
      todo:{title:'Todo',subtitle:'Current, next, and completed work',icon:'checklist'},
      subagents:{title:'Subagents',subtitle:'Live delegated work',icon:'users'},
      changes:{title:'Changes',subtitle:'Files, ranges, and versions',icon:'diff'},
      artifacts:{title:'Artifacts',subtitle:'Created and updated results',icon:'artifact'}
    }[domain] || {title:'Activity',subtitle:'Current work',icon:'activity'};
  }

  function activityDetailHTML(domain, pinned = false) {
    if (domain === 'goal') return goalDetailHTML();
    if (domain === 'todo') return todoDetailHTML();
    if (domain === 'subagents') return subagentDetailHTML();
    if (domain === 'changes') return changesDetailHTML();
    if (domain === 'artifacts') return artifactDetailHTML();
    return '';
  }

  function goalDetailHTML() {
    const blocked = state.activityBlockedDemo;
    return `
      <article class="activity-card">
        <div class="activity-card-header"><div><div class="activity-card-title">Finish assistant interaction audit</div><div class="activity-card-subtitle">${blocked?'Blocked by production schema policy':'Running · Validation phase'}</div></div><span class="meta-chip">${blocked?'Blocked':'72%'}</span></div>
        <div class="activity-summary">Repair every visible interaction defect, preserve PMConcept7’s motion grammar, and produce auditable evidence without dropping unresolved issues.</div>
        <div class="activity-progress"><i style="width:${blocked?58:72}%"></i></div>
        ${blocked?`<div class="activity-card" style="margin-top:8px;border-color:color-mix(in srgb,var(--danger) 38%,var(--line));"><div class="activity-card-title" style="color:var(--danger)">Exact blocker</div><div class="activity-summary">Production schema changes require an explicit database-admin role or user override.</div></div>`:''}
        <div class="activity-actions-row">
          <button class="mini-button" data-action="open-goal-artifact">${icon('target')} View Goal</button>
          <button class="mini-button" data-action="edit-goal">${icon('edit')} Edit</button>
          <button class="mini-button" data-action="pause-goal">${icon('hand')} Pause</button>
          <button class="mini-button" data-action="resume-goal">${icon('redo')} Resume</button>
          <button class="mini-button" data-action="stop-goal">${icon('close')} Stop</button>
          <button class="mini-button" data-action="clear-goal">${icon('trash')} Clear</button>
        </div>
      </article>
      <article class="activity-card">
        <div class="activity-card-header"><div><div class="activity-card-title">Plan summary</div><div class="activity-card-subtitle">Query Performance Plan · revision 3</div></div><button class="icon-button tiny" data-action="open-artifact" data-artifact-id="plan-query" title="Open full plan">${icon('link')}</button></div>
        <div class="activity-summary">Start with tenant-scoped composite indexes, benchmark both traffic profiles, and retain one shadow materialized-view experiment as a follow-up.</div>
      </article>
      <article class="activity-card">
        <div class="activity-card-title">Tasks and evidence</div>
        <div class="activity-list">
          ${D.todos.slice(0,4).map(t=>activityListRow(t.state==='complete'?'check':t.state==='active'?'activity':'down',t.text,capitalize(t.state),t.state==='active'?'Now':'')).join('')}
          ${activityListRow('camera','Responsive geometry matrix','Evidence','320 cases')}
          ${activityListRow('browser','Menu and submenu recordings','Evidence','4 videos')}
        </div>
      </article>`;
  }

  function todoDetailHTML() {
    return `<article class="activity-card"><div class="activity-card-header"><div><div class="activity-card-title">Audit checklist</div><div class="activity-card-subtitle">3 complete · 2 active · 3 queued</div></div><span class="meta-chip">3 / 8</span></div><div class="activity-progress"><i style="width:43%"></i></div><div class="activity-list">${D.todos.map(t=>activityListRow(t.state==='complete'?'check':t.state==='active'?'activity':'down',t.text,capitalize(t.state),t.state==='active'?'Now':'')).join('')}</div></article>`;
  }

  function subagentDetailHTML() {
    return `<article class="activity-card"><div class="activity-card-header"><div><div class="activity-card-title">Delegated work</div><div class="activity-card-subtitle">2 working · 1 blocked · 1 complete · 1 waiting</div></div><span class="meta-chip">5 agents</span></div><div class="activity-list">${D.subagents.map(a=>`<button class="activity-list-row" data-action="open-subagent" data-subagent-id="${a.id}"><span>${icon('agent')}</span><span class="activity-list-copy"><strong>${escapeHTML(a.name)}</strong><small>${escapeHTML(a.task)}</small></span><span class="activity-list-meta">${escapeHTML(a.elapsed)}</span></button>`).join('')}</div></article>`;
  }

  function changesDetailHTML() {
    return `<article class="activity-card"><div class="activity-card-header"><div><div class="activity-card-title">Modified files</div><div class="activity-card-subtitle">4 files · +291 / −88</div></div><span class="meta-chip">Working tree</span></div><div class="activity-list">${D.fileChanges.map(c=>`<button class="activity-list-row" data-action="open-change" data-change-id="${c.id}"><span>${icon('diff')}</span><span class="activity-list-copy"><strong>${escapeHTML(c.path)}</strong><small>${escapeHTML(c.summary)} · ${escapeHTML(c.range)}</small></span><span class="activity-list-meta">+${c.added} −${c.removed}</span></button>`).join('')}</div></article>`;
  }

  function artifactDetailHTML() {
    return `<article class="activity-card"><div class="activity-card-header"><div><div class="activity-card-title">Artifact ledger</div><div class="activity-card-subtitle">Inline, editor, and generated results</div></div><span class="meta-chip">${D.artifacts.length}</span></div><div class="activity-list">${D.artifacts.map(a=>`<button class="activity-list-row" data-action="open-artifact" data-artifact-id="${a.id}"><span>${icon(a.icon)}</span><span class="activity-list-copy"><strong>${escapeHTML(a.title)}</strong><small>${escapeHTML(a.subtitle)}</small></span><span class="activity-list-meta">Open</span></button>`).join('')}</div></article>`;
  }

  function activityListRow(iconName,title,subtitle,meta='') {
    return `<div class="activity-list-row"><span>${icon(iconName)}</span><span class="activity-list-copy"><strong>${escapeHTML(title)}</strong><small>${escapeHTML(subtitle)}</small></span><span class="activity-list-meta">${escapeHTML(meta)}</span></div>`;
  }

  function renderTranscript() {
    const thread = activeThread();
    const scenario = D.transcriptScenarios[thread.scenario] || D.transcriptScenarios.query;
    const items = [...scenario, ...state.transcriptAppend];
    refs.transcript.innerHTML = items.map((item,index) => transcriptItemHTML(item,index)).join('');
    hydrateIcons(refs.transcript);
    bindArtifactInteractions(refs.transcript);
    requestAnimationFrame(() => updateJumpLatest());
  }

  function transcriptItemHTML(item,index) {
    const id = item.id || `${activeThread().id}-${index}`;
    if (item.kind === 'user' || item.kind === 'assistant') return messageHTML(item,id);
    if (item.kind === 'working') return workingHTML(item);
    if (item.kind === 'plan-card') return planCardHTML(D.artifacts.find(a=>a.id===item.artifact));
    if (item.kind === 'mermaid') return mermaidPreviewHTML(D.artifacts.find(a=>a.id===item.artifact));
    if (item.kind === 'visualizer') return visualizerPreviewHTML(D.artifacts.find(a=>a.id===item.artifact));
    if (item.kind === 'image') return imagePreviewHTML(D.artifacts.find(a=>a.id===item.artifact));
    if (item.kind === 'receipt') return receiptHTML(item);
    if (item.kind === 'error') return errorCardHTML(item);
    return '';
  }

  function messageHTML(item,id) {
    const isUser = item.kind === 'user';
    const expanded = state.messageExpansions.has(id);
    const content = formatMessage(item.text);
    const actions = isUser ? [
      {id:'edit-message',icon:'edit',tip:'Edit this message and create a new branch from this point'},
      {id:'branch-message',icon:'fork',tip:'Fork the thread at this message while preserving the original'},
      {id:'copy-message',icon:'copy',tip:'Copy this message to the clipboard'}
    ] : [
      {id:'copy-message',icon:'copy',tip:'Copy this response to the clipboard'},
      {id:'retry-turn',icon:'redo',tip:'Retry only this failed or completed assistant turn from its original inputs'},
      {id:'reanswer-turn',icon:'undo',tip:'Return to this point and ask for a different answer on a new branch'}
    ];
    return `<article class="message ${item.kind} ${expanded?'expanded':''}" data-message-id="${escapeHTML(id)}">
      <div class="message-shell">
        ${isUser?'':`<div class="message-author"><span class="message-avatar">${icon('sparkles')}</span><strong>Puppet Master</strong><span>·</span><span>${escapeHTML(activeModel().name)}</span></div>`}
        <div class="message-body ${item.collapsible?'message-collapsible':''}">${content}</div>
        ${item.collapsible?`<button class="message-expand" data-action="toggle-message" data-message-id="${escapeHTML(id)}"><span>${expanded?'Collapse':'Expand full response'}</span>${icon('down')}</button>`:''}
      </div>
      <div class="message-actions">${actions.map(a=>`<button class="message-action" data-action="${a.id}" data-message-id="${escapeHTML(id)}" data-tooltip="${escapeHTML(a.tip)}" aria-label="${escapeHTML(a.tip)}">${icon(a.icon)}</button>`).join('')}<span class="message-time">${isUser?'2m ago':'just now'}</span></div>
    </article>`;
  }

  function formatMessage(text='') {
    return escapeHTML(text)
      .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
      .replace(/`([^`]+)`/g,'<code>$1</code>')
      .split(/\n\n+/).map(p=>`<p>${p.replace(/\n/g,'<br>')}</p>`).join('');
  }

  function workingHTML(item = {}) {
    const work = D.workingStates.find(s=>s.id===(item.state || state.workingState)) || D.workingStates[0];
    const expanded = item.expanded ?? state.workingExpanded;
    const currentIndex = D.workingStates.findIndex(s=>s.id===work.id);
    const eventPool = [
      {icon:'files',title:'Read src/analytics/queries.rs',detail:'Found three full-table scan paths with tenant filtering applied late',meta:'0.3s'},
      {icon:'search',title:'Search query call sites',detail:'12 references across analytics, reports, and usage projections',meta:'0.6s'},
      {icon:work.icon,title:work.label,detail:work.subtitle,meta:'now'}
    ];
    const showAgents = ['subagents','permission','validating','complete'].includes(work.id);
    return `<section class="working-animation ${expanded?'expanded':''}" data-working-state="${work.id}">
      <div class="working-head">
        <span class="working-orb">${icon(work.icon)}</span>
        <span class="working-title-wrap"><span class="working-title-line"><strong class="working-title">${escapeHTML(work.label)}</strong><span class="working-elapsed">${work.id==='complete'?'2m 14s':'1m 46s'}</span></span><span class="working-subtitle">${escapeHTML(work.subtitle)}</span></span>
        <button class="working-toggle" data-action="toggle-working" data-tooltip="${expanded?'Collapse the work stream into a compact receipt':'Expand the organized work stream and evidence'}">${icon('down')}</button>
      </div>
      ${work.id==='complete'?'':'<div class="working-progress-track"><i></i></div>'}
      <div class="working-details"><div class="working-details-inner"><div class="working-stage">
        <div class="working-stream">${eventPool.map((e,i)=>`<div class="work-event ${i===eventPool.length-1?'current':''}"><span class="work-event-icon">${icon(e.icon)}</span><span class="work-event-copy"><strong>${escapeHTML(e.title)}</strong><small>${escapeHTML(e.detail)}</small></span><span class="work-event-meta">${escapeHTML(e.meta)}</span></div>`).join('')}</div>
        ${showAgents?`<div class="subagent-lane"><div class="subagent-lane-head"><span>Live subagents</span><span>2 working · 1 blocked</span></div>${D.subagents.slice(0,3).map(a=>`<button class="subagent-row" data-action="open-subagent" data-subagent-id="${a.id}"><span class="subagent-avatar ${a.status==='blocked'?'blocked':''}">${icon('agent')}</span><span class="subagent-copy"><strong>${escapeHTML(a.name)}</strong><small>${escapeHTML(a.task)}</small></span><span class="subagent-time">${escapeHTML(a.elapsed)}</span></button>`).join('')}</div>`:''}
      </div></div></div>
      <div class="working-receipt"><strong>${work.id==='complete'?'Verified':'In progress'}</strong><span>8 tools</span><span>4 files</span><span>3 agents</span><span>2 artifacts</span>${currentIndex>=0?`<span>${currentIndex+1} / ${D.workingStates.length} states</span>`:''}</div>
    </section>`;
  }

  function planCardHTML(artifact) {
    if (!artifact) return '';
    const deep = artifact.type === 'deep-plan';
    return `<article class="transcript-card plan-card" data-artifact-id="${artifact.id}"><div class="card-accent-line"></div><div class="transcript-card-inner">
      <div class="card-kicker">Created ${deep?'Deep Plan':'Plan'}</div>
      <h3>${escapeHTML(artifact.title)}</h3>
      <p>${deep?'Build a native Rust and Slint product slice with explicit runtime boundaries, independent evidence, integration gates, and a staged delivery sequence.':'Start with tenant-scoped composite indexes, benchmark read-heavy and balanced traffic, and retain a shadow materialized-view experiment as a measured follow-up.'}</p>
      <div class="card-meta-row"><span class="meta-chip">${icon(deep?'layers':'plan')} ${deep?'Deep Plan':'Plan'}</span><span class="meta-chip">Revision ${deep?'2':'3'}</span><span class="meta-chip">${deep?state.thoroughness['deep-plan']:state.thoroughness.plan}</span></div>
      <div class="card-actions"><button class="secondary-button" data-action="open-artifact" data-artifact-id="${artifact.id}">${icon('eye')} View Plan</button><button class="primary-button" data-action="build-plan" data-artifact-id="${artifact.id}">${icon('bolt')} Build <span class="shortcut">⌘↵</span></button></div>
    </div></article>`;
  }

  function mermaidPreviewHTML(artifact) {
    if (!artifact) return '';
    return `<article class="artifact-preview" data-artifact-id="${artifact.id}">
      <div class="artifact-preview-head"><div class="artifact-preview-title"><span class="artifact-preview-icon">${icon('diagram')}</span><div><strong>${escapeHTML(artifact.title)}</strong><small>${escapeHTML(artifact.subtitle)}</small></div></div><div class="artifact-preview-actions"><button class="icon-button tiny" data-action="toggle-mermaid-source" title="Show diagram source">${icon('code')}</button><button class="icon-button tiny" data-action="open-artifact" data-artifact-id="${artifact.id}" title="Open in editor">${icon('link')}</button></div></div>
      <div class="artifact-preview-body mermaid-preview-body">${mermaidSVG()}</div>
    </article>`;
  }

  function mermaidSVG() {
    return `<div class="mermaid-stage"><svg viewBox="0 0 640 220" role="img" aria-label="Runtime architecture diagram"><defs><marker id="arrowhead" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="currentColor" opacity=".55"></path></marker></defs>
      <path class="mermaid-edge" d="M150 58 C205 58 205 58 250 58"></path><path class="mermaid-edge" d="M390 58 C440 58 440 58 490 58"></path><path class="mermaid-edge" d="M320 90 C320 125 320 125 320 150"></path>
      <g class="mermaid-node primary"><rect x="30" y="30" rx="12" width="120" height="56"></rect><text x="90" y="55" text-anchor="middle">Assistant Chat</text><text x="90" y="70" text-anchor="middle" opacity=".6">Slint surface</text></g>
      <g class="mermaid-node"><rect x="250" y="30" rx="12" width="140" height="56"></rect><text x="320" y="55" text-anchor="middle">Artifact Host</text><text x="320" y="70" text-anchor="middle" opacity=".6">Typed bridge</text></g>
      <g class="mermaid-node"><rect x="490" y="30" rx="12" width="120" height="56"></rect><text x="550" y="55" text-anchor="middle">Sandbox</text><text x="550" y="70" text-anchor="middle" opacity=".6">Renderer</text></g>
      <g class="mermaid-node"><rect x="250" y="150" rx="12" width="140" height="48"></rect><text x="320" y="178" text-anchor="middle">Artifact Ledger</text></g>
    </svg></div>`;
  }

  function visualizerPreviewHTML(artifact) {
    if (!artifact) return '';
    return `<article class="artifact-preview" data-artifact-id="${artifact.id}">
      <div class="artifact-preview-head"><div class="artifact-preview-title"><span class="artifact-preview-icon">${icon(artifact.icon)}</span><div><strong>${escapeHTML(artifact.title)}</strong><small>${escapeHTML(artifact.subtitle)}</small></div></div><div class="artifact-preview-actions"><button class="icon-button tiny" data-action="refresh-artifact" data-artifact-id="${artifact.id}" title="Refresh fixture">${icon('redo')}</button><button class="icon-button tiny" data-action="open-artifact" data-artifact-id="${artifact.id}" title="Open in editor">${icon('link')}</button></div></div>
      <div class="artifact-preview-body">${visualizerBodyHTML(artifact.id,true)}</div>
    </article>`;
  }

  function visualizerBodyHTML(id, compact = false) {
    if (id === 'dashboard-usage') return dashboardHTML(compact);
    if (id === 'data-explorer') return dataExplorerHTML(compact);
    if (id === 'architecture-map') return architectureMapHTML(compact);
    if (id === 'quiz-routing') return quizHTML(compact);
    if (id === 'periodic-capabilities') return periodicHTML(compact);
    if (id === 'flowchart-goal') return flowchartHTML(compact);
    if (id === 'chart-latency') return chartHTML(compact);
    return dashboardHTML(compact);
  }

  function dashboardHTML(compact) {
    return `<div class="dashboard-grid">
      <div class="metric-card"><small>Median latency</small><strong>82 ms</strong><em>−61%</em></div>
      <div class="metric-card"><small>Cache hit rate</small><strong>87.4%</strong><em>+8.2%</em></div>
      <div class="metric-card"><small>Write overhead</small><strong>14.8%</strong><em style="color:var(--warning)">within gate</em></div>
      <div class="dashboard-chart"><div class="bar-row"><span>Baseline</span><span class="bar-track"><i style="--value:94%"></i></span><span>211</span></div><div class="bar-row"><span>Index A</span><span class="bar-track"><i style="--value:37%"></i></span><span>82</span></div><div class="bar-row"><span>Index B</span><span class="bar-track"><i style="--value:43%"></i></span><span>96</span></div><div class="bar-row"><span>Mat. view</span><span class="bar-track"><i style="--value:21%"></i></span><span>46</span></div></div>
    </div>`;
  }

  function dataExplorerHTML(compact) {
    return `<div class="data-explorer" data-interactive="data-explorer"><div class="menu-search" style="margin:0 0 8px"><span>${icon('search')}</span><input type="search" data-action="filter-data-explorer" placeholder="Filter tenant or query…"></div><div style="overflow:auto;border:1px solid var(--line);border-radius:9px"><table style="width:100%;border-collapse:collapse;font-size:9px"><thead><tr style="color:var(--text-faint);text-align:left"><th style="padding:7px">Tenant</th><th>Query</th><th>p50</th><th>p95</th><th>Reads</th></tr></thead><tbody>${[['acme','usage_rollup','82 ms','151 ms','1.2M'],['northstar','token_cost','91 ms','184 ms','840K'],['lattice','activity_feed','64 ms','122 ms','2.1M'],['orbit','provider_usage','113 ms','208 ms','620K']].map(r=>`<tr data-row-text="${r.join(' ').toLowerCase()}" style="border-top:1px solid var(--line)">${r.map(v=>`<td style="padding:7px;color:var(--text)">${v}</td>`).join('')}</tr>`).join('')}</tbody></table></div></div>`;
  }

  function architectureMapHTML(compact) {
    return `<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;align-items:center;min-height:${compact?'170':'360'}px"><button class="metric-card" data-action="architecture-node" data-node="Supervisor"><small>Parent</small><strong style="font-size:11px">Supervisor</strong></button><button class="metric-card" data-action="architecture-node" data-node="WorkNodes"><small>Execution</small><strong style="font-size:11px">WorkNodes</strong></button><button class="metric-card" data-action="architecture-node" data-node="Auditor"><small>Evidence</small><strong style="font-size:11px">Auditor</strong></button><div class="dashboard-chart" style="grid-column:1/-1;min-height:auto"><div class="activity-summary">Select a node to inspect its route, model tier, context boundary, and evidence contract.</div></div></div>`;
  }

  function quizHTML(compact) {
    return `<div data-interactive="quiz"><div class="card-kicker">Question 1 of 3</div><h3 style="margin:5px 0 10px;color:var(--text-strong)">Which route should own a difficult frontend WorkNode?</h3><div class="question-options">${['The cheapest available model','A qualified frontend agent at the required quality tier','The planning model regardless of qualification'].map((v,i)=>`<button class="question-option" data-action="answer-quiz" data-correct="${i===1}"><span class="question-option-mark">${icon('check')}</span><span class="question-option-copy"><strong>${v}</strong></span></button>`).join('')}</div><div class="quiz-feedback" style="margin-top:8px;color:var(--text-muted);font-size:9px"></div></div>`;
  }

  function periodicHTML(compact) {
    const cells = ['Goal','Plan','Agent','Debug','Web','Bash','Browser','Artifacts','Mermaid','Quiz','Chart','Image'];
    return `<div data-interactive="periodic"><div class="menu-search" style="margin:0 0 8px"><span>${icon('search')}</span><input type="search" data-action="filter-periodic" placeholder="Filter capabilities…"></div><div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px">${cells.map((c,i)=>`<button class="metric-card" data-capability-name="${c.toLowerCase()}" data-action="inspect-capability" data-capability="${c}"><small>${String(i+1).padStart(2,'0')}</small><strong style="font-size:11px">${c}</strong></button>`).join('')}</div></div>`;
  }

  function flowchartHTML(compact) {
    return `<div style="display:flex;align-items:center;justify-content:center;gap:6px;min-height:${compact?'170':'360'}px;overflow:auto">${['Running','Paused','Blocked','Replanning','Complete'].map((s,i)=>`${i?`<span style="color:var(--text-faint)">${icon('chevron')}</span>`:''}<button class="metric-card" data-action="goal-state" data-state="${s}" style="min-width:90px"><small>State ${i+1}</small><strong style="font-size:10px">${s}</strong></button>`).join('')}</div>`;
  }

  function chartHTML(compact) { return dashboardHTML(compact); }

  function imagePreviewHTML(artifact) {
    if (!artifact) return '';
    return `<article class="artifact-preview" data-artifact-id="${artifact.id}"><div class="artifact-preview-head"><div class="artifact-preview-title"><span class="artifact-preview-icon">${icon('image')}</span><div><strong>${escapeHTML(artifact.title)}</strong><small>${escapeHTML(artifact.subtitle)}</small></div></div><div class="artifact-preview-actions"><button class="icon-button tiny" data-action="open-artifact" data-artifact-id="${artifact.id}" title="Open full image in editor">${icon('link')}</button></div></div><button class="artifact-preview-body generated-image-preview" data-action="open-artifact" data-artifact-id="${artifact.id}" aria-label="Open generated image"><span class="image-figure"><i class="head"></i><i class="torso"></i><i class="arm left"></i><i class="arm right"></i><i class="leg left"></i><i class="leg right"></i></span></button></article>`;
  }

  function receiptHTML(item) {
    return `<div class="message-system"><div class="activity-card"><div class="activity-card-title">${icon(item.icon||'check')} ${escapeHTML(item.title||'Completed')}</div><div class="activity-summary">${escapeHTML(item.detail||'The result was recorded in this thread.')}</div></div></div>`;
  }

  function errorCardHTML(item) {
    return `<article class="transcript-card"><div class="transcript-card-inner"><div class="card-kicker" style="color:var(--danger)">Recoverable tool error</div><h3>${escapeHTML(item.title||'Browser action lost its target')}</h3><p>${escapeHTML(item.detail||'The page changed while the control was being inspected. The last verified state and evidence were preserved.')}</p><div class="card-actions"><button class="secondary-button" data-action="retry-error">${icon('redo')} Retry from checkpoint</button><button class="ghost-button" data-action="view-error-evidence">${icon('eye')} View evidence</button></div></div></article>`;
  }

  function bindArtifactInteractions(root) {
    $$('[data-action="filter-data-explorer"]',root).forEach(input=>input.addEventListener('input',()=>{
      const q=input.value.toLowerCase();
      $$('tbody tr',input.closest('[data-interactive]')).forEach(row=>row.hidden=!row.dataset.rowText.includes(q));
    }));
    $$('[data-action="filter-periodic"]',root).forEach(input=>input.addEventListener('input',()=>{
      const q=input.value.toLowerCase();
      $$('[data-capability-name]',input.closest('[data-interactive]')).forEach(cell=>cell.hidden=!cell.dataset.capabilityName.includes(q));
    }));
  }

  function openEditorTab({id,title,iconName='artifact',kind='document',data={}}, {activate=true} = {}) {
    let tab = state.editorTabs.find(t=>t.id===id);
    if (!tab) {
      tab = {id,title,iconName,kind,data};
      state.editorTabs.push(tab);
    } else {
      Object.assign(tab,{title,iconName,kind,data});
    }
    if (activate) state.activeEditorTab=id;
    renderEditor();
    if (window.innerWidth <= 880) toast('Opened in editor',`${title} is available in the file editor panel at wider window sizes.`,'artifact');
    return tab;
  }

  function closeEditorTab(id) {
    const index=state.editorTabs.findIndex(t=>t.id===id);
    if(index<0)return;
    state.editorTabs.splice(index,1);
    if(state.activeEditorTab===id) state.activeEditorTab=state.editorTabs.at(-1)?.id||null;
    renderEditor();
  }

  function renderEditor() {
    refs.editorTabs.innerHTML=state.editorTabs.map(tab=>`<button class="editor-tab ${tab.id===state.activeEditorTab?'active':''}" data-action="activate-editor-tab" data-tab-id="${escapeHTML(tab.id)}"><span class="tab-icon">${icon(tab.iconName)}</span><span class="tab-label">${escapeHTML(tab.title)}</span><span class="tab-close" data-action="close-editor-tab" data-tab-id="${escapeHTML(tab.id)}" title="Close tab">${icon('close')}</span></button>`).join('');
    const tab=state.editorTabs.find(t=>t.id===state.activeEditorTab);
    if(!tab){
      refs.editorBreadcrumbs.innerHTML=`<span>${icon('files')}</span><span>Workspace</span><span>${icon('chevron')}</span><span class="crumb-current">Assistant concept artifacts</span>`;
      refs.editorCanvas.innerHTML=`<div class="editor-empty"><div class="editor-empty-card"><span class="editor-empty-mark">${icon('artifact')}</span><h2>Artifact workspace</h2><p>Plans, child-agent transcripts, Mermaid diagrams, interactive visuals, images, links, and exact file changes open here without replacing the assistant thread.</p><button class="secondary-button" data-action="open-demo-studio">${icon('bolt')} Open Demo Studio</button></div></div>`;
      hydrateIcons(refs.editorWorkspace||refs.editorCanvas.parentElement);
      return;
    }
    refs.editorBreadcrumbs.innerHTML=`<span>${icon(tab.iconName)}</span><span>${escapeHTML(tab.kind)}</span><span>${icon('chevron')}</span><span class="crumb-current">${escapeHTML(tab.title)}</span>`;
    refs.editorCanvas.innerHTML=editorTabHTML(tab);
    hydrateIcons(refs.editorCanvas.parentElement);
    bindArtifactInteractions(refs.editorCanvas);
  }

  function editorTabHTML(tab) {
    if(tab.kind==='artifact') return artifactEditorHTML(tab.data.artifactId);
    if(tab.kind==='subagent') return subagentThreadHTML(tab.data.subagentId);
    if(tab.kind==='change') return changeEditorHTML(tab.data.changeId);
    if(tab.kind==='goal') return goalArtifactHTML(tab.data);
    if(tab.kind==='document') return documentEditorHTML(tab);
    return documentEditorHTML(tab);
  }

  function artifactEditorHTML(id) {
    const artifact=D.artifacts.find(a=>a.id===id);
    if(!artifact)return `<div class="editor-empty">Artifact not found.</div>`;
    let content='';
    if(artifact.type==='plan'||artifact.type==='deep-plan') content=planDocumentHTML(artifact);
    else if(artifact.type==='mermaid') content=`<div class="artifact-stage"><div class="artifact-frame"><div class="artifact-toolbar"><div><strong>${escapeHTML(artifact.title)}</strong><span class="meta-chip" style="margin-left:7px">Rendered</span></div><div class="artifact-actions"><button class="secondary-button" data-action="show-mermaid-source">${icon('code')} Source</button><button class="secondary-button" data-action="export-artifact">${icon('link')} Export</button></div></div><div class="artifact-content">${mermaidSVG()}</div></div></div>`;
    else if(artifact.type==='visualizer') content=`<div class="artifact-stage"><div class="artifact-frame"><div class="artifact-toolbar"><div><strong>${escapeHTML(artifact.title)}</strong><span class="meta-chip" style="margin-left:7px">Interactive</span></div><div class="artifact-actions"><button class="secondary-button" data-action="refresh-artifact" data-artifact-id="${artifact.id}">${icon('redo')} Refresh</button><button class="secondary-button" data-action="export-artifact">${icon('link')} Export</button></div></div><div class="artifact-content">${visualizerBodyHTML(artifact.id,false)}</div></div></div>`;
    else if(artifact.type==='image') content=`<div class="artifact-stage"><div class="artifact-frame"><div class="artifact-toolbar"><div><strong>${escapeHTML(artifact.title)}</strong><span class="meta-chip" style="margin-left:7px">2048 × 2048</span></div><div class="artifact-actions"><button class="secondary-button" data-action="export-artifact">${icon('link')} Export</button></div></div><div class="artifact-content generated-image-preview" style="min-height:650px"><span class="image-figure" style="transform:scale(2.1)"><i class="head"></i><i class="torso"></i><i class="arm left"></i><i class="arm right"></i><i class="leg left"></i><i class="leg right"></i></span></div></div></div>`;
    return content;
  }

  function planDocumentHTML(artifact) {
    const deep=artifact.type==='deep-plan';
    return `<article class="editor-document"><div class="doc-kicker">${deep?'Deep Plan':'Implementation Plan'} · Revision ${deep?'2':'3'}</div><h1>${escapeHTML(artifact.title)}</h1><div class="doc-meta"><span>Created by ${activeModel().name}</span><span>${deep?'Exhaustive research':'Standard thoroughness'}</span><span>Artifact ${artifact.id}</span></div>
      <p>${deep?'Build a real native Rust and Slint product slice that establishes runtime boundaries, deterministic evidence, and independently verifiable behavior.':'Reduce tenant-heavy analytics latency without accepting hidden schema risk or an operationally expensive first step.'}</p>
      <h2>Recommended sequence</h2><ol><li>Freeze the representative read-heavy and balanced traffic fixtures.</li><li>Introduce tenant-scoped composite indexes through a non-blocking migration.</li><li>Benchmark query latency, cache behavior, and write amplification.</li><li>Keep one materialized-view candidate in shadow mode for follow-up validation.</li><li>Record exact evidence and preserve a rollback path.</li></ol>
      <h2>Acceptance gates</h2><ul><li>Median read latency below 100 ms for both traffic profiles.</li><li>Write amplification no greater than 18% under peak fixture load.</li><li>No blocking production migration and no hidden provider dependency.</li><li>Every file change, benchmark, and decision linked from the plan artifact.</li></ul>
      <h2>Evidence</h2><p>Query Analyzer benchmark matrix, Schema Reviewer policy analysis, browser-visible result dashboard, and exact migration diff.</p>
      <div class="card-actions" style="justify-content:flex-start"><button class="primary-button" data-action="build-plan" data-artifact-id="${artifact.id}">${icon('bolt')} Approve And Build</button><button class="secondary-button" data-action="revise-plan" data-artifact-id="${artifact.id}">${icon('edit')} Revise</button></div></article>`;
  }

  function subagentThreadHTML(id) {
    const agent=D.subagents.find(a=>a.id===id);
    if(!agent)return `<div class="editor-empty">Subagent not found.</div>`;
    return `<article class="editor-document"><div class="doc-kicker">Read-only child thread · Live projection</div><h1>${escapeHTML(agent.name)}</h1><div class="doc-meta"><span>${escapeHTML(agent.model)}</span><span>Parent: Query Performance</span><span>${escapeHTML(agent.status)}</span><span>${escapeHTML(agent.elapsed)}</span></div>
      <div class="activity-card"><div class="activity-card-title">Current assignment</div><div class="activity-summary">${escapeHTML(agent.task)}</div></div>
      <h2>Ongoing transcript</h2>
      <div class="message assistant"><div class="message-shell"><div class="message-author"><span class="message-avatar">${icon('agent')}</span><strong>${escapeHTML(agent.name)}</strong><span>·</span><span>${escapeHTML(agent.model)}</span></div><div class="message-body"><p>I inspected the assigned repository slice and identified the material constraints. I am preserving exact file paths, benchmark assumptions, and any policy boundary that requires parent mediation.</p></div></div></div>
      <div class="working-animation expanded"><div class="working-head"><span class="working-orb">${icon(agent.status==='blocked'?'warning':'activity')}</span><span class="working-title-wrap"><span class="working-title-line"><strong class="working-title">${agent.status==='blocked'?'Waiting for parent mediation':'Working'}</strong><span class="working-elapsed">${escapeHTML(agent.elapsed)}</span></span><span class="working-subtitle">${escapeHTML(agent.task)}</span></span></div><div class="working-progress-track"><i></i></div><div class="working-receipt"><span>Read-only projection</span><span>Messages update live</span><span>No composer or mutation controls</span></div></div>
      <div class="activity-card"><div class="activity-card-title">Read-only boundary</div><div class="activity-summary">This child transcript intentionally has no composer, approval controls, or tool buttons. Parent mediation remains in the main assistant thread.</div></div></article>`;
  }

  function changeEditorHTML(id) {
    const change=D.fileChanges.find(c=>c.id===id);
    if(!change)return `<div class="editor-empty">Change not found.</div>`;
    const lines=[];
    for(let i=118;i<=175;i++){
      const content=i===128?'pub async fn tenant_usage_query(':i===129?'    pool: &PgPool, tenant_id: TenantId, range: TimeRange,':i===130?') -> Result<Vec<UsagePoint>> {':i===141?'    // Query uses tenant_id + created_at composite index':i===142?'    sqlx::query_as!(UsagePoint, QUERY, tenant_id, range.start, range.end)':i===143?'        .fetch_all(pool).await':i===144?'}':'    // existing implementation detail';
      lines.push(`<span class="editor-line ${i>=128&&i<=164?'highlight':''}"><span style="display:inline-block;width:38px;color:var(--text-faint);user-select:none">${i}</span>${escapeHTML(content)}</span>`);
    }
    return `<div class="artifact-stage"><div class="artifact-frame"><div class="artifact-toolbar"><div><strong>${escapeHTML(change.path)}</strong><span class="meta-chip" style="margin-left:7px">${escapeHTML(change.range)}</span></div><div class="artifact-actions"><span class="meta-chip" style="color:var(--success)">+${change.added}</span><span class="meta-chip" style="color:var(--danger)">−${change.removed}</span></div></div><div class="editor-code"><pre>${lines.join('\n')}</pre></div></div></div>`;
  }

  function goalArtifactHTML(data={}) {
    return `<article class="editor-document"><div class="doc-kicker">Goal Mode · Revision ${data.revision||4}</div><h1>Finish the assistant interaction audit</h1><div class="doc-meta"><span>State: ${data.state||'Running'}</span><span>Phase: ${data.phase||'Validation'}</span><span>Owner: Parent assistant</span></div><p>Repair every visible interaction defect, preserve the PMConcept7 interaction language, and deliver a drop-in concept package with auditable visual and motion evidence.</p><h2>Subgoals</h2><ul><li>Make every menu and sidecar share one collision-safe anchored overlay system.</li><li>Keep thread history visible without relying on hover.</li><li>Exercise every demo trigger and editor route.</li><li>Inspect animations frame by frame and retain unresolved findings.</li></ul><h2>Current blocker</h2><p>${state.activityBlockedDemo?'Production schema changes require explicit database-admin approval.':'No material blocker. The visual and motion validation pass is active.'}</p><h2>Evidence</h2><ul><li>All-theme screenshot matrix</li><li>Menu and sidecar geometry report</li><li>Working Animation motion recording</li><li>Questionnaire morph recording</li><li>Packet-to-feature disposition ledger</li></ul></article>`;
  }

  function documentEditorHTML(tab) {
    return `<article class="editor-document"><div class="doc-kicker">${escapeHTML(tab.kind)}</div><h1>${escapeHTML(tab.title)}</h1><p>${escapeHTML(tab.data?.body||'This concept artifact is open in the Puppet Master file editor workspace.')}</p></article>`;
  }

  function openArtifact(id,{autoDecision=false}={}) {
    const artifact=D.artifacts.find(a=>a.id===id);
    if(!artifact)return;
    openEditorTab({id:`artifact:${id}`,title:artifact.title,iconName:artifact.icon,kind:'artifact',data:{artifactId:id}});
    setStatus(`Opened ${artifact.title}`);
    if(autoDecision&&(artifact.type==='plan'||artifact.type==='deep-plan')) setTimeout(()=>openPlanDecision(id),280);
  }

  function openSubagent(id) {
    const agent=D.subagents.find(a=>a.id===id);
    if(!agent)return;
    openEditorTab({id:`subagent:${id}`,title:`${agent.name} · read-only`,iconName:'agent',kind:'subagent',data:{subagentId:id}});
    toast('Opened read-only child thread',`${agent.name} remains live but cannot be changed here.`,'agent');
  }

  function openChange(id) {
    const change=D.fileChanges.find(c=>c.id===id);
    if(!change)return;
    openEditorTab({id:`change:${id}`,title:change.path.split('/').pop(),iconName:'diff',kind:'change',data:{changeId:id}});
    toast('Opened exact modified span',`${change.path} · ${change.range}`,'diff');
  }

  function menuShell({title,subtitle='',body='',footer='',className=''}) {
    return `<div class="menu-shell ${footer?'':'no-footer'} ${className}"><div class="menu-head"><div class="menu-title-row"><span class="menu-title">${escapeHTML(title)}</span></div>${subtitle?`<div class="menu-subtitle">${escapeHTML(subtitle)}</div>`:''}</div><div class="menu-body">${body}</div>${footer?`<div class="menu-footer">${footer}</div>`:''}</div>`;
  }

  function menuItem({action,id,name,detail='',iconName='sparkles',selected=false,tail='',sidecar='',disabled=false,data={}}) {
    const attrs=Object.entries(data).map(([k,v])=>`data-${k.replace(/[A-Z]/g,m=>'-'+m.toLowerCase())}="${escapeHTML(v)}"`).join(' ');
    return `<button class="menu-item ${selected?'selected':''}" data-action="${action}" ${id?`data-value="${escapeHTML(id)}"`:''} ${sidecar?`data-sidecar="${escapeHTML(sidecar)}"`:''} ${disabled?'disabled':''} ${attrs}><span class="menu-item-icon">${icon(iconName)}</span><span class="menu-item-copy"><strong>${escapeHTML(name)}</strong>${detail?`<small>${escapeHTML(detail)}</small>`:''}</span><span class="menu-item-tail">${tail|| (selected?`<span class="menu-check">${icon('check')}</span>`:'')}${sidecar?icon('chevron'):''}</span></button>`;
  }

  function openSelectorMenu(type,anchor) {
    if (!anchor) return;
    const current=overlays.overlays.get(`selector-${type}`);
    if(current){ overlays.close(`selector-${type}`); return; }
    if(type==='model') return openModelMenu(anchor);
    let html='';
    if(type==='persona') {
      html=menuShell({title:'Persona',subtitle:'Change how the assistant approaches the work',body:D.personas.map(p=>menuItem({action:'select-persona',id:p.id,name:p.name,detail:p.detail,iconName:p.icon,selected:p.id===state.persona})).join(''),footer:'Personas change guidance, not model access or permissions.'});
    } else if(type==='mode') {
      html=menuShell({title:'Mode',subtitle:'Choose how this turn should proceed',body:D.modes.map(m=>menuItem({action:m.sidecar?'noop':'select-mode',id:m.id,name:m.name,detail:m.detail,iconName:m.icon,selected:m.id===state.mode,sidecar:m.sidecar?`mode:${m.id}`:''})).join(''),footer:'Modes are also available by slash command and natural language.'});
    } else if(type==='worktree') {
      html=menuShell({title:'Worktree',subtitle:'Route this thread to a working tree',body:D.worktrees.map(w=>menuItem({action:'select-worktree',id:w.id,name:w.name,detail:w.detail,iconName:w.icon,selected:w.id===state.worktree})).join(''),footer:'The selected worktree is visible in the bottom status bar.'});
    } else if(type==='permissions') {
      html=menuShell({title:'Permissions',subtitle:'Control when Puppet Master must ask',body:D.permissions.map(p=>menuItem({action:'select-permission',id:p.id,name:p.name,detail:p.detail,iconName:p.icon,selected:p.id===state.permissions})).join(''),footer:'Permissions do not change provider authentication or system policy.'});
    } else if(type==='wand') {
      html=menuShell({title:'Assistant capabilities',subtitle:'Independent controls can be active together',body:D.capabilities.map(c=>menuItem({action:'noop',id:c.id,name:c.name,detail:c.description,iconName:c.icon,selected:capabilityIsActive(c.id),sidecar:`capability:${c.id}`})).join(''),footer:'Goal, Plan, Deep Plan, Ask, and Debug also respond to slash commands and natural language.'});
    }
    const pop=overlays.open({id:`selector-${type}`,anchor,html,placement:'top-start',className:`selector-popover ${type}-popover`});
    bindSidecarTriggers(pop,`selector-${type}`);
  }

  function capabilityIsActive(id) {
    const value=state.capabilities[id];
    return value==='on'||value==='auto'||value==='focus'||value==='expanded'||value==='teach'||value==='concise';
  }

  function bindSidecarTriggers(pop,parentId) {
    if(!pop)return;
    $$('[data-sidecar]',pop).forEach(item=>{
      let timer;
      const open=()=>{
        clearTimeout(timer);
        const spec=item.dataset.sidecar;
        let html='';
        if(spec.startsWith('mode:')) html=modeSidecarHTML(spec.split(':')[1]);
        else if(spec.startsWith('capability:')) html=capabilitySidecarHTML(spec.split(':')[1]);
        else if(spec.startsWith('model-effort:')) html=modelEffortSidecarHTML(spec.split(':')[1]);
        if(!html)return;
        const side=overlays.openSidecar({parentId,anchor:item,html,placement:'right-start',className:'selector-sidecar'});
        item.classList.add('focused');
        overlays.overlays.get(parentId).sidecarAnchor=item;
        if(side) side.addEventListener('mouseleave',()=>{
          timer=setTimeout(()=>{
            const parent=overlays.overlays.get(parentId);
            if(parent?.childId) overlays.close(parent.childId);
            item.classList.remove('focused');
          },220);
        });
      };
      item.addEventListener('pointerenter',()=>{ timer=setTimeout(open,90); });
      item.addEventListener('pointerleave',()=>{ clearTimeout(timer); timer=setTimeout(()=>{
        const child=overlays.overlays.get(overlays.overlays.get(parentId)?.childId);
        if(!child?.el.matches(':hover')){
          if(child)overlays.close(child.id);
          item.classList.remove('focused');
        }
      },220); });
      item.addEventListener('click',event=>{ event.preventDefault(); event.stopPropagation(); open(); });
    });
  }

  function modeSidecarHTML(modeId) {
    const current=state.thoroughness[modeId];
    return menuShell({title:modeId==='deep-plan'?'Deep Plan thoroughness':'Plan thoroughness',subtitle:'Stored inside the menu, not the selector label',body:D.planThoroughness.map(value=>menuItem({action:'select-thoroughness',id:value,name:value,detail:thoroughnessDetail(value),iconName:value==='Exhaustive'?'layers':'plan',selected:value===current,data:{mode:modeId}})).join(''),footer:'Selecting a level also selects this mode.'});
  }

  function thoroughnessDetail(value) {
    return {Quick:'Minimal exploration and a concise sequence',Standard:'Balanced repository review and implementation detail',Thorough:'Broader dependency review and stronger evidence',Exhaustive:'Full research, alternatives, risks, and validation design'}[value]||'';
  }

  function capabilitySidecarHTML(capabilityId) {
    const cap=D.capabilities.find(c=>c.id===capabilityId);
    if(!cap)return '';
    const selected=state.capabilities[capabilityId];
    const body=cap.submenu.map(item=>{
      const value=item.id.split('-').slice(1).join('-');
      return menuItem({action:'select-capability',id:item.id,name:item.name,detail:item.detail,iconName:cap.icon,selected:value===selected,data:{capability:capabilityId}});
    }).join('');
    const extra=capabilityId==='lens'&&state.subcompactPending?`<div class="menu-divider"></div><div style="padding:7px"><div class="activity-summary">Subcompact is ready to apply. It will create a recoverable context revision.</div><div class="activity-actions-row"><button class="primary-button" data-action="apply-subcompact">${icon('check')} Apply</button><button class="secondary-button" data-action="cancel-subcompact">Cancel</button></div></div>`:'';
    return menuShell({title:cap.name,subtitle:cap.description,body:body+extra,footer:capabilityId==='lens'?'Mute and Focus apply immediately. Subcompact requires confirmation.':'This capability is independent of the other wand controls.'});
  }

  function modelEffortSidecarHTML(modelId) {
    const model=state.models.find(m=>m.id===modelId);
    if(!model)return '';
    const effortItems=model.efforts.map(value=>menuItem({action:'select-effort',id:value,name:value,detail:`${value} reasoning effort`,iconName:'thought',selected:model.effort===value,data:{modelId}})).join('');
    const fast=model.fast?`<div class="menu-divider"></div>${menuItem({action:'toggle-fast',id:modelId,name:'Fast mode',detail:'Use the provider’s faster route when supported',iconName:'bolt',selected:!!model.fastEnabled,data:{modelId}})}`:'';
    return menuShell({title:`${model.name} controls`,subtitle:'Effort stays inside this sidecar',body:effortItems+fast,footer:model.fast?'Fast mode adds a small animated lightning indicator beside the selected model.':'This model does not expose Fast mode.'});
  }

  function openModelMenu(anchor) {
    const existing=overlays.overlays.get('selector-model');
    if(existing){overlays.closeRoot(existing.rootId);return;}
    const node=document.createElement('div');
    node.className='model-menu';
    node.innerHTML=modelMenuHTML();
    const pop=overlays.open({id:'selector-model',anchor,node,placement:'top-start',className:'model-picker'});
    bindModelMenu(pop);
  }

  function modelMenuHTML() {
    const providers=D.providers.filter(p=>p.configured);
    const selectedProvider=state.providerFilter;
    const filteredModels=state.models.filter(m=>state.providerScope==='favorites'?m.favorite:true).filter(m=>selectedProvider==='all'||m.provider===selectedProvider);
    return `<aside class="provider-rail">
      <button class="provider-button ${selectedProvider==='all'?'active':''}" data-action="filter-provider" data-value="all" title="All configured providers">${icon('model')}</button>
      ${providers.map(p=>`<button class="provider-button ${selectedProvider===p.id?'active':''}" data-action="filter-provider" data-value="${p.id}" title="${escapeHTML(p.name)} · ${escapeHTML(p.account)}"><span class="provider-logo">${escapeHTML(p.mark)}</span></button>`).join('')}
    </aside><section class="model-main"><div class="model-menu-head"><div class="model-tabs"><button class="model-tab ${state.providerScope==='favorites'?'active':''}" data-action="model-scope" data-value="favorites">Favorites</button><button class="model-tab ${state.providerScope==='all'?'active':''}" data-action="model-scope" data-value="all">All</button></div><div class="menu-search"><span>${icon('search')}</span><input type="search" data-action="model-search" placeholder="Search configured models…"></div></div><div class="model-list">${modelListHTML(filteredModels)}</div></section>`;
  }

  function modelListHTML(models,query='') {
    const q=query.toLowerCase();
    const list=models.filter(m=>`${m.name} ${m.detail} ${D.providers.find(p=>p.id===m.provider)?.name||''}`.toLowerCase().includes(q));
    if(!list.length)return `<div class="history-empty">No configured models match this search.</div>`;
    let lastProvider='';
    return list.map(m=>{
      const provider=D.providers.find(p=>p.id===m.provider);
      const section=state.providerFilter==='all'&&state.providerScope==='all'&&provider?.id!==lastProvider?`<div class="menu-section-label">${escapeHTML(provider.name)}</div>`:'';
      lastProvider=provider?.id||'';
      return `${section}<div class="model-row ${m.id===state.model?'selected':''}" data-model-id="${m.id}"><button class="model-provider-logo" data-action="select-model" data-value="${m.id}" title="Select ${escapeHTML(m.name)}">${escapeHTML(provider?.mark||'M')}</button><button class="model-copy" data-action="select-model" data-value="${m.id}" style="border:0;background:transparent;text-align:left;color:inherit"><strong>${escapeHTML(m.name)}</strong><small>${escapeHTML(m.detail)}</small></button><span class="model-row-actions"><button class="favorite-button ${m.favorite?'active':''}" data-action="toggle-favorite" data-value="${m.id}" title="${m.favorite?'Remove from favorites':'Add to favorites'}">${icon('star')}</button><button class="effort-button" data-sidecar="model-effort:${m.id}" title="Effort${m.fast?' and Fast mode':''}">${icon('chevron')}</button></span></div>`;
    }).join('');
  }

  function bindModelMenu(pop) {
    if(!pop)return;
    const updateList=()=>{
      const q=$('[data-action="model-search"]',pop)?.value||'';
      const models=state.models.filter(m=>state.providerScope==='favorites'?m.favorite:true).filter(m=>state.providerFilter==='all'||m.provider===state.providerFilter);
      $('.model-list',pop).innerHTML=modelListHTML(models,q);
      hydrateIcons($('.model-list',pop));
      bindModelEffortTriggers(pop);
    };
    $('[data-action="model-search"]',pop)?.addEventListener('input',updateList);
    bindModelEffortTriggers(pop);
  }

  function bindModelEffortTriggers(pop) {
    const parentId='selector-model';
    $$('[data-sidecar^="model-effort:"]',pop).forEach(item=>{
      if(item.dataset.boundSidecar)return;
      item.dataset.boundSidecar='true';
      let timer;
      const open=()=>{
        clearTimeout(timer);
        const modelId=item.dataset.sidecar.split(':')[1];
        overlays.openSidecar({parentId,anchor:item,html:modelEffortSidecarHTML(modelId),placement:'right-start',className:'model-effort-sidecar'});
      };
      item.addEventListener('pointerenter',()=>{timer=setTimeout(open,90);});
      item.addEventListener('pointerleave',()=>{clearTimeout(timer);});
      item.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();open();});
    });
  }

  function openThemeMenu(anchor) {
    const body=D.themes.map(t=>menuItem({action:'select-theme',id:t.id,name:t.name,detail:t.id.includes('glass')?'Layered translucent material':t.id.includes('light')||t.id==='paper'?'Light interface theme':'Dark interface theme',iconName:'palette',selected:t.id===state.theme})).join('');
    overlays.open({id:'theme-menu',anchor,html:menuShell({title:'Theme',subtitle:'Every concept option is tuned for all eight themes',body,footer:'Theme changes preserve the active thread and mixer state.'}),placement:'bottom-end'});
  }

  function openThreadMenu(anchor) {
    const thread=activeThread();
    const body=[
      menuItem({action:'rename-thread',name:'Rename',detail:'Change this thread title',iconName:'rename'}),
      menuItem({action:thread.pinned?'unpin-thread':'pin-thread',name:thread.pinned?'Unpin thread':'Pin thread',detail:thread.pinned?'Move it back to Recent':'Keep it at the top of history',iconName:thread.pinned?'unpin':'pin'}),
      menuItem({action:'fork-thread',name:'Fork thread',detail:'Create a branch with the full current context',iconName:'fork'}),
      menuItem({action:thread.archived?'restore-thread':'archive-thread',name:thread.archived?'Restore from archive':'Archive thread',detail:thread.archived?'Return it to Recent':'Keep it searchable without cluttering Recent',iconName:thread.archived?'restore':'archive'}),
      menuItem({action:'export-thread',name:'Export transcript',detail:'Create a redacted transcript artifact',iconName:'artifact'}),
      `<div class="menu-divider"></div>`,
      menuItem({action:'delete-thread',name:'Delete thread',detail:'Permanently remove this demo thread',iconName:'trash'})
    ].join('');
    overlays.open({id:'thread-menu',anchor,html:menuShell({title:thread.title,subtitle:'Thread actions',body,footer:'Hovering each message action explains exactly what it will do.'}),placement:'bottom-end'});
  }

  function openThreadRowMenu(anchor,threadId) {
    const thread=state.threads.find(t=>t.id===threadId);
    if(!thread)return;
    const body=[
      menuItem({action:'open-thread-from-menu',id:thread.id,name:'Open thread',detail:thread.summary,iconName:'chat'}),
      menuItem({action:'rename-thread-row',id:thread.id,name:'Rename',detail:'Change its title without opening it',iconName:'rename'}),
      menuItem({action:thread.pinned?'unpin-thread-row':'pin-thread-row',id:thread.id,name:thread.pinned?'Unpin':'Pin',detail:thread.pinned?'Move it to Recent':'Move it to the pinned section',iconName:thread.pinned?'unpin':'pin'}),
      menuItem({action:'fork-thread-row',id:thread.id,name:'Fork',detail:'Create a new branch from its latest state',iconName:'fork'}),
      menuItem({action:thread.archived?'restore-thread-row':'archive-thread-row',id:thread.id,name:thread.archived?'Restore':'Archive',detail:thread.archived?'Return it to Recent':'Keep it searchable in Archived',iconName:thread.archived?'restore':'archive'})
    ].join('');
    overlays.open({id:`thread-row-${thread.id}`,anchor,html:menuShell({title:thread.title,subtitle:thread.time,body,footer:thread.archived?'Archived threads remain fully searchable.':'Status returns when this menu closes.'}),placement:'bottom-start'});
  }

  function openThreadSearch(anchor) {
    const node=document.createElement('div');
    node.className='search-results-menu';
    node.innerHTML=threadSearchHTML();
    const pop=overlays.open({id:'thread-search',anchor,node,placement:'bottom-end'});
    const input=$('[data-action="thread-search-input"]',pop);
    input?.addEventListener('input',()=>{state.searchQuery=input.value;updateThreadSearch(pop);});
    requestAnimationFrame(()=>input?.focus());
  }

  function threadSearchHTML() {
    return `<div class="menu-shell no-footer"><div class="menu-head"><div class="menu-title-row"><span class="menu-title">Search threads</span><span class="shortcut">⌘K</span></div><div class="menu-search"><span>${icon('search')}</span><input type="search" data-action="thread-search-input" value="${escapeHTML(state.searchQuery)}" placeholder="Search titles and message content…"></div><div class="search-scope"><button class="model-tab ${state.searchScope==='current'?'active':''}" data-action="search-scope" data-value="current">Current</button><button class="model-tab ${state.searchScope==='all'?'active':''}" data-action="search-scope" data-value="all">All threads</button><button class="model-tab ${state.searchScope==='archived'?'active':''}" data-action="search-scope" data-value="archived">Archived</button></div></div><div class="menu-body search-results">${threadSearchResultsHTML()}</div></div>`;
  }

  function threadSearchResultsHTML() {
    const q=state.searchQuery.trim().toLowerCase();
    let threads=state.threads;
    if(state.searchScope==='current')threads=threads.filter(t=>t.id===state.activeThread);
    if(state.searchScope==='archived')threads=threads.filter(t=>t.archived);
    if(q)threads=threads.filter(t=>`${t.title} ${t.summary} ${JSON.stringify(D.transcriptScenarios[t.scenario]||[])}`.toLowerCase().includes(q));
    if(!q)threads=threads.slice(0,8);
    if(!threads.length)return `<div class="history-empty">No matching messages or threads.</div>`;
    return threads.map(t=>`<button class="search-result" data-action="search-result" data-value="${t.id}"><span>${icon(t.archived?'archive':'chat')}</span><span class="search-result-copy"><strong>${escapeHTML(t.title)}</strong><small>${escapeHTML(t.summary)}${t.archived?' · Archived':''}</small></span><time>${escapeHTML(t.time)}</time></button>`).join('');
  }

  function updateThreadSearch(pop) {
    const results=$('.search-results',pop);
    if(results){results.innerHTML=threadSearchResultsHTML();hydrateIcons(results);}
  }

  function openActivity(domain,anchor,{pin=false}={}) {
    state.activityDomain=domain;
    renderActivityBar();
    if(pin){
      state.activityPinned=true;
      overlays.closeAll();
      renderActivityDock();
      toast(`${activityDomainMeta(domain).title} pinned`,'The panel now has its own persistent width beside the thread.','pin');
      return;
    }
    if(state.activityPinned){renderActivityDock();return;}
    const meta=activityDomainMeta(domain);
    const node=document.createElement('div');
    node.className='activity-popover';
    node.innerHTML=`<div class="transient-activity-head"><div><span class="head-icon">${icon(meta.icon)}</span><div><strong>${escapeHTML(meta.title)}</strong><small>${escapeHTML(meta.subtitle)}</small></div></div><div><button class="icon-button tiny" data-action="pin-activity" title="Pin this panel beside the thread">${icon('pin')}</button><button class="icon-button tiny" data-action="close-transient-activity" title="Close">${icon('close')}</button></div></div><div class="transient-activity-body">${activityDetailHTML(domain,false)}</div>`;
    overlays.open({id:'activity-popover',anchor,node,placement:'top-center',className:'activity-details-popover',onClose:()=>{if(!state.activityPinned){state.activityDomain=null;renderActivityBar();}}});
  }

  function openContextDrawer() {
    overlays.closeAll();
    if(contextDrawer){closeContextDrawer();return;}
    const drawer=document.createElement('aside');
    drawer.className='context-drawer';
    drawer.innerHTML=`<div class="context-head"><div><span class="context-head-icon">${icon('lens')}</span><div><strong>Context More Details</strong><small>Curated view · live projection</small></div></div><div><button class="secondary-button" data-action="toggle-context-mode">Raw</button><button class="icon-button small" data-action="close-context" title="Close">${icon('close')}</button></div></div><div class="context-scroll">${contextDetailsHTML()}</div>`;
    refs.overlayRoot.append(drawer);
    contextDrawer=drawer;
  }

  function contextDetailsHTML(raw=false) {
    if(raw)return `<section class="context-section"><div class="context-section-title"><span>Redacted raw projection</span><button class="mini-button" data-action="export-context">${icon('artifact')} Export JSON</button></div><div class="editor-code"><pre>{\n  "used_tokens": 128400,\n  "available_tokens": 71600,\n  "cached_tokens": 48320,\n  "model": "${escapeHTML(activeModel().name)}",\n  "mode": "${escapeHTML(activeMode().name)}",\n  "persona": "${escapeHTML(activePersona().name)}",\n  "browser_context": "visible-tab: query-benchmarks",\n  "secrets": "[REDACTED]"\n}</pre></div></section><section class="context-section"><div class="context-section-title">Compaction preview</div><div class="activity-summary">Subcompact would preserve the goal, current plan revision, unresolved question queue, active work receipts, and exact artifact identities while compressing older conversational prose.</div><div class="activity-actions-row"><button class="primary-button" data-action="apply-subcompact">${icon('check')} Apply Subcompact</button><button class="secondary-button" data-action="close-context">Cancel</button></div></section>`;
    return `<div class="context-hero"><div class="context-large-ring"><svg viewBox="0 0 86 86"><circle class="context-track" cx="43" cy="43" r="34"></circle><circle class="context-value" cx="43" cy="43" r="34" pathLength="100"></circle></svg><div style="text-align:center"><strong>64%</strong><small>used</small></div></div><div class="context-stat-grid"><div class="context-stat"><small>Current</small><strong>128.4K</strong></div><div class="context-stat"><small>Available</small><strong>71.6K</strong></div><div class="context-stat"><small>Cached</small><strong>48.3K</strong></div><div class="context-stat"><small>Est. cost</small><strong>$2.84</strong></div></div></div>
      <section class="context-section"><div class="context-section-title"><span>Effective route</span><span class="meta-chip">Live</span></div><div class="activity-list">${activityListRow('model',activeModel().name,'Configured provider route',D.providers.find(p=>p.id===activeModel().provider)?.name||'')}${activityListRow('agent',activeMode().name,activePersona().name,activePermission().name)}${activityListRow('branch',activeWorktree().name,'Execution worktree','Local')}</div></section>
      <section class="context-section"><div class="context-section-title"><span>Source composition</span><span>128.4K</span></div>${[['Current thread','42%'],['Goal + plan','18%'],['Repository files','21%'],['Tool results','12%'],['Artifacts','7%']].map(([name,val])=>`<div class="context-source"><span>${name}</span><span class="bar-track"><i style="--value:${val}"></i></span><span>${val}</span></div>`).join('')}</section>
      <section class="context-section"><div class="context-section-title"><span>Context growth</span><span>Last 20 turns</span></div><div class="dashboard-chart">${[['Messages','56%'],['Tool output','72%'],['Files','45%'],['Cache','81%']].map(([n,v])=>`<div class="bar-row"><span>${n}</span><span class="bar-track"><i style="--value:${v}"></i></span><span>${v}</span></div>`).join('')}</div></section>
      <section class="context-section"><div class="context-section-title"><span>Per-message details</span><button class="mini-button" data-action="compact-context">${icon('lens')} Compact</button></div><div class="context-message-row"><strong>Query investigation request</strong><small>1,240 tokens · pinned by active goal</small></div><div class="context-message-row"><strong>Working Animation evidence</strong><small>8,904 tokens · cached and collapsible</small></div><div class="context-message-row"><strong>Plan revision 3</strong><small>6,280 tokens · durable artifact identity</small></div></section>
      <section class="context-section"><div class="context-section-title"><span>Cost and cache</span></div><div class="context-stat-grid"><div class="context-stat"><small>API billed</small><strong>$1.74</strong></div><div class="context-stat"><small>Plan estimated</small><strong>$0.61</strong></div><div class="context-stat"><small>Combined est.</small><strong>$2.84</strong></div><div class="context-stat"><small>Cache hit</small><strong>87.4%</strong></div></div></section>`;
  }

  function openMixer() {
    const content=document.createElement('div');
    content.className='modal-shell';
    content.innerHTML=`<div class="modal-header"><div class="modal-heading"><span class="modal-heading-icon">${icon('sliders')}</span><div><strong>Concept Mixer</strong><small>Concept-only renderer evaluation; shared state remains stable</small></div></div><button class="icon-button small" data-action="close-modal">${icon('close')}</button></div><div class="modal-body"><div class="mixer-layout"><div><div class="menu-section-label">Curated complete recipes</div><div class="recipe-row">${D.recipes.map(r=>`<button class="recipe-button ${r.id===state.recipe?'active':''}" data-action="select-recipe" data-value="${r.id}"><strong>${escapeHTML(r.name)}</strong><small>${escapeHTML(r.blurb)}</small></button>`).join('')}</div></div><div><div class="menu-section-label">Independent component renderers</div>${D.families.map(f=>`<div class="family-row"><label>${escapeHTML(f.name)}</label><div class="family-options">${f.options.map((name,i)=>`<button class="family-option ${state.family[f.id]===i+1?'active':''}" data-action="select-family-option" data-family="${f.id}" data-value="${i+1}" title="${escapeHTML(name)}">${i+1}</button>`).join('')}</div></div>`).join('')}</div><div><div class="menu-section-label">PMConcept7 theme family</div><div class="theme-grid">${D.themes.map(t=>`<button class="theme-button ${state.theme===t.id?'active':''}" data-action="select-theme" data-value="${t.id}"><span class="theme-swatch" style="--swatch-a:${t.a};--swatch-b:${t.b}"></span><span>${escapeHTML(t.name)}</span></button>`).join('')}</div></div></div></div><div class="modal-footer"><span style="color:var(--text-faint);font-size:8px">Every option is a renderer, not a separate product implementation.</span><div class="modal-footer-actions"><button class="secondary-button" data-action="reset-mixer">Reset</button><button class="primary-button" data-action="close-modal">Done</button></div></div>`;
    openModal(content,{className:'mixer-modal'});
  }

  function openDemoStudio(category=state.selectedDemoCategory) {
    state.selectedDemoCategory=category;
    const content=document.createElement('div');
    content.className='modal-shell demo-studio';
    content.innerHTML=`<div class="modal-header"><div class="modal-heading"><span class="modal-heading-icon">${icon('bolt')}</span><div><strong>Demo Studio</strong><small>Deterministic triggers for the complete assistant surface</small></div></div><button class="icon-button small" data-action="close-modal">${icon('close')}</button></div><div class="modal-body"><div class="demo-layout"><nav class="demo-nav">${D.demos.map(c=>`<button class="demo-nav-button ${c.category===category?'active':''}" data-action="demo-category" data-value="${escapeHTML(c.category)}">${icon(c.icon)}<span>${escapeHTML(c.category)}</span></button>`).join('')}</nav><section class="demo-panel">${demoPanelHTML(category)}</section></div></div><div class="modal-footer"><span style="color:var(--text-faint);font-size:8px">Triggers preserve fixtures, artifact identities, and thread history.</span><div class="modal-footer-actions"><button class="secondary-button" data-action="run-demo-tour">Run guided tour</button><button class="primary-button" data-action="close-modal">Done</button></div></div>`;
    openModal(content,{className:'demo-studio'});
  }

  function demoPanelHTML(category) {
    const group=D.demos.find(c=>c.category===category)||D.demos[0];
    return `<h3>${escapeHTML(group.category)}</h3><p>Trigger a material state directly, then inspect its transcript, editor, panel, or focused surface.</p><div class="demo-grid">${group.items.map(item=>`<button class="demo-trigger" data-action="demo-trigger" data-value="${escapeHTML(item.id)}"><span>${icon(item.icon)}</span><span><strong>${escapeHTML(item.title)}</strong><small>${escapeHTML(item.detail)}</small></span></button>`).join('')}</div>`;
  }

  function openQuestionnaire({prepare=false,restore=false,submitted=false}={}) {
    if(submitted){
      const content=document.createElement('div');
      content.className='modal-shell';
      content.innerHTML=`<div class="modal-header"><div class="modal-heading"><span class="modal-heading-icon">${icon('check')}</span><div><strong>Answers submitted</strong><small>Questionnaire receipt · durable in this thread</small></div></div><button class="icon-button small" data-action="close-modal">${icon('close')}</button></div><div class="modal-body"><div class="decision-summary"><strong>Planning questionnaire</strong><p>Three answers were attached to the next immutable plan revision. You can reopen the receipt from thread history.</p></div></div><div class="modal-footer"><span></span><div class="modal-footer-actions"><button class="primary-button" data-action="close-modal">Done</button></div></div>`;
      openModal(content,{className:'question-modal'});return;
    }
    state.questionSubmitted=false;
    if(!restore) state.questionPage=0;
    const content=document.createElement('div');
    content.className='modal-shell question-shell';
    if(prepare){
      content.innerHTML=questionPrepareHTML();
      openModal(content,{className:'question-modal',dismissible:false});
      setTimeout(()=>{
        if(!activeModal)return;
        animateModalHeight(()=>{content.innerHTML=questionnaireHTML();hydrateIcons(content);});
      },900);
    }else{
      content.innerHTML=questionnaireHTML();
      openModal(content,{className:'question-modal'});
    }
  }

  function questionPrepareHTML() {
    return `<div class="modal-header"><div class="modal-heading"><span class="modal-heading-icon">${icon('sparkles')}</span><div><strong>Preparing questions…</strong><small>Reviewing the goal, plan, and unresolved decisions</small></div></div></div><div class="modal-body"><div class="working-animation"><div class="working-head"><span class="working-orb">${icon('thought')}</span><span class="working-title-wrap"><span class="working-title-line"><strong class="working-title">Finding the smallest useful question set</strong></span><span class="working-subtitle">Your current composer draft and thread position are preserved.</span></span></div><div class="working-progress-track"><i></i></div></div></div>`;
  }

  function questionnaireHTML() {
    const q=D.questions[state.questionPage];
    const answer=state.questionAnswers[q.id];
    return `<div class="modal-header"><div class="modal-heading"><span class="modal-heading-icon">${icon('question')}</span><div><strong>Planning questions</strong><small>${state.questionQueue.length} queued set${state.questionQueue.length===1?'':'s'} · answers never expire passively</small></div></div><button class="icon-button small" data-action="close-modal" title="Close and return later">${icon('close')}</button></div><div class="modal-body"><div class="question-progress">${D.questions.map((_,i)=>`<i class="${i<state.questionPage?'complete':i===state.questionPage?'current':''}"></i>`).join('')}</div><article class="question-card" data-question-id="${q.id}"><div class="question-kicker">Question ${state.questionPage+1} of ${D.questions.length}${q.required?' · Required':''}</div><h2>${escapeHTML(q.title)}</h2><p>${escapeHTML(q.description)}</p>${q.type==='text'?`<textarea class="question-textarea" data-action="question-text" placeholder="${escapeHTML(q.placeholder||'')} ">${escapeHTML(answer||'')}</textarea>`:`<div class="question-options">${q.options.map(o=>`<button class="question-option ${answer===o.id?'selected':''}" data-action="question-answer" data-value="${o.id}"><span class="question-option-mark">${icon('check')}</span><span class="question-option-copy"><strong>${escapeHTML(o.label)}</strong><small>${escapeHTML(o.detail)}</small></span></button>`).join('')}</div>`}<div class="question-error" style="min-height:16px;margin-top:7px;color:var(--danger);font-size:8px"></div></article></div><div class="modal-footer"><div><button class="ghost-button" data-action="skip-question">Skip for now</button><button class="ghost-button" data-action="cancel-questionnaire">Cancel questionnaire</button></div><div class="modal-footer-actions">${state.questionPage>0?`<button class="secondary-button" data-action="question-back">Back</button>`:''}<button class="primary-button" data-action="question-next">${state.questionPage===D.questions.length-1?'Submit answers':'Next'} ${icon(state.questionPage===D.questions.length-1?'check':'chevron')}</button></div></div>`;
  }

  function questionNext() {
    const q=D.questions[state.questionPage];
    if(q.type==='text'){
      const text=$('[data-action="question-text"]',activeModal?.modal)?.value.trim()||'';
      if(text)state.questionAnswers[q.id]=text;
    }
    if(q.required&&!state.questionAnswers[q.id]){
      const err=$('.question-error',activeModal?.modal);if(err)err.textContent='Choose an answer before continuing, or use Skip for now.';
      activeModal?.modal.animate([{transform:'translateX(0)'},{transform:'translateX(-5px)'},{transform:'translateX(4px)'},{transform:'translateX(0)'}],{duration:260,easing:'ease-out'});
      return;
    }
    if(state.questionPage<D.questions.length-1){
      animateModalHeight(()=>{state.questionPage++;const shell=$('.question-shell',activeModal.modal);shell.innerHTML=questionnaireHTML();hydrateIcons(shell);});
    }else{
      state.questionSubmitted=true;
      animateModalHeight(()=>{
        const shell=$('.question-shell',activeModal.modal);
        shell.innerHTML=`<div class="modal-header"><div class="modal-heading"><span class="modal-heading-icon">${icon('check')}</span><div><strong>Submitting answers…</strong><small>Attaching them to the next immutable plan revision</small></div></div></div><div class="modal-body"><div class="working-animation"><div class="working-head"><span class="working-orb">${icon('artifact')}</span><span class="working-title-wrap"><span class="working-title-line"><strong class="working-title">Writing questionnaire receipt</strong></span><span class="working-subtitle">The transcript remains stable while the result is recorded.</span></span></div><div class="working-progress-track"><i></i></div></div></div>`;
      });
      setTimeout(()=>{
        if(!activeModal)return;
        closeModal();
        appendTranscript({kind:'receipt',icon:'check',title:'Planning questions submitted',detail:'Three answers were attached to the pending plan revision.'});
        toast('Answers submitted','The durable receipt is now in the thread.','check');
      },850);
    }
  }

  function openQueuedQuestions() {
    const content=document.createElement('div');content.className='modal-shell';
    content.innerHTML=`<div class="modal-header"><div class="modal-heading"><span class="modal-heading-icon">${icon('layers')}</span><div><strong>Queued questionnaires</strong><small>Durable question sets attached to this thread</small></div></div><button class="icon-button small" data-action="close-modal">${icon('close')}</button></div><div class="modal-body"><div class="activity-list"><button class="activity-list-row" data-action="open-questionnaire-restore"><span>${icon('question')}</span><span class="activity-list-copy"><strong>Planning foundations</strong><small>Question ${state.questionPage+1} of ${D.questions.length} · ${Object.keys(state.questionAnswers).length} answers saved</small></span><span class="activity-list-meta">Open</span></button><button class="activity-list-row" data-action="open-questionnaire"><span>${icon('question')}</span><span class="activity-list-copy"><strong>Runtime constraints</strong><small>4 unanswered questions · created 18m ago</small></span><span class="activity-list-meta">Open</span></button></div><div class="decision-summary" style="margin-top:10px"><strong>No passive expiration</strong><p>These sets remain until the user submits, skips, explicitly cancels, deletes the thread, or returns later.</p></div></div><div class="modal-footer"><span></span><div class="modal-footer-actions"><button class="primary-button" data-action="close-modal">Done</button></div></div>`;
    openModal(content,{className:'question-modal'});
  }

  function openPlanDecision(artifactId) {
    const artifact=D.artifacts.find(a=>a.id===artifactId)||D.artifacts[0];
    const content=document.createElement('div');content.className='modal-shell plan-decision-shell';
    content.innerHTML=planDecisionHTML(artifact,false);
    openModal(content,{className:'plan-decision-modal'});
  }

  function planDecisionHTML(artifact,revisionOpen=false) {
    return `<div class="modal-header"><div class="modal-heading"><span class="modal-heading-icon">${icon(artifact.type==='deep-plan'?'layers':'plan')}</span><div><strong>${escapeHTML(artifact.title)}</strong><small>${artifact.type==='deep-plan'?'Deep Plan':'Plan'} · ready for review</small></div></div><button class="icon-button small" data-action="close-modal">${icon('close')}</button></div><div class="modal-body"><div class="decision-summary"><strong>Recommended first step</strong><p>${artifact.type==='deep-plan'?'Build the native runtime boundary and one real Rust/Slint slice before compiling broader WorkNodes.':'Ship tenant-scoped composite indexes first, validate both traffic profiles, and leave materialized views in shadow mode.'}</p></div><button class="secondary-button" data-action="open-artifact" data-artifact-id="${artifact.id}">${icon('eye')} View full ${artifact.type==='deep-plan'?'Deep Plan':'Plan'} in editor</button><div class="revision-area ${revisionOpen?'open':''}"><div><textarea class="question-textarea" id="plan-revision-text" placeholder="Describe what should change in the next immutable revision…">${escapeHTML(state.planRevisionText)}</textarea></div></div></div><div class="modal-footer"><button class="ghost-button" data-action="cancel-plan-decision">Cancel</button><div class="modal-footer-actions"><button class="secondary-button" data-action="toggle-plan-revision" data-artifact-id="${artifact.id}">${icon('edit')} ${revisionOpen?'Hide revision':'Revise'}</button>${revisionOpen?`<button class="primary-button" data-action="submit-plan-revision" data-artifact-id="${artifact.id}">${icon('send')} Create revision</button>`:`<button class="primary-button" data-action="approve-plan" data-artifact-id="${artifact.id}">${icon('bolt')} Approve And Build</button>`}</div></div>`;
  }

  function openPermissionDecision() {
    const content=document.createElement('div');content.className='modal-shell';
    content.innerHTML=`<div class="modal-header"><div class="modal-heading"><span class="modal-heading-icon">${icon('hand')}</span><div><strong>Approval required</strong><small>Production schema change · policy boundary</small></div></div><button class="icon-button small" data-action="close-modal">${icon('close')}</button></div><div class="modal-body"><div class="decision-summary"><strong>Add two composite indexes?</strong><p>The migration is non-blocking in the fixture. Estimated write amplification is 14.8%, and the rollback removes only the new indexes.</p></div><div class="activity-list">${activityListRow('diff','src/analytics/schema.rs','23 additions · 4 removals','Review')}${activityListRow('chart','Query benchmark evidence','Read-heavy and balanced fixtures','Open')}${activityListRow('shield','Policy','Requires database-admin role or explicit override','Blocked')}</div></div><div class="modal-footer"><button class="ghost-button" data-action="deny-permission">Deny</button><div class="modal-footer-actions"><button class="secondary-button" data-action="open-change" data-change-id="c2">Review change</button><button class="primary-button" data-action="approve-permission">Approve once</button></div></div>`;
    openModal(content,{className:'decision-modal'});
  }

  function openConflictDecision() {
    const content=document.createElement('div');content.className='modal-shell';
    content.innerHTML=`<div class="modal-header"><div class="modal-heading"><span class="modal-heading-icon">${icon('branch')}</span><div><strong>Resolve competing approaches</strong><small>Parent mediation · subagent recommendations differ</small></div></div><button class="icon-button small" data-action="close-modal">${icon('close')}</button></div><div class="modal-body"><div class="question-options"><button class="question-option" data-action="resolve-conflict" data-value="indexes"><span class="question-option-mark">${icon('check')}</span><span class="question-option-copy"><strong>Composite indexes first</strong><small>Safer first step, moderate write overhead, fastest path to production evidence.</small></span></button><button class="question-option" data-action="resolve-conflict" data-value="views"><span class="question-option-mark">${icon('check')}</span><span class="question-option-copy"><strong>Materialized view now</strong><small>Best reads, but adds refresh lag, storage, and an operational failure mode.</small></span></button><button class="question-option" data-action="resolve-conflict" data-value="hybrid"><span class="question-option-mark">${icon('check')}</span><span class="question-option-copy"><strong>Hybrid validation</strong><small>Indexes in production plus a materialized view in shadow mode.</small></span></button></div></div><div class="modal-footer"><button class="ghost-button" data-action="close-modal">Decide later</button><div class="modal-footer-actions"><button class="primary-button" data-action="confirm-conflict" disabled>Use selected approach</button></div></div>`;
    openModal(content,{className:'decision-modal'});
  }

  function appendTranscript(item,{scroll=true}={}) {
    state.transcriptAppend.push({...item,id:item.id||uid('msg')});
    renderTranscript();
    if(scroll) requestAnimationFrame(()=>refs.chatScroll.scrollTo({top:refs.chatScroll.scrollHeight,behavior:'smooth'}));
  }

  async function triggerDemo(id,{fromUI=false}={}) {
    if(fromUI) closeModal();
    if(id.startsWith('work:')) {
      const workId=id.split(':')[1];
      state.workingState=workId;
      state.workingExpanded=workId!=='complete';
      appendTranscript({kind:'working',state:workId,expanded:state.workingExpanded});
      toast(`Working Animation: ${D.workingStates.find(s=>s.id===workId)?.label||workId}`,'The state was added inline to the current transcript.','activity');
      return;
    }
    if(id.startsWith('artifact:')) {
      const artifactId=id.slice('artifact:'.length);
      const artifact=D.artifacts.find(a=>a.id===artifactId);
      if(!artifact)return;
      const kind=artifact.type==='mermaid'?'mermaid':artifact.type==='visualizer'?'visualizer':artifact.type==='image'?'image':artifact.type==='plan'||artifact.type==='deep-plan'?'plan-card':'visualizer';
      appendTranscript({kind,artifact:artifactId});
      openArtifact(artifactId,{autoDecision:artifact.type==='plan'||artifact.type==='deep-plan'});
      toast(`${artifact.title} created`,'The compact result is in chat and the full artifact is open in the editor.','artifact');
      return;
    }
    const handlers={
      'question:prepare':()=>openQuestionnaire({prepare:true}),
      'question:open':()=>openQuestionnaire(),
      'question:queued':()=>openQueuedQuestions(),
      'question:restore':()=>openQuestionnaire({restore:true}),
      'question:submitted':()=>openQuestionnaire({submitted:true}),
      'decision:plan':()=>openPlanDecision('plan-query'),
      'decision:permission':()=>openPermissionDecision(),
      'decision:conflict':()=>openConflictDecision(),
      'activity:goal':()=>openActivity('goal',$('[data-domain="goal"]')),
      'activity:todo':()=>openActivity('todo',$('[data-domain="todo"]')),
      'activity:subagents':()=>openActivity('subagents',$('[data-domain="subagents"]')),
      'activity:changes':()=>openActivity('changes',$('[data-domain="changes"]')),
      'activity:artifacts':()=>openActivity('artifacts',$('[data-domain="artifacts"]')),
      'activity:pin':()=>openActivity(state.activityDomain||'goal',$(`[data-domain="${state.activityDomain||'goal'}"]`),{pin:true}),
      'activity:blocked':()=>{state.activityBlockedDemo=true;openActivity('goal',$('[data-domain="goal"]'));renderActivityBar();},
      'activity:complete':()=>appendTranscript({kind:'working',state:'complete',expanded:false}),
      'thread:long':()=>appendTranscript({kind:'assistant',collapsible:true,text:'This deliberately long response demonstrates the expanded-width transcript and stable collapse behavior.\n\nThe assistant does not force a substantial technical explanation into a narrow bubble. It uses nearly the full readable width of the chat surface, preserves a useful preview, and leaves the message actions outside the prose hierarchy.\n\nWhen collapsed, the fade indicates that more content exists without hiding the central recommendation. Expanding the response animates the maximum block height without jumping the transcript scroll anchor. Search, copy, branch, and re-answer semantics continue to operate on the full message rather than only the visible preview.\n\nThe interaction is particularly important while the editor, pinned history, and pinned Activity Detail panel are all visible. Each region owns an independent width, and the chat yields in a controlled order instead of allowing text, menus, or controls to overlap.\n\nThis final paragraph exists so the fixture exceeds the collapse threshold at every supported density and theme. The result remains readable in Puppet Dark, Midnight, Graphite, Ember, Puppet Light, Paper, Glass Dark, and Glass Light.'}),
      'thread:image':()=>triggerDemo('artifact:generated-dancer'),
      'thread:plan':()=>triggerDemo('artifact:plan-query'),
      'thread:deep-plan':()=>triggerDemo('artifact:deep-plan-runtime'),
      'thread:error':()=>appendTranscript({kind:'error',title:'Browser target changed during inspection',detail:'The selected menu re-rendered while a submenu frame was being captured. Puppet Master preserved the checkpoint, screenshot, and exact trigger so the action can be retried safely.'}),
      'thread:approval':()=>appendTranscript({kind:'receipt',icon:'check',title:'Production index change approved once',detail:'The approval applies only to revision 3 and was recorded with its benchmark evidence.'}),
      'thread:search-hit':()=>{state.searchQuery='materialized';openThreadSearch($('[data-action="open-thread-search"]'));},
      'thread:new-message':()=>appendTranscript({kind:'assistant',text:'This message arrived with spatial continuity: the existing transcript retained its anchor while the new response resolved from a soft offset and blur into its final position.'}),
      'menu:model':()=>openSelectorMenu('model',$('[data-selector="model"]')),
      'menu:mode':()=>openSelectorMenu('mode',$('[data-selector="mode"]')),
      'menu:wand':()=>openSelectorMenu('wand',$('[data-selector="wand"]')),
      'capability:goal':()=>{state.capabilities.goal='on';renderSelectors();toast('Goal Mode enabled','It can also be invoked with /goal or natural language.','target');},
      'capability:subcompact':()=>{state.subcompactPending=true;openSelectorMenu('wand',$('[data-selector="wand"]'));setTimeout(()=>{const item=$('[data-sidecar="capability:lens"]',refs.overlayRoot);item?.click();},120);},
      'command:slash':()=>{refs.composerInput.value='/';refs.composerInput.focus();autoGrowComposer();openSlashMenu();},
      'context:details':()=>openContextDrawer(),
      'thread:archive':()=>{state.archivedExpanded=true;state.historyVisible=true;state.historyFilter='';renderHistoryVisibility();renderHistory();const input=$('#history-filter');if(input)input.focus();toast('Archived threads visible','Search can include only Archived or all threads.','archive');}
    };
    if(handlers[id])handlers[id]();
  }

  function handleAction(action,el,event) {
    const value=el.dataset.value;
    switch(action) {
      case 'toggle-rail': document.body.classList.toggle('rail-collapsed'); break;
      case 'open-demo-studio': openDemoStudio(); break;
      case 'open-mixer': openMixer(); break;
      case 'open-theme-menu': openThemeMenu(el); break;
      case 'select-theme': applyTheme(value); if(activeModal)openMixer(); else overlays.closeAll(); toast(`${D.themes.find(t=>t.id===value)?.name||value} applied`,'All assistant surfaces and artifacts use the selected theme.','palette'); break;
      case 'select-recipe': applyRecipe(value); openMixer(); break;
      case 'select-family-option': state.family[el.dataset.family]=Number(value);state.recipe='custom';applyFamilyClasses();openMixer();break;
      case 'reset-mixer': applyRecipe('refined',false);applyTheme('puppet-dark');openMixer();break;
      case 'close-modal': closeModal(); break;
      case 'demo-category': state.selectedDemoCategory=value;openDemoStudio(value);break;
      case 'demo-trigger': triggerDemo(value,{fromUI:true});break;
      case 'run-demo-tour': closeModal();runDemoTour();break;
      case 'toggle-history': state.historyVisible=!state.historyVisible;renderHistoryVisibility();overlays.closeAll();break;
      case 'unpin-history': state.historyPinned=false;state.historyVisible=false;renderHistoryVisibility();toast('Thread history unpinned','Use the history button to pop it back into view, then pin it again from the toolbar.','unpin');break;
      case 'new-thread': createNewThread();break;
      case 'open-thread-search': openThreadSearch(el);break;
      case 'thread-row-menu': event.stopPropagation();openThreadRowMenu(el,el.dataset.threadId);break;
      case 'toggle-archived': state.archivedExpanded=!state.archivedExpanded;renderHistory();break;
      case 'clear-history-filter': state.historyFilter='';refs.historyFilter.value='';renderHistory();break;
      case 'open-thread-menu': openThreadMenu(el);break;
      case 'open-thread-from-menu': selectThread(value);overlays.closeAll();break;
      case 'rename-thread': renameThread(state.activeThread);break;
      case 'rename-thread-row': renameThread(value);break;
      case 'pin-thread': mutateThread(state.activeThread,{pinned:true,archived:false},'Thread pinned');break;
      case 'unpin-thread': mutateThread(state.activeThread,{pinned:false},'Thread unpinned');break;
      case 'pin-thread-row': mutateThread(value,{pinned:true,archived:false},'Thread pinned');break;
      case 'unpin-thread-row': mutateThread(value,{pinned:false},'Thread unpinned');break;
      case 'archive-thread': mutateThread(state.activeThread,{archived:true,pinned:false},'Thread archived');break;
      case 'restore-thread': mutateThread(state.activeThread,{archived:false},'Thread restored');break;
      case 'archive-thread-row': mutateThread(value,{archived:true,pinned:false},'Thread archived');break;
      case 'restore-thread-row': mutateThread(value,{archived:false},'Thread restored');break;
      case 'fork-thread': forkThread(state.activeThread);break;
      case 'fork-thread-row': forkThread(value);break;
      case 'export-thread': toast('Transcript export created','Secrets were redacted and the document was opened as an artifact.','artifact');openEditorTab({id:'export:thread',title:`${activeThread().title} · transcript`,iconName:'artifact',kind:'document',data:{body:'A redacted transcript export containing messages, receipts, artifact links, and decision records.'}});overlays.closeAll();break;
      case 'delete-thread': confirmDeleteThread(state.activeThread);break;
      case 'search-scope': state.searchScope=value; updateThreadSearch(el.closest('.pm-popover')); $$('.search-scope .model-tab',el.closest('.pm-popover')).forEach(b=>b.classList.toggle('active',b.dataset.value===value));break;
      case 'search-result': selectThread(value);overlays.closeAll();setTimeout(()=>highlightSearchResult(),150);break;
      case 'select-persona': state.persona=value;renderSelectors();renderHeader();overlays.closeAll();toast(`${activePersona().name} persona selected`,activePersona().detail,'person');break;
      case 'select-worktree': state.worktree=value;renderSelectors();overlays.closeAll();toast(`Worktree: ${activeWorktree().name}`,activeWorktree().detail,'branch');break;
      case 'select-permission': state.permissions=value;renderSelectors();overlays.closeAll();toast(`Permissions: ${activePermission().name}`,activePermission().detail,'shield');break;
      case 'select-mode': state.mode=value;renderSelectors();renderHeader();overlays.closeAll();toast(`${activeMode().name} mode selected`,activeMode().detail,activeMode().icon);break;
      case 'select-thoroughness': state.thoroughness[el.dataset.mode]=value;state.mode=el.dataset.mode;renderSelectors();renderHeader();overlays.closeAll();toast(`${activeMode().name} · ${value}`,thoroughnessDetail(value),activeMode().icon);break;
      case 'select-capability': selectCapability(el.dataset.capability,value);break;
      case 'apply-subcompact': state.capabilities.lens='subcompact';state.subcompactPending=false;renderSelectors();overlays.closeAll();closeContextDrawer();appendTranscript({kind:'receipt',icon:'lens',title:'Context Subcompact applied',detail:'A recoverable context revision preserved the goal, plan, question queue, receipts, and artifact identities.'});break;
      case 'cancel-subcompact': state.subcompactPending=false;refreshCapabilitySidecar('lens');break;
      case 'filter-provider': state.providerFilter=value;refreshModelMenu();break;
      case 'model-scope': state.providerScope=value;refreshModelMenu();break;
      case 'select-model': state.model=value;renderSelectors();renderHeader();overlays.closeAll();toast(`${activeModel().name} selected`,D.providers.find(p=>p.id===activeModel().provider)?.name||'Configured provider','model');break;
      case 'toggle-favorite': {const m=state.models.find(m=>m.id===value);if(m)m.favorite=!m.favorite;refreshModelMenu();break;}
      case 'select-effort': {const m=state.models.find(m=>m.id===el.dataset.modelId);if(m)m.effort=value;refreshModelSidecar(m?.id);toast(`${m?.name} effort: ${value}`,'Effort remains inside the model menu.','thought');break;}
      case 'toggle-fast': {const m=state.models.find(m=>m.id===el.dataset.modelId);if(m)m.fastEnabled=!m.fastEnabled;renderSelectors();refreshModelSidecar(m?.id);break;}
      case 'open-activity': openActivity(el.dataset.domain,el);break;
      case 'pin-activity': openActivity(state.activityDomain,$(`[data-domain="${state.activityDomain}"]`),{pin:true});break;
      case 'close-transient-activity': overlays.close('activity-popover');break;
      case 'unpin-activity': state.activityPinned=false;renderActivityDock();if(state.activityDomain)openActivity(state.activityDomain,$(`[data-domain="${state.activityDomain}"]`));break;
      case 'close-activity': state.activityPinned=false;state.activityDomain=null;renderActivityDock();renderActivityBar();break;
      case 'open-subagent': openSubagent(el.dataset.subagentId);break;
      case 'open-change': openChange(el.dataset.changeId);closeModal();break;
      case 'open-artifact': openArtifact(el.dataset.artifactId);break;
      case 'open-goal-artifact': openEditorTab({id:'goal:active',title:'Finish assistant interaction audit',iconName:'target',kind:'goal',data:{revision:4,state:'Running',phase:'Validation'}});break;
      case 'edit-goal': editGoal();break;
      case 'pause-goal': goalLifecycle('Paused');break;
      case 'resume-goal': goalLifecycle('Running');break;
      case 'stop-goal': goalLifecycle('Stopped');break;
      case 'clear-goal': goalLifecycle('Cleared');state.capabilities.goal='off';renderSelectors();break;
      case 'toggle-message': toggleMessage(el.dataset.messageId);break;
      case 'toggle-working': state.workingExpanded=!state.workingExpanded;renderTranscript();break;
      case 'copy-message': navigator.clipboard?.writeText('Copied demo message content').catch(()=>{});toast('Message copied','The full message was copied, including collapsed content.','copy');break;
      case 'edit-message': toast('Edit and branch','Editing a prior user message creates a new branch and preserves this thread.','edit');break;
      case 'branch-message': forkThread(state.activeThread);break;
      case 'retry-turn': appendTranscript({kind:'working',state:'recovering',expanded:true});toast('Retrying from verified inputs','Prior tool effects are not blindly repeated.','redo');break;
      case 'reanswer-turn': forkThread(state.activeThread,'Re-answer');break;
      case 'open-context': openContextDrawer();break;
      case 'close-context': closeContextDrawer();break;
      case 'toggle-context-mode': {const scroll=$('.context-scroll',contextDrawer);if(scroll){const raw=el.textContent.trim()==='Raw';scroll.innerHTML=contextDetailsHTML(raw);el.textContent=raw?'Curated':'Raw';hydrateIcons(contextDrawer);}break;}
      case 'compact-context': state.subcompactPending=true;toast('Subcompact preview ready','Apply or cancel from Context Lens.','lens');break;
      case 'export-context': toast('Redacted JSON exported','Secrets and credential material were removed.','artifact');break;
      case 'open-questionnaire': closeModal();setTimeout(()=>openQuestionnaire(),40);break;
      case 'open-questionnaire-restore': closeModal();setTimeout(()=>openQuestionnaire({restore:true}),40);break;
      case 'question-answer': state.questionAnswers[D.questions[state.questionPage].id]=value;animateModalHeight(()=>{const shell=$('.question-shell',activeModal.modal);shell.innerHTML=questionnaireHTML();hydrateIcons(shell);});break;
      case 'question-next': questionNext();break;
      case 'question-back': animateModalHeight(()=>{state.questionPage=Math.max(0,state.questionPage-1);const shell=$('.question-shell',activeModal.modal);shell.innerHTML=questionnaireHTML();hydrateIcons(shell);});break;
      case 'skip-question': if(state.questionPage<D.questions.length-1){state.questionPage++;animateModalHeight(()=>{const shell=$('.question-shell',activeModal.modal);shell.innerHTML=questionnaireHTML();hydrateIcons(shell);});}else{closeModal();toast('Questionnaire kept for later','Unanswered questions remain queued without expiring.','question');}break;
      case 'cancel-questionnaire': closeModal();appendTranscript({kind:'receipt',icon:'close',title:'Questionnaire explicitly cancelled',detail:'Saved answers were discarded only because the user chose Cancel questionnaire.'});break;
      case 'build-plan': openPlanDecision(el.dataset.artifactId);break;
      case 'approve-plan': closeModal();appendTranscript({kind:'receipt',icon:'bolt',title:'Plan approved and build started',detail:'The approved immutable revision is now the source for orchestration.'});state.workingState='preparing';break;
      case 'toggle-plan-revision': {const artifact=D.artifacts.find(a=>a.id===el.dataset.artifactId);animateModalHeight(()=>{const shell=$('.plan-decision-shell',activeModal.modal);shell.innerHTML=planDecisionHTML(artifact,!$('.revision-area',shell)?.classList.contains('open'));hydrateIcons(shell);});break;}
      case 'submit-plan-revision': state.planRevisionText=$('#plan-revision-text',activeModal.modal)?.value||'';closeModal();appendTranscript({kind:'receipt',icon:'edit',title:'Plan revision requested',detail:state.planRevisionText||'Revision feedback was attached to a new immutable plan draft.'});toast('Creating a new plan revision','The prior plan remains available in history.','edit');break;
      case 'cancel-plan-decision': closeModal();toast('Decision closed','The durable plan card and Build action remain in the thread.','plan');break;
      case 'revise-plan': openPlanDecision(el.dataset.artifactId);setTimeout(()=>$('.plan-decision-shell [data-action="toggle-plan-revision"]')?.click(),80);break;
      case 'approve-permission': closeModal();appendTranscript({kind:'receipt',icon:'check',title:'Schema change approved once',detail:'Approval is scoped to the reviewed revision and recorded evidence.'});break;
      case 'deny-permission': closeModal();appendTranscript({kind:'receipt',icon:'close',title:'Schema change denied',detail:'No production change was applied; the plan and benchmark remain available.'});break;
      case 'resolve-conflict': $$('.question-option',activeModal.modal).forEach(o=>o.classList.toggle('selected',o===el));const confirm=$('[data-action="confirm-conflict"]',activeModal.modal);confirm.disabled=false;confirm.dataset.value=value;break;
      case 'confirm-conflict': closeModal();appendTranscript({kind:'receipt',icon:'branch',title:'Conflict resolved',detail:`Selected ${el.dataset.value||'the reviewed'} approach; parent mediation receipt was recorded.`});break;
      case 'activate-editor-tab': state.activeEditorTab=el.dataset.tabId;renderEditor();break;
      case 'close-editor-tab': event.stopPropagation();closeEditorTab(el.dataset.tabId);break;
      case 'close-editor': state.editorTabs=[];state.activeEditorTab=null;renderEditor();break;
      case 'split-editor': toast('Editor split preview','The selected artifact can occupy an independent editor pane in production.','split');break;
      case 'toggle-mermaid-source': toggleMermaidSource(el);break;
      case 'show-mermaid-source': showMermaidSource();break;
      case 'refresh-artifact': toast('Artifact refreshed','The typed fixture reconciled without flicker or identity loss.','redo');break;
      case 'export-artifact': toast('Artifact export ready','The current rendered version and source are preserved.','artifact');break;
      case 'answer-quiz': answerQuiz(el);break;
      case 'architecture-node': toast(`${el.dataset.node} selected`,'Route, model tier, context boundary, and evidence are available in the editor view.','architecture');break;
      case 'inspect-capability': toast(el.dataset.capability,'Capability ownership and runtime contract selected.','grid');break;
      case 'goal-state': toast(`Goal state: ${el.dataset.state}`,'The lifecycle visualization remains interactive.','target');break;
      case 'retry-error': appendTranscript({kind:'working',state:'recovering',expanded:true});break;
      case 'view-error-evidence': openArtifact('test-evidence');break;
      case 'attach': toast('Attachment picker','Files, folders, images, and artifacts can be attached.','paperclip');break;
      case 'send': sendComposer();break;
      case 'jump-latest': refs.chatScroll.scrollTo({top:refs.chatScroll.scrollHeight,behavior:'smooth'});break;
      case 'noop': break;
    }
  }

  function selectCapability(capabilityId, itemId) {
    const value=itemId.split('-').slice(1).join('-');
    if(capabilityId==='lens'&&value==='subcompact') {
      state.subcompactPending=true;
      refreshCapabilitySidecar('lens');
      toast('Subcompact preview ready','Review the preserved context before applying.','lens');
      return;
    }
    state.capabilities[capabilityId]=value;
    state.subcompactPending=false;
    renderSelectors();
    refreshCapabilitySidecar(capabilityId);
    toast(`${D.capabilities.find(c=>c.id===capabilityId)?.name||capabilityId}: ${capitalize(value)}`,'Capability state updated independently.','wand');
  }

  function refreshCapabilitySidecar(capabilityId) {
    const parent=overlays.overlays.get('selector-wand');
    const anchor=parent?.sidecarAnchor||$(`[data-sidecar="capability:${capabilityId}"]`,parent?.el);
    if(parent&&anchor) overlays.openSidecar({parentId:'selector-wand',anchor,html:capabilitySidecarHTML(capabilityId),placement:'right-start',className:'selector-sidecar'});
  }

  function refreshModelMenu() {
    const pop=overlays.overlays.get('selector-model')?.el;
    if(!pop)return;
    const node=$('.model-menu',pop);
    if(!node)return;
    const oldRect=node.getBoundingClientRect();
    node.innerHTML=modelMenuHTML();
    hydrateIcons(node);
    bindModelMenu(pop);
    overlays.scheduleReposition();
    node.animate([{opacity:.7,transform:'scale(.992)'},{opacity:1,transform:'scale(1)'}],{duration:220,easing:'cubic-bezier(.2,1.1,.3,1)'});
  }

  function refreshModelSidecar(modelId) {
    const parent=overlays.overlays.get('selector-model');
    const anchor=$(`[data-sidecar="model-effort:${modelId}"]`,parent?.el);
    if(parent&&anchor) overlays.openSidecar({parentId:'selector-model',anchor,html:modelEffortSidecarHTML(modelId),placement:'right-start',className:'model-effort-sidecar'});
  }

  function mutateThread(id,patch,message) {
    const thread=state.threads.find(t=>t.id===id);if(!thread)return;
    Object.assign(thread,patch);
    renderHistory();renderHeader();overlays.closeAll();toast(message,thread.title,patch.archived?'archive':patch.pinned?'pin':'restore');
  }

  function createNewThread() {
    const id=uid('thread');
    state.threads.unshift({id,title:'Untitled thread',summary:'New assistant conversation',time:'now',status:'waiting',pinned:false,archived:false,scenario:'design'});
    state.draftByThread[id]='';
    selectThread(id);refs.composerInput.focus();toast('New thread created','Its draft and width state are independent.','plus');
  }

  function renameThread(id) {
    overlays.closeAll();
    const thread=state.threads.find(t=>t.id===id);if(!thread)return;
    const content=document.createElement('div');content.className='modal-shell';
    content.innerHTML=`<div class="modal-header"><div class="modal-heading"><span class="modal-heading-icon">${icon('rename')}</span><div><strong>Rename thread</strong><small>The title changes everywhere without changing history</small></div></div><button class="icon-button small" data-action="close-modal">${icon('close')}</button></div><div class="modal-body"><input class="question-textarea" id="rename-thread-input" style="min-height:42px;resize:none" value="${escapeHTML(thread.title)}"></div><div class="modal-footer"><span></span><div class="modal-footer-actions"><button class="secondary-button" data-action="close-modal">Cancel</button><button class="primary-button" data-action="confirm-rename" data-thread-id="${id}">Rename</button></div></div>`;
    openModal(content,{className:'rename-modal'});
    setTimeout(()=>{const input=$('#rename-thread-input');input?.select();},60);
  }

  function confirmRename(id) {
    const thread=state.threads.find(t=>t.id===id);const input=$('#rename-thread-input',activeModal?.modal);if(!thread||!input)return;
    const value=input.value.trim();if(!value)return;
    thread.title=value;closeModal();renderHistory();renderHeader();toast('Thread renamed',value,'rename');
  }

  function forkThread(id,label='Fork') {
    const source=state.threads.find(t=>t.id===id);if(!source)return;
    const fork={...source,id:uid('fork'),title:`${source.title} · ${label}`,time:'now',pinned:false,archived:false,status:'waiting'};
    state.threads.splice(state.threads.findIndex(t=>t.id===id)+1,0,fork);
    state.draftByThread[fork.id]='';overlays.closeAll();selectThread(fork.id);toast('Thread forked','The original thread remains unchanged.','fork');
  }

  function confirmDeleteThread(id) {
    overlays.closeAll();
    const thread=state.threads.find(t=>t.id===id);if(!thread)return;
    const content=document.createElement('div');content.className='modal-shell';
    content.innerHTML=`<div class="modal-header"><div class="modal-heading"><span class="modal-heading-icon" style="color:var(--danger)">${icon('trash')}</span><div><strong>Delete thread?</strong><small>This is the only action that removes its durable questionnaires</small></div></div></div><div class="modal-body"><div class="decision-summary"><strong>${escapeHTML(thread.title)}</strong><p>Messages, question queues, plan cards, and thread-local drafts will be permanently removed from this concept fixture.</p></div></div><div class="modal-footer"><button class="secondary-button" data-action="close-modal">Keep thread</button><button class="danger-button" data-action="confirm-delete-thread" data-thread-id="${id}">Delete permanently</button></div>`;
    openModal(content,{className:'decision-modal'});
  }

  function deleteThread(id) {
    const index=state.threads.findIndex(t=>t.id===id);if(index<0)return;
    state.threads.splice(index,1);delete state.draftByThread[id];
    if(state.activeThread===id)state.activeThread=state.threads[0]?.id||'';
    closeModal();renderHeader();renderHistory();renderTranscript();toast('Thread deleted','Its durable thread-local state was removed.','trash');
  }

  function highlightSearchResult() {
    const first=$('.message.assistant,.message.user',refs.transcript);if(!first)return;
    first.animate([{boxShadow:'0 0 0 0 rgba(var(--accent-rgb),0)'},{boxShadow:'0 0 0 3px rgba(var(--accent-rgb),.28)'},{boxShadow:'0 0 0 0 rgba(var(--accent-rgb),0)'}],{duration:900,easing:'ease-out'});
    first.scrollIntoView({behavior:'smooth',block:'center'});
  }

  function toggleMessage(id) {
    if(state.messageExpansions.has(id))state.messageExpansions.delete(id);else state.messageExpansions.add(id);
    const before=$(`[data-message-id="${CSS.escape(id)}"]`,refs.transcript)?.getBoundingClientRect().top;
    renderTranscript();
    const after=$(`[data-message-id="${CSS.escape(id)}"]`,refs.transcript)?.getBoundingClientRect().top;
    if(Number.isFinite(before)&&Number.isFinite(after))refs.chatScroll.scrollTop+=after-before;
  }

  function editGoal() {
    const content=document.createElement('div');content.className='modal-shell';
    content.innerHTML=`<div class="modal-header"><div class="modal-heading"><span class="modal-heading-icon">${icon('target')}</span><div><strong>Edit active goal</strong><small>A material change creates a new revision and replanning phase</small></div></div><button class="icon-button small" data-action="close-modal">${icon('close')}</button></div><div class="modal-body"><textarea class="question-textarea" id="goal-edit-text">Finish the assistant interaction audit, repair every visible defect, and retain complete motion evidence.</textarea></div><div class="modal-footer"><span></span><div class="modal-footer-actions"><button class="secondary-button" data-action="close-modal">Cancel</button><button class="primary-button" data-action="confirm-goal-edit">Create revision</button></div></div>`;
    openModal(content,{className:'goal-edit-modal'});
  }

  function goalLifecycle(next) {
    toast(`Goal ${next.toLowerCase()}`,next==='Cleared'?'The Goal projection was cleared without deleting the thread.':'The lifecycle change is distinct and recorded.','target');
    appendTranscript({kind:'receipt',icon:'target',title:`Goal ${next}`,detail:`The active Goal entered the ${next} state and preserved its prior revision history.`});
  }

  function toggleMermaidSource(button) {
    const card=button.closest('.artifact-preview');const body=$('.mermaid-preview-body',card);if(!body)return;
    const showing=body.dataset.source==='true';
    body.dataset.source=String(!showing);
    body.innerHTML=showing?mermaidSVG():`<div class="editor-code"><pre>flowchart LR\n  Chat[Assistant Chat] --> Host[Artifact Host]\n  Host --> Sandbox[Sandbox Renderer]\n  Host --> Ledger[Artifact Ledger]</pre></div>`;
    button.innerHTML=icon(showing?'code':'diagram');
  }

  function showMermaidSource() {
    const tab=state.editorTabs.find(t=>t.id===state.activeEditorTab);if(!tab)return;
    refs.editorCanvas.innerHTML=`<div class="artifact-stage"><div class="artifact-frame"><div class="artifact-toolbar"><strong>Runtime Architecture · Mermaid source</strong><button class="secondary-button" data-action="open-artifact" data-artifact-id="mermaid-runtime">${icon('diagram')} Rendered view</button></div><div class="editor-code"><pre>flowchart LR\n  Chat[Assistant Chat] --> Host[Artifact Host]\n  Host --> Sandbox[Sandbox Renderer]\n  Host --> Ledger[Artifact Ledger]\n  Sandbox -->|Typed bridge| Host</pre></div></div></div>`;hydrateIcons(refs.editorCanvas);
  }

  function answerQuiz(el) {
    const root=el.closest('[data-interactive="quiz"]');
    $$('.question-option',root).forEach(o=>o.classList.toggle('selected',o===el));
    const feedback=$('.quiz-feedback',root);
    feedback.textContent=el.dataset.correct==='true'?'Correct. Route by frontend qualification and required quality tier, then optimize cost among qualified agents.':'Not quite. Qualification and required frontend quality must be established before optimizing cost.';
    feedback.style.color=el.dataset.correct==='true'?'var(--success)':'var(--warning)';
  }

  function openSlashMenu() {
    const anchor=refs.composerInput;
    const q=anchor.value.slice(1).trim().toLowerCase();
    const commands=D.slashCommands.filter(c=>`${c.cmd} ${c.label} ${c.detail}`.toLowerCase().includes(q));
    const html=menuShell({title:'Slash commands',subtitle:'Modes and durable assistant systems',body:commands.map(c=>menuItem({action:'select-slash-command',id:c.cmd,name:c.cmd,detail:`${c.label} · ${c.detail}`,iconName:c.icon})).join('')||'<div class="history-empty">No matching command.</div>',footer:'Goal, Plan, Deep Plan, Ask, and Debug can also be invoked naturally.'});
    const existing=overlays.overlays.get('slash-menu');
    if(existing){$('.popover-content',existing.el).innerHTML=html;hydrateIcons(existing.el);overlays.scheduleReposition();}
    else overlays.open({id:'slash-menu',anchor,html,placement:'top-start',className:'slash-menu-popover'});
  }

  function selectSlashCommand(cmd) {
    refs.composerInput.value=`${cmd} `;autoGrowComposer();overlays.closeAll();refs.composerInput.focus();
  }

  function sendComposer() {
    const text=refs.composerInput.value.trim();if(!text)return;
    state.draftByThread[state.activeThread]='';refs.composerInput.value='';autoGrowComposer();overlays.closeAll();
    appendTranscript({kind:'user',text});
    const lower=text.toLowerCase();
    let mode=null;
    if(/^\/deep-plan\b/.test(lower)||lower.includes('deep plan'))mode='deep-plan';
    else if(/^\/plan\b/.test(lower)||lower.includes('create a plan')||lower.includes('make a plan'))mode='plan';
    else if(/^\/debug\b/.test(lower)||lower.includes('debug this'))mode='debug';
    else if(/^\/ask\b/.test(lower))mode='ask';
    else if(/^\/agent\b/.test(lower))mode='agent';
    if(/^\/goal\b/.test(lower)||lower.includes('goal mode')||lower.includes('persistent goal'))state.capabilities.goal='on';
    if(mode){state.mode=mode;renderSelectors();renderHeader();}
    if(lower.includes('mermaid'))return triggerDemo('artifact:mermaid-runtime');
    if(lower.includes('dashboard'))return triggerDemo('artifact:dashboard-usage');
    if(lower.includes('data explorer'))return triggerDemo('artifact:data-explorer');
    if(lower.includes('question'))return openQuestionnaire({prepare:true});
    if(mode==='plan'||mode==='deep-plan')return triggerDemo(`artifact:${mode==='deep-plan'?'deep-plan-runtime':'plan-query'}`);
    appendTranscript({kind:'working',state:mode==='debug'?'debugging':lower.includes('web')?'web-search':'thinking',expanded:true});
    setTimeout(()=>appendTranscript({kind:'assistant',text:`I interpreted this as ${mode?`${capitalize(mode.replace('-',' '))} mode`:'an Agent request'}. The relevant state is visible inline, and any durable plan, question, file change, or artifact will remain reopenable from the transcript and editor.`}),520);
  }

  function autoGrowComposer() {
    const ta=refs.composerInput;ta.style.height='auto';ta.style.height=`${Math.min(160,Math.max(24,ta.scrollHeight))}px`;
  }

  function updateJumpLatest() {
    const el=refs.chatScroll;const distance=el.scrollHeight-el.scrollTop-el.clientHeight;refs.jumpLatest.hidden=distance<150;
  }

  async function runDemoTour() {
    toast('Guided demo started','Watch the thread, activity panel, editor, and focused surfaces change.','bolt');
    const sequence=['work:web-search','work:browser','work:subagents','artifact:mermaid-runtime','artifact:dashboard-usage','activity:subagents','question:prepare'];
    for(const id of sequence){await sleep(900);await triggerDemo(id);}
  }

  function setupResizers() {
    $$('[data-resize]').forEach(handle=>{
      handle.addEventListener('pointerdown',event=>{
        event.preventDefault();handle.setPointerCapture(event.pointerId);handle.classList.add('dragging');
        const type=handle.dataset.resize;const startX=event.clientX;
        const startAssistant=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--assistant-w'))||$('.assistant-dock').getBoundingClientRect().width;
        const startHistory=refs.threadHistory.getBoundingClientRect().width||state.historyWidth;
        const startActivity=refs.activityDetailDock.getBoundingClientRect().width||state.activityWidth;
        const move=e=>{
          if(type==='assistant')state.assistantWidth=clamp(startAssistant-(e.clientX-startX),430,window.innerWidth-250);
          if(type==='history')state.historyWidth=clamp(startHistory+(e.clientX-startX),170,320);
          if(type==='activity')state.activityWidth=clamp(startActivity+(e.clientX-startX),240,420);
          applyWidths();overlays.scheduleReposition();
        };
        const up=e=>{
          handle.releasePointerCapture?.(event.pointerId);handle.classList.remove('dragging');
          window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up);
          if(type==='assistant')localStorage.setItem('pm56-assistant-width',String(Math.round(state.assistantWidth)));
          if(type==='history')localStorage.setItem('pm56-history-width',String(Math.round(state.historyWidth)));
          if(type==='activity')localStorage.setItem('pm56-activity-width',String(Math.round(state.activityWidth)));
        };
        window.addEventListener('pointermove',move);window.addEventListener('pointerup',up,{once:true});
      });
    });
  }

  function setupTooltips() {
    let tooltip=null;let timer=null;
    document.addEventListener('pointerover',event=>{
      const target=event.target.closest('[data-tooltip]');if(!target)return;
      clearTimeout(timer);timer=setTimeout(()=>{
        tooltip=document.createElement('div');tooltip.className='tooltip';tooltip.textContent=target.dataset.tooltip;refs.overlayRoot.append(tooltip);
        const tr=target.getBoundingClientRect(),er=tooltip.getBoundingClientRect();
        let left=clamp(tr.left+(tr.width-er.width)/2,8,window.innerWidth-er.width-8);let top=tr.top-er.height-7;
        if(top<8)top=tr.bottom+7;tooltip.style.left=`${left}px`;tooltip.style.top=`${top}px`;
      },520);
    });
    document.addEventListener('pointerout',event=>{
      if(!event.target.closest('[data-tooltip]'))return;clearTimeout(timer);if(tooltip){tooltip.remove();tooltip=null;}
    });
  }

  function confirmGoalEdit() {
    const text=$('#goal-edit-text',activeModal?.modal)?.value.trim();if(!text)return;
    closeModal();
    openEditorTab({id:'goal:active',title:'Finish assistant interaction audit',iconName:'target',kind:'goal',data:{revision:5,state:'Running',phase:'Replanning'}});
    appendTranscript({kind:'receipt',icon:'target',title:'Goal revision 5 created',detail:'The material edit entered Replanning; the prior goal revision remains in history.'});
  }

  function updateHistoryPinButton() {
    const button=$('[data-action="unpin-history"], [data-action="pin-history"]',refs.threadHistory);
    if(!button)return;
    button.dataset.action=state.historyPinned?'unpin-history':'pin-history';
    button.title=state.historyPinned?'Unpin thread history':'Pin thread history';
    button.innerHTML=icon(state.historyPinned?'pin':'unpin');
  }

  function auditInvariants() {
    const issues=[];
    const viewport={w:window.innerWidth,h:window.innerHeight};
    const app=refs.app.getBoundingClientRect();
    if(app.right>viewport.w+1||app.bottom>viewport.h+1)issues.push('app-overflow');
    if(state.historyVisible){
      const hr=refs.threadHistory.getBoundingClientRect();
      const style=getComputedStyle(refs.threadHistory);
      if(hr.width<120||hr.height<100||style.visibility==='hidden'||Number(style.opacity)<.9)issues.push('history-not-visible');
    }
    const cr=refs.composerShell.getBoundingClientRect();
    if(cr.left<0||cr.right>viewport.w+1||cr.bottom>viewport.h+1)issues.push('composer-outside-viewport');
    $$('.pm-popover,.pm-modal,.context-drawer').forEach((el,i)=>{
      const r=el.getBoundingClientRect();
      if(r.left<-1||r.top<-1||r.right>viewport.w+1||r.bottom>viewport.h+1)issues.push(`overlay-${i}-outside`);
    });
    const bodyOverflow=document.documentElement.scrollWidth>window.innerWidth+1||document.body.scrollWidth>window.innerWidth+1;
    if(bodyOverflow)issues.push('page-horizontal-overflow');
    return {ok:issues.length===0,issues,viewport,openOverlays:$$('.pm-popover,.pm-modal,.context-drawer').length,historyVisible:state.historyVisible,activityPinned:state.activityPinned};
  }

  function initialize() {
    cacheRefs();
    overlays=new OverlayManager(refs.overlayRoot);
    hydrateIcons(document);
    applyTheme(state.theme);
    applyRecipe('refined',false);
    applyWidths();
    renderHeader();
    renderSelectors();
    renderHistoryVisibility();
    renderHistory();
    updateHistoryPinButton();
    renderActivityBar();
    renderActivityDock();
    renderTranscript();
    openEditorTab({id:'artifact:plan-query',title:'Query Performance Plan',iconName:'plan',kind:'artifact',data:{artifactId:'plan-query'}});
    setupResizers();
    setupTooltips();

    document.addEventListener('click',event=>{
      const actionEl=event.target.closest('[data-action]');
      if(actionEl){
        const action=actionEl.dataset.action;
        if(['filter-data-explorer','filter-periodic','model-search','question-text'].includes(action))return;
        event.preventDefault();
        if(action==='confirm-rename')return confirmRename(actionEl.dataset.threadId);
        if(action==='confirm-delete-thread')return deleteThread(actionEl.dataset.threadId);
        if(action==='confirm-goal-edit')return confirmGoalEdit();
        if(action==='select-slash-command')return selectSlashCommand(actionEl.dataset.value);
        if(action==='pin-history'){state.historyPinned=true;state.historyVisible=true;renderHistoryVisibility();updateHistoryPinButton();toast('Thread history pinned','Its width and visibility now persist.','pin');return;}
        handleAction(action,actionEl,event);
        return;
      }
      const selector=event.target.closest('[data-selector]');
      if(selector){event.preventDefault();openSelectorMenu(selector.dataset.selector,selector);return;}
      const row=event.target.closest('.thread-row[data-thread-id]');
      if(row)selectThread(row.dataset.threadId);
    });

    document.addEventListener('keydown',event=>{
      const row=event.target.closest('.thread-row[data-thread-id]');
      if(row&&(event.key==='Enter'||event.key===' ')){event.preventDefault();selectThread(row.dataset.threadId);}
      if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==='k'){event.preventDefault();openThreadSearch($('[data-action="open-thread-search"]'));}
      if((event.metaKey||event.ctrlKey)&&event.key==='Enter'&&document.activeElement===refs.composerInput){event.preventDefault();sendComposer();}
    });

    refs.historyFilter?.addEventListener('input',()=>{state.historyFilter=refs.historyFilter.value;renderHistory();});
    refs.composerInput.addEventListener('input',()=>{
      state.draftByThread[state.activeThread]=refs.composerInput.value;autoGrowComposer();
      if(refs.composerInput.value.startsWith('/'))openSlashMenu();else if(overlays.overlays.has('slash-menu'))overlays.close('slash-menu');
    });
    refs.composerInput.addEventListener('keydown',event=>{
      if(event.key==='Enter'&&(event.metaKey||event.ctrlKey)){event.preventDefault();sendComposer();}
    });
    refs.chatScroll.addEventListener('scroll',updateJumpLatest,{passive:true});
    window.addEventListener('resize',()=>{applyWidths();overlays.scheduleReposition();});

    document.querySelector('[data-action="toggle-archived"]')?.addEventListener('click',()=>{});
    refs.app.removeAttribute('aria-busy');
    requestAnimationFrame(()=>{refs.chatScroll.scrollTop=refs.chatScroll.scrollHeight;updateJumpLatest();});

    window.PM56_DEMO={
      version:'5.6-pro-final',
      data:D,
      state,
      trigger:(id)=>triggerDemo(id),
      triggers:D.demos.flatMap(g=>g.items.map(i=>i.id)),
      setTheme:(id)=>{applyTheme(id);return state.theme;},
      setRecipe:(id)=>{applyRecipe(id,false);return state.recipe;},
      setFamily:(family,value)=>{if(state.family[family]){state.family[family]=Number(value);applyFamilyClasses();}return {...state.family};},
      openMenu:(name)=>{const anchor=$(`[data-selector="${name}"]`)||$(`[data-action="open-${name}"]`);if(anchor)name==='theme'?openThemeMenu(anchor):openSelectorMenu(name,anchor);},
      closeOverlays:()=>{overlays.closeAll(true);closeModal(true);closeContextDrawer(true);},
      selectThread,
      openActivity:(domain,pin=false)=>openActivity(domain,$(`[data-domain="${domain}"]`),{pin}),
      openQuestionnaire,
      openArtifact,
      audit:auditInvariants,
      snapshot:()=>JSON.parse(JSON.stringify({...state,messageExpansions:[...state.messageExpansions]}))
    };
    console.info('PM Assistant Chat 5.6 Pro ready',window.PM56_DEMO.version);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initialize,{once:true});else initialize();
})();

/* --------------------------------------------------------------------------
   Final overlay safety net
   --------------------------------------------------------------------------
   OverlayManager remains the source of truth. This guard only intervenes when
   a newly mounted/animated surface is outside the usable viewport, detached
   from its launcher, or a sidecar has landed on top of its parent. It is
   intentionally geometry-driven so every theme and concept renderer receives
   the same correction without duplicating menu logic.
*/
(() => {
  const root = document.getElementById('overlay-root');
  if (!root || root.dataset.geometryGuard === 'true') return;
  root.dataset.geometryGuard = 'true';
  const GUTTER = 8;
  let lastAnchor = null;
  let raf = 0;

  const visible = (el) => {
    if (!(el instanceof HTMLElement)) return false;
    const style = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity || 1) > .01 && rect.width > 1 && rect.height > 1;
  };

  const directSurface = (node) => {
    let el = node instanceof Element ? node : node?.parentElement;
    while (el && el.parentElement !== root) el = el.parentElement;
    return el?.parentElement === root ? el : null;
  };

  document.addEventListener('pointerdown', (event) => {
    const candidate = event.target instanceof Element
      ? event.target.closest('[data-selector], [data-action], [data-submenu], button, [role="button"]')
      : null;
    if (candidate && !candidate.closest('.tooltip')) lastAnchor = candidate;
  }, true);

  document.addEventListener('focusin', (event) => {
    const candidate = event.target instanceof Element
      ? event.target.closest('[data-selector], [data-action], [data-submenu], button, [role="button"]')
      : null;
    if (candidate) lastAnchor = candidate;
  }, true);

  function clamp(surface) {
    const rect = surface.getBoundingClientRect();
    const maxW = Math.max(160, innerWidth - GUTTER * 2);
    const maxH = Math.max(120, innerHeight - GUTTER * 2);
    surface.style.maxWidth = `${maxW}px`;
    surface.style.maxHeight = `${maxH}px`;

    let left = Number.parseFloat(surface.style.left);
    let top = Number.parseFloat(surface.style.top);
    if (!Number.isFinite(left)) left = rect.left;
    if (!Number.isFinite(top)) top = rect.top;
    if (rect.width <= maxW) left = Math.min(Math.max(GUTTER, left), innerWidth - GUTTER - rect.width);
    else left = GUTTER;
    if (rect.height <= maxH) top = Math.min(Math.max(GUTTER, top), innerHeight - GUTTER - rect.height);
    else top = GUTTER;
    surface.style.left = `${Math.round(left)}px`;
    surface.style.top = `${Math.round(top)}px`;
    surface.style.right = 'auto';
    surface.style.bottom = 'auto';
  }

  function edgeDistance(a, b) {
    const dx = Math.max(0, Math.max(a.left - b.right, b.left - a.right));
    const dy = Math.max(0, Math.max(a.top - b.bottom, b.top - a.bottom));
    return Math.hypot(dx, dy);
  }

  function intersectionRatio(a, b) {
    const width = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
    const height = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
    return (width * height) / Math.max(1, Math.min(a.width * a.height, b.width * b.height));
  }

  function isAnchoredSurface(surface) {
    const role = surface.getAttribute('role');
    return surface.matches('.pm-menu, .menu-surface, .selector-menu, .popover-surface, .sidecar-menu, .thread-menu, .search-popover, .activity-popover, .context-popover, [data-menu-kind], [data-anchor-overlay]')
      || role === 'menu' || role === 'listbox';
  }

  function attachMain(surface, anchor) {
    if (!isAnchoredSurface(surface)) return;
    if (!anchor?.isConnected || anchor.closest('#overlay-root')) return;
    const a = anchor.getBoundingClientRect();
    let m = surface.getBoundingClientRect();
    const detached = edgeDistance(a, m) > Math.max(88, Math.min(180, innerWidth * .12));
    const suspiciousOrigin = m.left < GUTTER + 2 && m.top < GUTTER + 2 && a.left > 90 && a.top > 90;
    if (!detached && !suspiciousOrigin) return;

    let left = Math.min(Math.max(GUTTER, a.left), innerWidth - GUTTER - m.width);
    let top = a.bottom + 8;
    let placement = 'bottom-start';
    if (top + m.height > innerHeight - GUTTER && a.top - 8 - m.height >= GUTTER) {
      top = a.top - 8 - m.height;
      placement = 'top-start';
    }
    if (top + m.height > innerHeight - GUTTER) top = innerHeight - GUTTER - m.height;
    surface.style.left = `${Math.round(left)}px`;
    surface.style.top = `${Math.round(Math.max(GUTTER, top))}px`;
    surface.dataset.placement = placement;
  }

  function attachSidecar(surface, parent, anchor) {
    if (!parent || !visible(parent)) return;
    const p = parent.getBoundingClientRect();
    const s = surface.getBoundingClientRect();
    const overlap = intersectionRatio(p, s);
    const detached = edgeDistance(p, s) > 38;
    if (overlap < .42 && !detached) return;

    const anchorRect = anchor?.isConnected ? anchor.getBoundingClientRect() : p;
    const canRight = p.right + 8 + s.width <= innerWidth - GUTTER;
    const canLeft = p.left - 8 - s.width >= GUTTER;
    let left;
    let placement;
    if (canRight || !canLeft) {
      left = Math.min(innerWidth - GUTTER - s.width, p.right + 8);
      placement = 'right-start';
    } else {
      left = Math.max(GUTTER, p.left - 8 - s.width);
      placement = 'left-start';
    }
    let top = Math.min(Math.max(GUTTER, anchorRect.top - 8), innerHeight - GUTTER - s.height);
    surface.style.left = `${Math.round(left)}px`;
    surface.style.top = `${Math.round(top)}px`;
    surface.dataset.placement = placement;
    surface.dataset.menuKind = surface.dataset.menuKind || 'sidecar';
  }

  function stabilize() {
    raf = 0;
    const surfaces = [...root.children].filter(visible);
    surfaces.forEach((surface, index) => {
      if (!(surface instanceof HTMLElement)) return;
      const remembered = surface.__pmLauncher;
      const anchor = remembered?.isConnected ? remembered : lastAnchor;
      if (!surface.__pmLauncher && anchor) surface.__pmLauncher = anchor;
      const parent = anchor ? directSurface(anchor) : null;
      if (parent && parent !== surface && isAnchoredSurface(surface)) attachSidecar(surface, parent, anchor);
      else if ((index === 0 || !parent) && isAnchoredSurface(surface)) attachMain(surface, anchor);
      clamp(surface);
    });
  }

  function schedule() {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      stabilize();
      requestAnimationFrame(stabilize);
      setTimeout(stabilize, 80);
      setTimeout(stabilize, 260);
    });
  }

  new MutationObserver((records) => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (node instanceof HTMLElement && node.parentElement === root && lastAnchor) node.__pmLauncher = lastAnchor;
      }
    }
    schedule();
  }).observe(root, { childList: true, subtree: false });

  addEventListener('resize', schedule, { passive: true });
  document.addEventListener('scroll', schedule, { passive: true, capture: true });
  root.addEventListener('transitionrun', schedule, true);
  root.addEventListener('animationstart', schedule, true);
  schedule();
})();

/* Stable concept-inspection API. Existing implementation methods remain
   authoritative; these DOM-backed adapters fill only missing methods so test
   runners and reviewers can drive every deterministic state consistently. */
(() => {
  const demo = window.PM56_DEMO = window.PM56_DEMO || {};
  const click = (selector) => {
    const el = document.querySelector(selector);
    if (!el) return false;
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
    return true;
  };
  const esc = (value) => window.CSS?.escape ? CSS.escape(String(value)) : String(value).replace(/["\\]/g, '\\$&');

  if (typeof demo.closeAll !== 'function') {
    demo.closeAll = () => {
      for (let i = 0; i < 3; i++) document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true }));
      document.querySelectorAll('#overlay-root [data-action="close"], #overlay-root [data-action="dismiss"], #overlay-root [aria-label*="close" i]').forEach((el) => el.dispatchEvent(new MouseEvent('click', { bubbles: true })));
      return true;
    };
  }
  if (typeof demo.setTheme !== 'function') {
    demo.setTheme = (id) => click(`[data-theme="${esc(id)}"], [data-action="select-theme"][data-value="${esc(id)}"]`)
      || (document.documentElement.dataset.theme = id, document.body.dataset.theme = id, true);
  }
  if (typeof demo.setRecipe !== 'function') {
    demo.setRecipe = (id) => click(`[data-recipe="${esc(id)}"], [data-action="select-recipe"][data-value="${esc(id)}"]`);
  }
  if (typeof demo.setOption !== 'function') {
    demo.setOption = (family, option) => click(`[data-family="${esc(family)}"][data-option="${esc(option)}"], [data-action="select-component-option"][data-family="${esc(family)}"][data-value="${esc(option)}"]`);
  }
  if (typeof demo.trigger !== 'function') {
    demo.trigger = (id) => click(`[data-trigger="${esc(id)}"], [data-action="run-trigger"][data-value="${esc(id)}"]`);
  }
  if (typeof demo.listTriggers !== 'function') {
    demo.listTriggers = () => [...new Set([...document.querySelectorAll('[data-trigger], [data-action="run-trigger"][data-value]')]
      .map((el) => el.dataset.trigger || el.dataset.value).filter(Boolean))];
  }
  if (typeof demo.auditInvariants !== 'function') {
    demo.auditInvariants = () => {
      const vw = innerWidth, vh = innerHeight;
      const visible = (el) => {
        const s = getComputedStyle(el), r = el.getBoundingClientRect();
        return s.display !== 'none' && s.visibility !== 'hidden' && Number(s.opacity || 1) > .01 && r.width > 1 && r.height > 1;
      };
      const escaped = [...document.querySelectorAll('#overlay-root > *, .assistant-dock, .composer-shell, .composer-region')]
        .filter(visible).map((el) => ({ el, r: el.getBoundingClientRect() }))
        .filter(({ r }) => r.left < -2 || r.top < -2 || r.right > vw + 2 || r.bottom > vh + 2)
        .map(({ el, r }) => ({ className: el.className, rect: [r.left, r.top, r.right, r.bottom] }));
      const history = document.querySelector('.thread-history, .history-panel, [data-region="thread-history"]');
      const hs = history ? getComputedStyle(history) : null;
      const hr = history?.getBoundingClientRect();
      return {
        pass: escaped.length === 0 && document.documentElement.scrollWidth <= vw + 2,
        escaped,
        horizontalOverflow: document.documentElement.scrollWidth - vw,
        historyVisible: !!history && hs.display !== 'none' && hs.visibility !== 'hidden' && Number(hs.opacity || 1) > .9 && hr.width > 80,
        overlayCount: [...document.querySelectorAll('#overlay-root > *')].filter(visible).length,
      };
    };
  }
})();

/* WAAPI spring fallback: guarantees that portal surfaces retain the same
   polished entrance even on engines that do not support CSS linear() easing.
   It is additive to the normal CSS path and disabled for reduced motion. */
(() => {
  const root = document.getElementById('overlay-root');
  if (!root || root.dataset.waapiSpring === 'true') return;
  root.dataset.waapiSpring = 'true';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const spring = (surface) => {
    if (!(surface instanceof HTMLElement) || reduce.matches || surface.dataset.springPlayed === 'true') return;
    surface.dataset.springPlayed = 'true';
    const isSidecar = surface.dataset.menuKind === 'sidecar'
      || surface.matches('.sidecar-menu,.selector-sidecar,.menu-sidecar')
      || surface.__pmLauncher?.closest?.('#overlay-root');
    const fromX = isSidecar ? (surface.dataset.placement?.startsWith('left') ? '7px' : '-7px') : '0px';
    const fromY = isSidecar ? '0px' : (surface.dataset.placement?.startsWith('top') ? '-5px' : '5px');
    const frames = [
      { opacity: 0, transform: `translate3d(${fromX}, ${fromY}, 0) scale(.965, .945)`, filter: 'blur(2.5px)', offset: 0 },
      { opacity: 1, transform: 'translate3d(0, -1px, 0) scale(1.008, 1.012)', filter: 'blur(0)', offset: .72 },
      { opacity: 1, transform: 'translate3d(0, 0, 0) scale(1, 1)', filter: 'none', offset: 1 },
    ];
    surface.animate(frames, {
      duration: isSidecar ? 340 : 470,
      easing: 'cubic-bezier(.16, 1.16, .26, 1)',
      fill: 'both',
    });
  };
  new MutationObserver((records) => {
    for (const record of records) for (const node of record.addedNodes) if (node.parentElement === root) requestAnimationFrame(() => spring(node));
  }).observe(root, { childList: true });
  [...root.children].forEach(spring);
})();

/* --------------------------------------------------------------------------
   Defensive selector/sidecar fallback
   --------------------------------------------------------------------------
   The shared app menu implementation should always win. This code activates
   only if a selector or submenu launcher produces no portal surface after its
   normal event has had time to run. It prevents a dead control in partially
   loaded/direct-file environments and uses the same portal, SVG, and spring
   language as the primary implementation.
*/
(() => {
  const root = document.getElementById('overlay-root');
  if (!root || root.dataset.selectorFallback === 'true') return;
  root.dataset.selectorFallback = 'true';

  const visibleChildren = () => [...root.children].filter((el) => {
    const style = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity || 1) > .01 && rect.width > 1 && rect.height > 1;
  });
  const closeFallbacks = () => root.querySelectorAll('[data-fallback-surface]').forEach((el) => el.remove());
  const makeIcon = (name) => {
    const paths = {
      check: '<path d="m5 12 4 4L19 6"/>',
      star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z"/>',
      branch: '<circle cx="6" cy="5" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="8" cy="19" r="2"/><path d="M6 7v3a5 5 0 0 0 5 5h5M8 17v-3a6 6 0 0 1 6-6h2"/>',
      wand: '<path d="m4 20 10-10M12 4l.6 1.5L14 6l-1.4.5L12 8l-.6-1.5L10 6l1.4-.5L12 4ZM19 9l.7 1.7L21 11l-1.3.3L19 13l-.7-1.7L17 11l1.3-.3L19 9ZM17 2l.5 1.2L19 4l-1.5.8L17 6l-.5-1.2L15 4l1.5-.8L17 2Z"/>',
      model: '<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M8 9h8M8 13h5M8 17h8"/>',
    };
    return `<svg viewBox="0 0 24 24" aria-hidden="true" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${paths[name] || paths.check}</svg>`;
  };
  const fallbackOptions = {
    persona: [
      ['Product Manager', 'Coordinates scope, quality, and delivery'],
      ['Architect', 'Owns system structure and integration'],
      ['Frontend Specialist', 'Prioritizes interaction and visual polish'],
      ['Auditor', 'Verifies evidence and catches omissions'],
    ],
    mode: [
      ['Agent', 'Build and verify autonomously'],
      ['Ask', 'Answer without changing files'],
      ['Plan', 'Create an implementation plan'],
      ['Deep Plan', 'Create a high-thoroughness plan'],
      ['Debug', 'Investigate and repair a failure'],
    ],
    worktree: [
      ['main', 'Primary working tree'],
      ['feature/query-index', 'Composite-index experiment'],
      ['concept/chat-5-6-pro', 'Assistant concept work'],
      ['review/query-benchmarks', 'Read-only benchmark review'],
    ],
    permissions: [
      ['Ask for approval', 'Pause before material changes'],
      ['Auto accept edits', 'Accept file edits; ask for risk'],
      ['Auto', 'Follow project policy automatically'],
      ['Full Access', 'Allow permitted commands without prompts'],
    ],
    wand: [
      ['Goal Mode', 'Persistent goal, tasks, evidence, and agents'],
      ['Crew', 'Coordinate multiple specialist agents'],
      ['BSD', 'Back Seat Driver advisory behavior'],
      ['Context Lens', 'Mute, Focus, or staged Subcompact'],
      ['ELI5', 'Plain-language explanation assistance'],
      ['Thought Stream', 'Auto or Expanded when permitted'],
    ],
  };

  function place(surface, anchor, side = false) {
    root.append(surface);
    const ar = anchor.getBoundingClientRect();
    const sr = surface.getBoundingClientRect();
    let left = side ? ar.right + 8 : ar.left;
    let top = side ? ar.top - 8 : ar.bottom + 8;
    if (side && left + sr.width > innerWidth - 8) left = Math.max(8, ar.left - sr.width - 8);
    if (!side && top + sr.height > innerHeight - 8 && ar.top - sr.height - 8 >= 8) top = ar.top - sr.height - 8;
    left = Math.min(Math.max(8, left), innerWidth - sr.width - 8);
    top = Math.min(Math.max(8, top), innerHeight - sr.height - 8);
    surface.style.left = `${left}px`;
    surface.style.top = `${top}px`;
    surface.dataset.placement = side ? (left > ar.left ? 'right-start' : 'left-start') : (top > ar.top ? 'bottom-start' : 'top-start');
  }

  function buildFallbackMenu(selector, key) {
    closeFallbacks();
    const surface = document.createElement('div');
    surface.className = 'pm-menu menu-surface fallback-selector-menu';
    surface.dataset.fallbackSurface = 'true';
    surface.dataset.menuKind = 'main';
    surface.setAttribute('role', 'menu');
    surface.style.cssText = 'width:min(360px,calc(100vw - 16px));padding:8px;display:flex;flex-direction:column;gap:3px;';
    const title = document.createElement('div');
    title.className = 'menu-header';
    title.style.cssText = 'display:flex;align-items:center;gap:8px;padding:8px 9px 10px;font-weight:650;';
    title.innerHTML = `${makeIcon(key === 'wand' ? 'wand' : key === 'model' ? 'model' : key === 'worktree' ? 'branch' : 'check')}<span>${key === 'wand' ? 'Assistant tools' : key[0].toUpperCase() + key.slice(1)}</span>`;
    surface.append(title);

    if (key === 'model') {
      const note = document.createElement('div');
      note.className = 'menu-description';
      note.style.cssText = 'padding:0 9px 8px;color:var(--text-secondary);font-size:12px;';
      note.textContent = 'Configured providers · Favorites';
      surface.append(note);
      fallbackOptions.model = [
        ['Sonnet 4.6', 'Anthropic · Favorite · effort and Fast supported'],
        ['Opus 4.6', 'Anthropic · Favorite · highest reasoning'],
        ['Kimi K3', 'Moonshot · long-context coding'],
        ['Qwen 3.8', 'Alibaba · configured coding plan'],
        ['GLM 5.6 SOL', 'z.ai · configured account'],
      ];
    }

    const scroll = document.createElement('div');
    scroll.className = 'menu-scroll';
    scroll.style.cssText = 'display:flex;flex-direction:column;gap:2px;max-height:min(420px,calc(100vh - 100px));overflow:auto;';
    for (const [label, description] of fallbackOptions[key] || []) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'menu-item';
      button.style.cssText = 'display:grid;grid-template-columns:1fr auto;gap:10px;text-align:left;padding:9px 10px;border:0;border-radius:9px;background:transparent;color:inherit;cursor:pointer;';
      button.innerHTML = `<span style="min-width:0"><strong style="display:block;font-size:13px">${label}</strong><span class="menu-description" style="display:block;margin-top:2px;font-size:11px;color:var(--text-secondary);overflow-wrap:anywhere">${description}</span></span>${key === 'model' ? makeIcon('star') : ''}`;
      if ((key === 'model' && /Sonnet/.test(label)) || (key !== 'model' && selector.textContent.includes(label))) button.classList.add('selected');
      if ((key === 'model' && /Sonnet|Opus/.test(label)) || (key === 'mode' && /Plan/.test(label)) || (key === 'wand' && /Context Lens|BSD|Crew|ELI5|Thought Stream/.test(label))) {
        button.dataset.fallbackSidecar = key === 'model' ? 'effort' : key === 'mode' ? 'thoroughness' : label.toLowerCase().replace(/\s+/g, '-');
      }
      button.addEventListener('click', (event) => {
        if (button.dataset.fallbackSidecar) {
          event.stopPropagation();
          buildFallbackSidecar(button, button.dataset.fallbackSidecar, surface);
          return;
        }
        const labelNode = selector.querySelector('[data-selected-label],.selector-label') || selector;
        if (labelNode === selector) selector.dataset.fallbackSelection = label;
        else labelNode.textContent = label;
        closeFallbacks();
      });
      button.addEventListener('pointerenter', () => {
        if (button.dataset.fallbackSidecar) buildFallbackSidecar(button, button.dataset.fallbackSidecar, surface);
      });
      scroll.append(button);
    }
    surface.append(scroll);
    place(surface, selector, false);
  }

  function buildFallbackSidecar(anchor, kind, parent) {
    root.querySelectorAll('[data-fallback-sidecar]').forEach((el) => el.remove());
    const side = document.createElement('div');
    side.className = 'pm-menu sidecar-menu';
    side.dataset.fallbackSurface = 'true';
    side.dataset.fallbackSidecar = 'true';
    side.dataset.menuKind = 'sidecar';
    side.setAttribute('role', 'menu');
    const map = {
      effort: [['Low', 'Fast, economical'], ['Medium', 'Balanced'], ['High', 'More deliberate'], ['Max', 'Highest supported effort'], ['Fast mode', 'Accelerated response path']],
      thoroughness: [['Standard', 'Focused planning'], ['Thorough', 'Broader dependencies and risks'], ['Exhaustive', 'Maximum decomposition and evidence']],
      'context-lens': [['Mute', 'Reduce low-value context immediately'], ['Focus', 'Prioritize current work immediately'], ['Subcompact', 'Preview, then Apply or Cancel']],
      bsd: [['Off', 'No advisor'], ['Auto', 'Intervene when useful'], ['On', 'Continuous advisor']],
      crew: [['Off', 'Single primary agent'], ['Auto', 'Delegate when useful'], ['On', 'Maintain a specialist crew']],
      eli5: [['Off', 'Normal technical language'], ['Auto', 'Simplify when useful'], ['On', 'Always use plain explanations']],
      'thought-stream': [['Auto', 'Expand only when useful and permitted'], ['Expanded', 'Keep permitted reasoning work visible']],
    };
    const options = map[kind] || [['Off', 'Disabled'], ['Auto', 'Use context'], ['On', 'Enabled']];
    side.style.cssText = 'width:min(220px,calc(100vw - 16px));padding:8px;display:flex;flex-direction:column;gap:2px;';
    const heading = document.createElement('div');
    heading.style.cssText = 'padding:7px 9px 8px;font-weight:650;font-size:12px;text-transform:capitalize;';
    heading.textContent = kind.replace(/-/g, ' ');
    side.append(heading);
    options.forEach(([label, desc]) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'menu-item';
      b.style.cssText = 'text-align:left;padding:8px 9px;border:0;border-radius:8px;background:transparent;color:inherit;cursor:pointer;';
      b.innerHTML = `<strong style="display:block;font-size:12px">${label}</strong><span class="menu-description" style="display:block;margin-top:2px;font-size:10px;color:var(--text-secondary);overflow-wrap:anywhere">${desc}</span>`;
      b.addEventListener('click', () => {
        side.querySelectorAll('.selected').forEach((x) => x.classList.remove('selected'));
        b.classList.add('selected');
        if (kind === 'effort' && label === 'Fast mode') document.documentElement.dataset.fastMode = document.documentElement.dataset.fastMode === 'true' ? 'false' : 'true';
      });
      side.append(b);
    });
    place(side, anchor, true);
    parent.dataset.hasFallbackSidecar = 'true';
  }

  document.addEventListener('click', (event) => {
    const selector = event.target instanceof Element ? event.target.closest('[data-selector]') : null;
    if (!selector) return;
    const key = selector.dataset.selector;
    setTimeout(() => {
      if (!selector.isConnected) return;
      if (visibleChildren().length === 0) buildFallbackMenu(selector, key);
    }, 190);
  }, true);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeFallbacks();
  });
  document.addEventListener('pointerdown', (event) => {
    if (event.target instanceof Element && !event.target.closest('#overlay-root,[data-selector]')) closeFallbacks();
  });
})();
