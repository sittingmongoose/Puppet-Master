window.PMIcons = (() => {
  const S = inner => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + inner + "</svg>";
  const map = {
    chats: S('<path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H9l-4 3.5v-3.5H6.5A2.5 2.5 0 0 1 4 13.5z"/><path d="M8 8.5h8M8 11.5h5"/>'),
    search: S('<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.4-4.4"/>'),
    send: S('<path d="M4.5 12 20 4.5 15.5 19.5l-4-5.5z"/><path d="M11.5 14 20 4.5"/>'),
    stop: S('<rect x="6.5" y="6.5" width="11" height="11" rx="1.5" fill="currentColor" stroke="none"/>'),
    close: S('<path d="M6 6l12 12M18 6 6 18"/>'),
    kebab: S('<circle cx="12" cy="5.5" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="18.5" r="1.4" fill="currentColor" stroke="none"/>'),
    chevDown: S('<path d="M6.5 9.5 12 15l5.5-5.5"/>'),
    chevRight: S('<path d="M9.5 6.5 15 12l-5.5 5.5"/>'),
    chevUp: S('<path d="M6.5 14.5 12 9l5.5 5.5"/>'),
    check: S('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
    copy: S('<rect x="8.5" y="8.5" width="11" height="11" rx="1.5"/><path d="M15.5 8.5V6A1.5 1.5 0 0 0 14 4.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5"/>'),
    edit: S('<path d="M14.5 5.5l4 4L8 20H4v-4z"/><path d="M12.5 7.5l4 4"/>'),
    info: S('<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5"/><circle cx="12" cy="7.8" r="1" fill="currentColor" stroke="none"/>'),
    pin: S('<path d="M9 4h6l-1 6 3.5 3.5H6.5L10 10z"/><path d="M12 13.5V20"/>'),
    gear: S('<circle cx="12" cy="12" r="3"/><path d="M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2M6 6l1.6 1.6M16.4 16.4 18 18M18 6l-1.6 1.6M7.6 16.4 6 18"/>'),
    goal: S('<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none"/>'),
    todo: S('<path d="M4 6.5h9M4 12h9M4 17.5h9"/><path d="m16.5 5.5 1.8 1.8L21.5 4M16.5 11l1.8 1.8 3.2-3.3M16.5 16.5l1.8 1.8 3.2-3.3"/>'),
    agents: S('<circle cx="8.5" cy="8.5" r="3"/><circle cx="16.5" cy="9.5" r="2.4"/><path d="M3.5 19c.5-3 2.5-4.5 5-4.5s4.5 1.5 5 4.5M13.8 14.9c2.3.2 4 1.6 4.5 4.1"/>'),
    diff: S('<circle cx="6.5" cy="6.5" r="2.5"/><circle cx="6.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="12" r="2.5"/><path d="M6.5 9v6M9 7.5c4.5 1 6 2 8.5 3.5"/>'),
    activity: S('<path d="M3.5 12h4l2.5-6.5 4 13 2.5-6.5h4"/>'),
    file: S('<path d="M6.5 3.5h7L18.5 8v12.5h-12z"/><path d="M13.5 3.5V8H18"/>'),
    globe: S('<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.6 2.4 3.8 5.2 3.8 8.5s-1.2 6.1-3.8 8.5c-2.6-2.4-3.8-5.2-3.8-8.5s1.2-6.1 3.8-8.5z"/>'),
    attach: S('<path d="M15.5 8.5 9 15a2.8 2.8 0 0 0 4 4l7-7a5.3 5.3 0 0 0-7.5-7.5l-7 7"/>'),
    lens: S('<path d="M3.5 12S7 5.5 12 5.5 20.5 12 20.5 12 17 18.5 12 18.5 3.5 12 3.5 12z"/><circle cx="12" cy="12" r="3"/>'),
    lensOff: S('<path d="M4 4l16 16"/><path d="M9.9 5.9c.7-.2 1.4-.4 2.1-.4 5 0 8.5 6.5 8.5 6.5a17.6 17.6 0 0 1-3 3.8M6.2 7.4A16.8 16.8 0 0 0 3.5 12s3.5 6.5 8.5 6.5c1.2 0 2.3-.4 3.3-1"/>'),
    mute: S('<path d="M5 9.5h3.5L13 5.5v13l-4.5-4H5z"/><path d="M16.5 9.5 21 14M21 9.5 16.5 14"/>'),
    focus: S('<circle cx="12" cy="12" r="3"/><path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16"/>'),
    compact: S('<path d="M4 7h16M4 12h16M4 17h16"/><path d="M7.5 4.5 12 7l4.5-2.5M7.5 19.5 12 17l4.5 2.5"/>'),
    play: S('<path d="M8 5.5v13l10-6.5z"/>'),
    pause: S('<path d="M8.5 5.5v13M15.5 5.5v13"/>'),
    layers: S('<path d="m12 3.5 8.5 4.7L12 12.9 3.5 8.2z"/><path d="m4.5 12.5 7.5 4.2 7.5-4.2M4.5 16.5l7.5 4.2 7.5-4.2"/>'),
    editorOpen: S('<path d="M10 4.5H5A1.5 1.5 0 0 0 3.5 6v13A1.5 1.5 0 0 0 5 20.5h13a1.5 1.5 0 0 0 1.5-1.5v-5"/><path d="M14 3.5h6.5V10M20.5 3.5 11 13"/>'),
    history: S('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3.5 2.5"/>'),
    plus: S('<path d="M12 5v14M5 12h14"/>'),
    jumpLatest: S('<path d="M12 4.5v11M6.5 10 12 15.5 17.5 10"/><path d="M5.5 19.5h13"/>'),
    warn: S('<path d="M12 4 21 19.5H3z"/><path d="M12 10v4.5"/><circle cx="12" cy="17" r="0.9" fill="currentColor" stroke="none"/>'),
    question: S('<circle cx="12" cy="12" r="8.5"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.4 2.3c-.8.3-.9 1-.9 1.7"/><circle cx="12" cy="16.8" r="1" fill="currentColor" stroke="none"/>'),
    calendar: S('<rect x="4" y="5.5" width="16" height="14.5" rx="1.5"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>'),
    timer: S('<circle cx="12" cy="13.5" r="7"/><path d="M12 10.5v3.5l2.5 1.5M9.5 3.5h5M12 3.5v3"/>'),
    collapse: S('<path d="M6 14.5 12 9l6 5.5"/>'),
    expand: S('<path d="M6 9.5 12 15l6-5.5"/>'),
    popout: S('<rect x="4" y="8.5" width="11.5" height="11.5" rx="1.5"/><path d="M9 4.5h10.5V15M19.5 4.5 12 12"/>'),
    dock: S('<rect x="4" y="4.5" width="16" height="15" rx="1.5"/><path d="M13.5 4.5v15"/>'),
    sparkle: S('<path d="M12 3.5 13.8 9 19.5 10.5 13.8 12 12 17.5 10.2 12 4.5 10.5 10.2 9z"/><path d="M18.5 15.5l.9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9z"/>'),
    home: S('<path d="m4 11 8-7 8 7"/><path d="M6 9.5V20h12V9.5"/>'),
    folder: S('<path d="M3.5 6.5A1.5 1.5 0 0 1 5 5h4l2 2.5h8a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 19 19.5H5A1.5 1.5 0 0 1 3.5 18z"/>'),
    terminal: S('<rect x="3.5" y="5" width="17" height="14" rx="1.5"/><path d="m7.5 9.5 3 2.5-3 2.5M13 15h4"/>'),
    flask: S('<path d="M9.5 3.5h5M10.5 3.5v5L5 17.5A2 2 0 0 0 6.8 20.5h10.4a2 2 0 0 0 1.8-3L13.5 8.5v-5"/><path d="M7.5 14h9"/>'),
    ship: S('<path d="M4 15.5 12 4l8 11.5z"/><path d="M4 19.5h16"/>'),
    graph: S('<path d="M4 4v16h16"/><path d="m7.5 14 3.5-4.5 3 2.5 4.5-6"/>'),
    branch: S('<circle cx="6.5" cy="6" r="2.3"/><circle cx="6.5" cy="18" r="2.3"/><circle cx="17.5" cy="8" r="2.3"/><path d="M6.5 8.3v7.4M15.4 9.2c-3 1.4-6.6 2-8.9 5.3"/>'),
    inbox: S('<path d="M3.5 13.5 6 5h12l2.5 8.5V19h-17z"/><path d="M3.5 13.5h5l1.5 2.5h4l1.5-2.5h5"/>'),
    wand: S('<path d="M4 20 15 9"/><path d="m13.5 4.5.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9zM19 10l.6 1.4L21 12l-1.4.6L19 14l-.6-1.4L17 12l1.4-.6z"/>'),
    star: S('<path d="m12 4 2.4 5 5.6.7-4.1 3.8 1.1 5.5-5-2.8-5 2.8 1.1-5.5L4 9.7 9.6 9z"/>'),
    shield: S('<path d="M12 3.5 19 6v6c0 4.5-3 7.5-7 8.5-4-1-7-4-7-8.5V6z"/><path d="m9 11.5 2.2 2.2L15.5 9"/>'),
    zap: S('<path d="M13 3.5 5 13.5h6l-1 7 8-10h-6z"/>'),
    rewind: S('<path d="M11 12 20 6v12z"/><path d="M4 12 13 6v12z"/>')
  };
  function hydrate(root) {
    (root || document).querySelectorAll("i[data-ico]").forEach(el => {
      el.innerHTML = map[el.dataset.ico] || "";
      el.classList.add("pmq-ico");
    });
  }
  function get(name) {
    return map[name] || "";
  }
  return { hydrate, get, map };
})();
