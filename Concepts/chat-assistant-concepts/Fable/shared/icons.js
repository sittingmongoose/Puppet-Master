// Fable — inline SVG interface symbols. No emoji anywhere in the system.
// Icons are stroke-based 24-unit paths rendered at requested size.

const PATHS = {
  send: 'M4 12 20 4l-4 16-5-6zM11 14l9-10',
  stop: 'M7 7h10v10H7z',
  copy: 'M9 9h10v12H9zM5 15V3h10',
  edit: 'M4 20h4L19 9l-4-4L4 16zM13 7l4 4',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 10v6M12 7v.5',
  more: 'M5 12h.5M12 12h.5M19 12h.5',
  close: 'M6 6l12 12M18 6 6 18',
  check: 'M4 13l5 5L20 6',
  chevronDown: 'M6 9l6 6 6-6',
  chevronUp: 'M6 15l6-6 6 6',
  chevronLeft: 'M15 6l-6 6 6 6',
  chevronRight: 'M9 6l6 6-6 6',
  search: 'M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM20 20l-4.8-4.8',
  pin: 'M9 4h6l-1 6 3 3v2H7v-2l3-3zM12 15v6',
  history: 'M12 8v5l3 2M3.5 12a8.5 8.5 0 1 1 2.5 6M3.5 12H7M3.5 12 2 10',
  thread: 'M5 5h14v11H10l-5 4z',
  artifact: 'M6 3h9l4 4v14H6zM14 3v5h5',
  diff: 'M7 4v16M17 4v16M7 9h6M17 15h-6',
  goal: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zM12 13a1 1 0 1 0 0-2',
  todo: 'M4 6h2v2H4zM9 7h11M4 11h2v2H4zM9 12h11M4 16h2v2H4zM9 17h11',
  subagent: 'M12 4v5M12 9 6 14M12 9l6 5M4 17h4v4H4zM16 17h4v4h-4zM10 4h4',
  crew: 'M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM16 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 20a5 5 0 0 1 9-2M12 20a5 5 0 0 1 9-1',
  ring: 'M12 21a9 9 0 1 0-9-9M3 12a9 9 0 0 0 2.6 6.4',
  lens: 'M11 17a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM19.5 19.5 15.3 15.3M8.5 11H14M11 8.5V14',
  gauge: 'M12 20a8 8 0 1 1 8-8M12 12l4-3M12 20h8',
  attach: 'M8 12l6.5-6.5a3.5 3.5 0 0 1 5 5L11 19a5.5 5.5 0 0 1-8-8l7.5-7.5',
  warning: 'M12 3 2 20h20zM12 10v5M12 17.5v.5',
  offline: 'M4 4l16 16M8.5 16.5A4 4 0 0 1 7 9a6 6 0 0 1 9.5-3.6M19 10a4 4 0 0 1 1.5 6.8',
  cloud: 'M7 18a4.5 4.5 0 0 1-.7-8.9A6 6 0 0 1 18 10a4 4 0 0 1-1 7.9z',
  replay: 'M4 5v6h6M4.5 11A8 8 0 1 1 6 16.9',
  snapshot: 'M4 7h4l2-2h4l2 2h4v12H4zM12 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7',
  branch: 'M7 4v9M7 13a4 4 0 0 0 4 4h2M17 9v11M17 9a4 4 0 0 0-4-4h-2M7 22a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM7 8a2 2 0 1 0 0-4M17 5a2 2 0 1 0 0 4',
  rewind: 'M11 6 4 12l7 6M20 6l-7 6 7 6',
  worktree: 'M12 3v6M6 15v-3a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v3M4 15h4v6H4zM16 15h4v6h-4zM10 3h4',
  port: 'M8 8V4h8v4M6 8h12v6a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4zM12 18v3',
  test: 'M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3M8 15h8',
  debug: 'M12 20a6 6 0 0 0 6-6v-3a6 6 0 1 0-12 0v3a6 6 0 0 0 6 6zM12 20v-9M4 13h2M18 13h2M5 7l2.5 2M19 7l-2.5 2M9 4.5 10.5 7M15 4.5 13.5 7',
  log: 'M5 3h14v18H5zM8 8h8M8 12h8M8 16h5',
  backup: 'M12 3v10M8 9l4 4 4-4M5 17h14M5 21h14',
  server: 'M4 4h16v7H4zM4 13h16v7H4zM7 7.5h.5M7 16.5h.5',
  settings: 'M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM19 12a7 7 0 0 0-.2-1.6l2-1.5-2-3.4-2.3 1a7 7 0 0 0-2.7-1.6L13.4 2h-2.8l-.4 2.9a7 7 0 0 0-2.7 1.6l-2.3-1-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .5.1 1.1.2 1.6l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 2.7 1.6l.4 2.9h2.8l.4-2.9a7 7 0 0 0 2.7-1.6l2.3 1 2-3.4-2-1.5c.1-.5.2-1 .2-1.6z',
  spark: 'M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z',
  effort: 'M5 19a8 8 0 0 1 14-5M12 11l4 4M12 19h.5',
  fast: 'M13 3 5 13h5l-1 8 8-10h-5z',
  eye: 'M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  eyeOff: 'M4 4l16 16M9.9 5.9A9.5 9.5 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-3.4 4M6 7.5A16.5 16.5 0 0 0 2.5 12S6 18.5 12 18.5c1 0 2-.2 2.9-.5M10 10.2a3 3 0 0 0 3.9 3.9',
  mute: 'M4 9v6h4l6 5V4L8 9zM18 9l4 6M22 9l-4 6',
  focus: 'M12 8v8M8 12h8M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z',
  compress: 'M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5',
  expand: 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5',
  popout: 'M9 5H5v14h14v-4M14 4h6v6M20 4 11 13',
  dockin: 'M15 20h4V6h-14v4M4 14h6v6M4 20l9-9',
  bell: 'M6 16v-5a6 6 0 1 1 12 0v5l2 2H4zM10 21h4',
  browser: 'M3 5h18v14H3zM3 9h18M6 7h.5M9 7h.5',
  terminal: 'M4 5h16v14H4zM7 9l3 3-3 3M12 15h5',
  folder: 'M3 6h6l2 2h10v12H3zM3 6v14',
  file: 'M6 3h9l4 4v14H6zM14 3v5h5',
  image: 'M4 5h16v14H4zM8 11a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM4 17l5-5 4 4 3-3 4 4',
  report: 'M6 3h12v18H6zM9 8h6M9 12h6M9 16h4',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3.5 2',
  pause: 'M8 5v14M16 5v14',
  play: 'M7 5v14l12-7z',
  redo: 'M20 5v6h-6M19.5 11A8 8 0 1 0 18 16.9',
  wave: 'M3 12c2-5 4-5 6 0s4 5 6 0 4-5 6 0',
  key: 'M14 11a4.5 4.5 0 1 0-4.4 4.5L14 11zM14 11l6 6-2 2M17 14l-2 2',
  user: 'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0',
  provider: 'M12 3l8 4.5v9L12 21l-8-4.5v-9zM12 12l8-4.5M12 12v9M12 12 4 7.5',
  question: 'M9 9a3 3 0 1 1 4.6 2.5c-1 .7-1.6 1.3-1.6 2.5M12 17.5v.5M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z',
  drawer: 'M4 4h16v16H4zM4 14h5a3 3 0 0 0 6 0h5',
  swap: 'M7 4 3 8l4 4M3 8h13M17 12l4 4-4 4M21 16H8',
  privacy: 'M12 3l7 3v6c0 4.4-3 7.5-7 9-4-1.5-7-4.6-7-9V6z',
  dot: 'M12 13a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z',
};

export function icon(name, size = 16, strokeWidth = 1.7) {
  const d = PATHS[name] || PATHS.dot;
  return `<span class="pm-icon" aria-hidden="true"><svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg></span>`;
}

// Abstract provider marks — neutral geometric glyphs, deliberately not brand logos.
const PROVIDER_MARKS = {
  Anthropic: 'M12 4 4 20h4l4-9 4 9h4z',
  OpenAI: 'M12 4a8 8 0 1 0 8 8M20 12a8 8 0 0 0-8-8M12 8a4 4 0 1 0 4 4',
  Alibaba: 'M5 8h14M5 16h14M8 8c0 5 8 3 8 8M16 8c0 5-8 3-8 8',
  Google: 'M12 4a8 8 0 1 0 8 8h-8',
  Moonshot: 'M16 4a8 8 0 1 0 4 10 7 7 0 0 1-4-10z',
  xAI: 'M5 5l14 14M19 5 5 19M12 3v4M12 17v4',
  DeepSeek: 'M4 12c3-6 13-6 16 0-3 6-13 6-16 0zM12 14a2 2 0 1 0 0-4',
  Mistral: 'M4 19V5h3v3h3V5h4v3h3V5h3v14h-4v-6h-2v6h-4v-6H8v6z',
  Free: 'M12 3l2.2 5.4L20 9l-4.4 3.8L17 19l-5-3-5 3 1.4-6.2L4 9l5.8-.6z',
};

export function providerMark(provider, size = 16) {
  const d = PROVIDER_MARKS[provider] || PATHS.provider;
  return `<span class="pm-icon pm-provider-mark" aria-hidden="true"><svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg></span>`;
}

export const ICON_NAMES = Object.keys(PATHS);
