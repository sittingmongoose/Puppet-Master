const paths = {
  chat: '<path d="M5 5.5h14v10H9l-4 3.5z"/>',
  history: '<path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3L4.5 9"/><path d="M4.5 4.5V9H9M12 8v4l2.8 1.7"/>',
  artifact: '<path d="M6 3.5h8l4 4V20H6z"/><path d="M14 3.5V8h4M9 12h6M9 15.5h5"/>',
  search: '<circle cx="10.5" cy="10.5" r="5.5"/><path d="m15 15 4.5 4.5"/>',
  context: '<circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 1 0 16M4 12h16"/>',
  route: '<path d="M5 6h9a3 3 0 0 1 3 3v0a3 3 0 0 1-3 3H9a3 3 0 0 0-3 3v3"/><path d="m4 16 2 2 2-2M17 4v4M15 6h4"/>',
  shield: '<path d="M12 3.5 19 6v5.5c0 4.2-2.9 7.3-7 9-4.1-1.7-7-4.8-7-9V6z"/><path d="m9 12 2 2 4-4"/>',
  bsd: '<path d="M7 5.5h10l2 3v7l-2 3H7l-2-3v-7z"/><path d="M9 10h.01M15 10h.01M9 14.5h6"/>',
  goal: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 4v2M20 12h-2M12 20v-2M4 12h2"/>',
  todo: '<path d="M5 6h2M10 6h9M5 12h2M10 12h9M5 18h2M10 18h9"/>',
  agent: '<circle cx="12" cy="8" r="3"/><path d="M6 20v-2a6 6 0 0 1 12 0v2M5 9H3v4h2M19 9h2v4h-2"/>',
  crew: '<circle cx="8" cy="9" r="2.5"/><circle cx="16" cy="9" r="2.5"/><path d="M3.5 19v-1a4.5 4.5 0 0 1 9 0v1M11.5 19v-1a4.5 4.5 0 0 1 9 0v1"/>',
  diff: '<path d="M8 4v16M16 4v16M5 8h6M13 16h6"/><path d="m9 6 2 2-2 2M15 14l-2 2 2 2"/>',
  question: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.4 2.3c-.8.3-.9.8-.9 1.7M12 17h.01"/>',
  send: '<path d="m4 12 16-8-5.5 16-3-6.5z"/><path d="M11.5 13.5 20 4"/>',
  stop: '<rect x="6" y="6" width="12" height="12" rx="1"/>',
  attach: '<path d="m9 12 5.5-5.5a3 3 0 0 1 4.2 4.2L11 18.4a4.5 4.5 0 0 1-6.4-6.4l7.1-7.1"/><path d="m8 15 6.4-6.4"/>',
  more: '<circle cx="5" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none"/>',
  chevron: '<path d="m8 10 4 4 4-4"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  pin: '<path d="m9 4 6 6M8 9l7-4 4 4-4 7M10 14l-6 6"/>',
  popout: '<path d="M10 5H5v14h14v-5M13 5h6v6M19 5l-8 8"/>',
  dock: '<rect x="4" y="4" width="16" height="16" rx="1"/><path d="M14 4v16"/>',
  branch: '<path d="M6 4v9a4 4 0 0 0 4 4h8M6 9h5a4 4 0 0 0 4-4V4"/><circle cx="6" cy="4" r="1.5"/><circle cx="18" cy="17" r="1.5"/>',
  restore: '<path d="M5 8V4h4M5.5 5.5A8 8 0 1 1 4 14"/><path d="M12 8v4l3 2"/>',
  copy: '<rect x="8" y="8" width="11" height="11" rx="1"/><path d="M16 8V5H5v11h3"/>',
  edit: '<path d="M5 19h4l10-10-4-4L5 15zM13.5 6.5l4 4"/>',
  warning: '<path d="M12 4 3.5 19h17z"/><path d="M12 9v4M12 16.5h.01"/>',
  offline: '<path d="M5 16a5 5 0 0 1 6.5-4.8M14.5 12.2A5 5 0 0 1 19 16M8 19h8"/><path d="M4 4l16 16"/>',
  sync: '<path d="M7 7h10l-2.5-2.5M17 17H7l2.5 2.5M19 7a7 7 0 0 1 0 10M5 17A7 7 0 0 1 5 7"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  error: '<circle cx="12" cy="12" r="9"/><path d="m9 9 6 6M15 9l-6 6"/>',
  play: '<path d="m8 5 11 7-11 7z"/>',
  pause: '<path d="M8 5v14M16 5v14"/>',
  eye: '<path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z"/><circle cx="12" cy="12" r="2.5"/>',
  bell: '<path d="M7 10a5 5 0 0 1 10 0v4l2 2H5l2-2zM10 19h4"/>'
};

export function icon(name, className = "") {
  const body = paths[name] ?? paths.more;
  return `<svg class="icon ${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
}
