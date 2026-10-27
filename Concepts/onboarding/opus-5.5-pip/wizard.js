/* The onboarding window around Pip's stage (Opus 5.5 concept).
   Screens, flow and the director: each screen's state (and what the pointer is over) becomes a scene
   on the stage. The words are PMConcept7's onboarding copy; Pip's own lines are new. */
(function () {
  'use strict';
  const L = window.PMLogo, TH = L.THEMES, $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  const FAMS = ['friendly', 'glass', 'basic', 'retro'];
  const THEMES10 = L.THEME_ORDER;

  /* --------------------------------------------------------------- state */
  const S = {
    theme: 'friendly-dark', screen: 'welcome', history: [], hover: null,
    where: 'this', begin: 'new', name: 'Book club website', vcs: 'git', online: false, backup: null, away: 'home',
    ai: { claude: 'checking', codex: 'checking', antigravity: 'checking', cursor: 'checking' },
    phase: 0, reduced: false, width: 'full', open: true, rev: 0
  };
  try {
    const q = new URLSearchParams(location.search);
    if (TH[q.get('theme')]) S.theme = q.get('theme');
    if (q.get('screen')) S.screen = q.get('screen');
    if (q.get('reduced') === '1') S.reduced = true;
    if (/^(full|laptop|narrow|phone)$/.test(q.get('width') || '')) S.width = q.get('width');
  } catch (e) { /* file:// */ }
  const root = document.documentElement;
  if (root.getAttribute('data-reduced-motion') === '1') S.reduced = true;
  const famOf = (t) => TH[t].family;
  const schemeOf = (t) => TH[t].scheme;

  /* ------------------------------------------------------------- chapters */
  const CHAPTERS = [['welcome', 'Welcome'], ['computer', 'Computer'], ['project', 'Project'], ['ai', 'AI'], ['ready', 'Ready']];
  const FLOW = ['welcome', 'look', 'where', 'begin', 'name', 'safe', 'away', 'review', 'creating', 'ai', 'ready'];
  const ICON = {
    monitor: '<path d="M3 5h18v11H3zM8 20h8M12 16v4"/>', link: '<path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1"/>',
    server: '<path d="M4 4h16v6H4zM4 14h16v6H4zM8 7h.01M8 17h.01"/>', sprout: '<path d="M12 20v-8M12 12c0-4-3-6-7-6 0 4 3 6 7 6zM12 12c0-4 3-6 7-6 0 4-3 6-7 6z"/>',
    folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>', restore: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5M12 8v4l3 2"/>',
    home: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>', globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>', cloud: '<path d="M7 18a5 5 0 1 1 .9-9.9A6 6 0 0 1 19 10a4 4 0 0 1-1 8z"/>', drive: '<path d="M3 13l3-8h12l3 8v6H3zM3 13h18M17 16h.01"/>',
    check: '<path d="M5 12l5 5 9-10"/>', edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>', spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6"/>',
    chat: '<path d="M4 5h16v11H9l-5 4z"/>', list: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>', stack: '<path d="M12 3l9 5-9 5-9-5zM3 13l9 5 9-5"/>',
    palette: '<path d="M12 3a9 9 0 1 0 0 18c1 0 2-1 1-2.5S14 15 16 15h2a3 3 0 0 0 3-3 9 9 0 0 0-9-9z"/><circle cx="7.5" cy="11" r="1"/><circle cx="12" cy="7.5" r="1"/><circle cx="16.5" cy="11" r="1"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>', back: '<path d="M15 18l-6-6 6-6"/>', play: '<path d="M8 5v14l11-7z"/>',
    sound: '<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/>', mute: '<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16.5 9.5l5 5M21.5 9.5l-5 5"/>'
  };
  const icon = (k, sz) => `<svg class="ob-ic" width="${sz || 20}" height="${sz || 20}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[k] || ''}</svg>`;

  /* -------------------------------------------------------------- screens */
  // Each screen: chapter, words, a body, the footer, and scene(S, hover) for the stage.
  const LOOK_LINES = { friendly: 'Soft and cosy. I like it.', glass: 'Ooh, shiny. Am I glass now?', basic: 'Clean and calm. Very tidy.', retro: 'A real monitor! I glow now.' };
  const SCREENS = {
    welcome: {
      chapter: 'welcome', eyebrow: 'Welcome', title: 'Welcome to Puppet Master',
      lead: 'Describe what you want to make. Puppet Master plans it with you, then coordinates the work.',
      body: () => `<ul class="ob-promise">${[['chat', 'Say what you want in your own words'], ['check', 'Check the plan before anything starts'], ['stack', 'Puppet Master coordinates the work']].map(([i, t], k) => `<li style="--i:${k}">${icon(i, 18)}<span>${t}</span></li>`).join('')}</ul>
        <p class="ob-meet"><b>Meet Pip.</b> Pip is every agent Puppet Master directs, and you hold the strings. It will walk you through setup.</p>`,
      foot: { secondary: ['Skip', 'skip'], primary: ['Get started', 'next'] },
      scene: () => ({ chapter: 'welcome', props: [], pip: { mood: 'idle' }, wakeSay: "Oh! Hi. I'm Pip.", label: 'Wake', cmd: 'pip --wake' })
    },
    look: {
      chapter: 'welcome', eyebrow: 'Make it yours', title: 'Pick a look',
      lead: 'Pictures, movement and sound all follow this look. Pip dresses for it too. Change it any time.',
      body: () => {
        const fam = famOf(S.theme), sch = schemeOf(S.theme), nier = fam === 'nier';
        return `<div class="ob-looks" role="radiogroup" aria-label="Look">${FAMS.map((f) => {
          const t = f + '-' + sch, on = !nier && f === fam;
          return `<button type="button" class="ob-look" role="radio" aria-checked="${on}" data-look="${f}" data-hover="look:${f}">
            <span class="ob-look-art">${L.svg({ theme: t, form: 'tile', px: 64, decorative: true })}</span>
            <span class="ob-look-t"><b>${f[0].toUpperCase() + f.slice(1)}</b><small>${{ friendly: 'Felt diorama · warm and playful', glass: 'Liquid glass · bright and airy', basic: 'Clean diagram · calm and precise', retro: 'Terminal · phosphor and paper' }[f]}</small></span></button>`;
        }).join('')}</div>
        <div class="ob-row ob-row-tight"><span class="ob-label">Light or dark</span><div class="ob-seg" role="radiogroup" aria-label="Light or dark">${['light', 'dark'].map((m) => `<button type="button" role="radio" aria-checked="${sch === m}" data-scheme="${m}">${m[0].toUpperCase() + m.slice(1)}</button>`).join('')}</div></div>
        <label class="ob-check" data-hover="look:nier"><input type="checkbox" data-nier ${nier ? 'checked' : ''}><span class="ob-check-box"></span><span><b>NieR Mode</b><small>Ink on parchment, a YoRHa Pip that hovers like a Pod, its own sounds.</small></span></label>`;
      },
      foot: { primary: ['Continue', 'next'] },
      scene: (h) => ({ chapter: 'welcome', props: [{ id: 'palette', kind: 'palette', slot: 'side' }], pip: { mood: h ? 'think' : 'idle', look: 'palette' }, say: h ? LOOK_LINES[h] || 'NieR? I can do stoic.' : 'Dress me up. It changes everything.', target: 'palette', label: 'Select look', cmd: `pip dress ${h || famOf(S.theme)}${h ? ' --try' : ''}` })
    },
    where: {
      chapter: 'computer', eyebrow: 'The computer', title: 'Where should Puppet Master do the work?',
      lead: 'Most people use this computer. You can add others later.',
      body: () => choices('where', [
        ['this', 'monitor', 'This computer', 'Everything stays here. The easiest start.', true],
        ['connect', 'link', 'Connect this device', 'Use a Puppet Master you already have on another computer.'],
        ['server', 'server', 'Set up or restore a Server', 'A NAS, home server or cloud computer that stays on.']
      ]) + `<ul class="ob-checks">${[['212 GB free'], ['Safe History ready'], ['Online']].map(([t]) => `<li>${icon('check', 16)}${t}</li>`).join('')}</ul>`,
      foot: { primary: ['Continue', 'next'] },
      scene: (h) => {
        const b = h || S.where, pv = !!h && h !== S.where;
        const props = b === 'connect' ? [{ id: 'laptop', kind: 'laptop', slot: 'pairA', preview: pv }, { id: 'phone', kind: 'phone', slot: 'pairB', preview: pv }]
          : [{ id: b === 'server' ? 'server' : 'laptop', kind: b === 'server' ? 'server' : 'laptop', slot: 'side', preview: pv }];
        return { chapter: 'computer', props, pip: { mood: pv ? 'think' : 'idle', look: props[0].id }, say: { this: 'Right here works great.', connect: "Let's tie your devices together.", server: "A server never sleeps. Lucky thing." }[b], target: props[0].id, label: { this: 'This computer', connect: 'Connect device', server: 'Server' }[b], cmd: `pip lower ${props.map((p) => p.kind).join(' ')}${pv ? ' --preview' : ''}` };
      }
    },
    begin: {
      chapter: 'project', eyebrow: 'Your Project', title: 'How should your Project begin?',
      lead: 'A Project keeps one thing you are making: its files, plans and history.',
      body: () => choices('begin', [
        ['new', 'sprout', 'Start a new Project', 'Begin with an empty folder', true],
        ['existing', 'folder', 'Use work that already exists', 'A folder, an online Project, or files on another device'],
        ['restore', 'restore', 'Restore a Project', 'From a backup']
      ]) + `<button type="button" class="ob-link" data-act="later">Set up a Project later</button>`,
      foot: { primary: ['Continue', 'next'] },
      scene: (h) => {
        const b = h || S.begin, pv = !!h && h !== S.begin, kind = { new: 'page', existing: 'folder', restore: 'restore' }[b];
        return { chapter: 'project', props: [{ id: kind, kind, slot: 'side', preview: pv }], pip: { mood: pv ? 'think' : 'idle', look: kind }, say: { new: 'A blank page. My favourite.', existing: "Bring it in. I'll learn my way round.", restore: 'Back from the archive, good as new.' }[b], target: kind, label: { new: 'New Project', existing: 'Existing work', restore: 'Restore' }[b], cmd: `pip project --${b}${pv ? ' --preview' : ''}` };
      }
    },
    name: {
      chapter: 'project', eyebrow: 'Your Project', title: 'Name your Project', lead: "Use words you'll recognise later.",
      body: () => `<label class="ob-field"><span class="ob-label">Project name</span><input type="text" id="obName" value="${esc(S.name)}" placeholder="Book club website" maxlength="80" autocomplete="off" spellcheck="false"></label>
        <p class="ob-hint" id="obNameHint">${nameHint()}</p>`,
      foot: { primary: ['Continue', 'next'] },
      scene: () => {
        const n = S.name.trim(), mood = !n ? 'think' : n.length > 60 ? 'alert' : 'idle';
        return { chapter: 'project', props: [{ id: 'sign', kind: 'sign', slot: 'side', params: { text: n } }], pip: { mood, look: 'sign' }, say: !n ? 'What shall we call it?' : n.length > 60 ? "That won't fit on my sign!" : `“${n.length > 26 ? n.slice(0, 25) + '…' : n}”. Lovely.`, target: 'sign', label: n ? n : 'Awaiting name', cmd: `pip sign "${n.length > 18 ? n.slice(0, 17) + '…' : n}"` };
      }
    },
    safe: {
      chapter: 'project', eyebrow: 'Keeping it safe', title: 'Keep your work safe',
      lead: 'Every version is saved on this computer. Online copies and backups are optional.',
      body: () => `<div class="ob-rows">
        <div class="ob-srow" data-hover="safe:history">${icon('shield')}<div><b>Every version saved on this computer</b><small>Safe History: undo any change, any time</small></div>
          <div class="ob-seg ob-seg-sm" role="radiogroup" aria-label="Kept with">${[['git', 'Git'], ['jj', 'Jujutsu']].map(([k, t]) => `<button type="button" role="radio" aria-checked="${S.vcs === k}" data-vcs="${k}">${t}</button>`).join('')}</div></div>
        <div class="ob-srow" data-hover="safe:online">${icon('cloud')}<div><b>Online copy</b><small>Keeps a copy on a website like GitHub</small></div>
          <div class="ob-seg ob-seg-sm" role="radiogroup" aria-label="Online copy">${[[false, 'Not now'], [true, 'GitHub']].map(([k, t]) => `<button type="button" role="radio" aria-checked="${S.online === k}" data-online="${k}">${t}</button>`).join('')}</div></div>
        <div class="ob-srow" data-hover="safe:backup">${icon('drive')}<div><b>Backup</b><small>A full copy you can restore from</small></div>
          <div class="ob-seg ob-seg-sm" role="radiogroup" aria-label="Backup">${[[null, 'Later'], ['nas', 'Home NAS']].map(([k, t]) => `<button type="button" role="radio" aria-checked="${S.backup === k}" data-backup="${k}">${t}</button>`).join('')}</div></div>
      </div>`,
      foot: { primary: ['Continue', 'next'] },
      scene: (h) => {
        const props = [{ id: 'vault', kind: 'vault', slot: S.online || S.backup || h ? 'pairA' : 'side' }];
        const online = S.online || h === 'safe:online', backup = S.backup || h === 'safe:backup';
        if (online) props.push({ id: 'cloud', kind: 'cloud', slot: 'hi', preview: !S.online });
        if (backup) props.push({ id: 'backup', kind: 'backup', slot: 'pairB', preview: !S.backup });
        return { chapter: 'project', props, pip: { mood: 'idle', look: h === 'safe:online' ? 'cloud' : h === 'safe:backup' ? 'backup' : 'vault' }, say: h === 'safe:online' ? 'A copy in the cloud, just in case.' : h === 'safe:backup' ? 'A backup box. Sensible.' : 'Every version goes in the vault.', target: 'vault', label: 'Safe History', cmd: `pip vault --${S.vcs}${S.online ? ' --github' : ''}${S.backup ? ' --nas' : ''}` };
      }
    },
    away: {
      chapter: 'project', eyebrow: 'Access', title: 'Use it away from home?',
      lead: () => `${esc(S.name.trim() || 'Your Project')} can stay reachable when you're out. You can change this any time.`,
      body: () => choices('away', [
        ['home', 'home', 'Only at home for now', 'On your home network or VPN', true],
        ['anywhere', 'globe', 'Also away from home', 'Tailscale, built into Puppet Master: sign in once']
      ]),
      foot: { primary: ['Continue', 'next'] },
      scene: (h) => {
        const b = h || S.away, pv = !!h && h !== S.away;
        const props = b === 'anywhere' ? [{ id: 'house', kind: 'house', slot: 'pairA', preview: pv }, { id: 'globe', kind: 'globe', slot: 'pairB', preview: pv }] : [{ id: 'house', kind: 'house', slot: 'side', preview: pv }];
        return { chapter: 'project', props, pip: { mood: pv ? 'think' : 'idle', look: props[props.length - 1].id }, say: b === 'anywhere' ? "I'll come with you. Anywhere." : "Home it is. I'll keep the lights on.", target: props[props.length - 1].id, label: b === 'anywhere' ? 'Anywhere' : 'Home only', cmd: `pip reach --${b}${pv ? ' --preview' : ''}` };
      }
    },
    review: {
      chapter: 'project', eyebrow: 'Review', title: () => `Ready to create ${esc(S.name.trim() || 'your Project')}`,
      lead: 'Nothing has been created yet. Check it, then create it in one step.',
      body: () => `<div class="ob-review">${reviewRows().map(([g, v, at], i) => `<div class="ob-rv" style="--i:${i}"><span class="ob-rv-k">${g}</span><span class="ob-rv-v">${esc(v)}</span><button type="button" class="ob-link ob-rv-e" data-go="${at}">${icon('edit', 14)}Edit</button></div>`).join('')}</div>`,
      foot: { primary: ['Create Project', 'next'] },
      scene: () => ({ chapter: 'project', props: [{ id: 'clipboard', kind: 'clipboard', slot: 'side', params: { ticks: Math.min(4, S.reviewTicks || 0), rows: 4 } }], pip: { mood: (S.reviewTicks || 0) >= 4 ? 'happy' : 'think', look: 'clipboard' }, say: (S.reviewTicks || 0) >= 4 ? 'All checked. Ready when you are.' : 'Let me check everything…', target: 'clipboard', label: 'Review', cmd: `pip check --all  ${S.reviewTicks || 0}/4` })
    },
    creating: {
      chapter: 'project', eyebrow: 'Creating', title: () => `Creating ${esc(S.name.trim() || 'your Project')}`,
      lead: 'This takes a moment. You can close the window; it keeps going.',
      body: () => `<ol class="ob-phases">${phases().map(([t], i) => `<li data-state="${i < S.phase ? 'done' : i === S.phase ? 'run' : 'wait'}"><span class="ob-ph-dot">${i < S.phase ? icon('check', 14) : ''}</span>${esc(t)}</li>`).join('')}</ol>`,
      foot: () => ({ primary: [S.phase >= phases().length ? 'Continue' : 'Working…', 'next', S.phase < phases().length] }),
      scene: () => {
        const ph = phases(), done = S.phase >= ph.length;
        const props = ph.slice(0, S.phase).map(([, icn, hue], i) => ({ id: 'b' + i, kind: 'block', stack: i, ground: true, params: { icon: icn, hue } }));
        const line = { folder: 'Laying the first block…', history: 'Saving the very first version…', cloud: 'Making the online copy…', globe: 'Opening a door for later…', check: 'Checking it all holds…' };
        return { chapter: 'project', props, pip: { mood: done ? 'happy' : 'dots', work: !done, look: props.length ? props[props.length - 1].id : [1, 1] }, say: done ? 'Built! Every block in place.' : line[ph[S.phase][1]] || 'Working…', target: props.length ? props[props.length - 1].id : null, label: done ? 'Complete' : 'Building', cmd: done ? 'pip build  done' : `pip build ${ph[S.phase][1]}  ${S.phase + 1}/${ph.length}` };
      }
    },
    ai: {
      chapter: 'ai', eyebrow: 'AI', title: 'Choose what powers Puppet Master',
      lead: 'Use an AI subscription or API account you already have. You can add more later.',
      body: () => `<div class="ob-providers">${PROVIDERS.map(([k, n, sub]) => `<div class="ob-prov" data-state="${S.ai[k]}" data-hover="ai:${k}"><span class="ob-prov-ic">${n[0]}</span><div><b>${n}</b><small>${sub}</small></div><span class="ob-prov-s">${S.ai[k] === 'ready' ? icon('check', 15) + 'Ready' : S.ai[k] === 'off' ? 'Not signed in' : '<i class="ob-spin"></i>Checking…'}</span></div>`).join('')}</div>
        <div class="ob-links"><button type="button" class="ob-link">See all providers</button><button type="button" class="ob-link" data-act="noai">I don't have any of these</button></div>`,
      foot: { secondary: ['Skip for now', 'next'], primary: ['Continue', 'next'] },
      scene: () => {
        const ready = PROVIDERS.filter(([k]) => S.ai[k] === 'ready');
        const props = PROVIDERS.map(([k, n], i) => ({ id: 'o' + k, kind: 'orb', slot: 'o' + (i + 1), scale: .9, params: { lit: S.ai[k] === 'ready', label: n[0], hue: ['e', 'b', 'c', 'd'][i] } }));
        const n = ready.length, checking = PROVIDERS.some(([k]) => S.ai[k] === 'checking');
        return { chapter: 'ai', props, pip: { mood: n ? 'happy' : checking ? 'think' : 'sleep', power: n, look: props[Math.max(0, n - 1)].id }, say: n >= 2 ? `${n} power sources. I feel brilliant.` : n === 1 ? 'Power! I can think now.' : checking ? 'Looking for power…' : "No power yet. I'll nap.", target: props[Math.max(0, n - 1)].id, label: n ? n + ' connected' : 'No power', cmd: checking ? 'pip power --scan' : `pip power  ${n} online` };
      }
    },
    ready: {
      chapter: 'ready', eyebrow: 'Ready', title: "You're ready", lead: () => `${esc(S.name.trim() || 'Your Project')} is set up.`,
      body: () => `<div class="ob-summary">${[['Project', S.name.trim() || 'Not yet'], ['AI', PROVIDERS.filter(([k]) => S.ai[k] === 'ready').map(([, n]) => n).join(', ') || 'None yet'], ['Free Models', 'Not set up'], ['Backup', S.backup ? 'Home NAS' : 'Not set up']].map(([k, v]) => `<div><span>${k}</span><b>${esc(v)}</b></div>`).join('')}</div>
        <button type="button" class="ob-tour">${icon('play', 18)}<span><b>Take the Guided Tour</b><small>About 4 minutes. Uses a practice example; nothing changes.</small></span></button>
        <p class="ob-meet"><b>Meet the crew.</b> When Puppet Master runs a Plan, every agent is a Pip in its role's hat: the Coordinator's crown, the Builder's hard hat, the Reviewer's glasses.</p>`,
      foot: { secondary: ['Enter Puppet Master', 'close'], primary: ['Create a Project now', 'close'] },
      scene: () => {
        // the choices come back as charms, and the crew lines up for its curtain call
        const charms = [{ this: 'laptop', connect: 'phone', server: 'server' }[S.where], { new: 'page', existing: 'folder', restore: 'restore' }[S.begin], 'vault'];
        const props = charms.map((k, i) => ({ id: 'm' + i, kind: k, slot: 'm' + (i + 1), scale: .42 }));
        [['crown', 'c1'], ['hardhat', 'c2'], ['glasses', 'c3']].forEach(([hat, slot]) => props.push({ id: 'crew-' + hat, kind: 'crew', slot, params: { hat }, scale: .82 }));
        return { chapter: 'ready', props, pip: { mood: 'happy', look: 'crew-hardhat' }, say: "We're ready. Let's make something!", target: 'crew-crown', label: 'All systems go', cmd: 'pip --go' };
      }
    }
  };
  const PROVIDERS = [['claude', 'Claude', 'Claude plan, not the Anthropic API'], ['codex', 'ChatGPT / Codex', 'ChatGPT plan'], ['antigravity', 'Google Antigravity', 'Antigravity plan, not the Gemini API'], ['cursor', 'Cursor', 'Cursor account']];
  const phases = () => [['Making the folder', 'folder', 'a'], [`Starting Safe History with ${S.vcs === 'jj' ? 'Jujutsu' : 'Git'}`, 'history', 'b'], ...(S.online ? [['Making the online copy on GitHub', 'cloud', 'd']] : []), ...(S.away === 'anywhere' ? [['Setting up access away from home', 'globe', 'e']] : []), ['Checking everything works', 'check', 'c']];
  const reviewRows = () => [
    ['Project', `${S.name.trim() || 'Untitled'} · ${{ new: 'new, empty folder', existing: 'existing work', restore: 'restored from a backup' }[S.begin]}`, 'begin'],
    ['Computer', { this: 'This computer', connect: 'Connected device', server: 'Server' }[S.where], 'where'],
    ['Keeping it safe', `Safe History with ${S.vcs === 'jj' ? 'Jujutsu' : 'Git'}${S.online ? ' · online copy on GitHub' : ''}${S.backup ? ' · backup to Home NAS' : ''}`, 'safe'],
    ['Access', S.away === 'anywhere' ? 'At home and away (Tailscale)' : 'Only at home', 'away']
  ];
  function nameHint() { const n = S.name.trim(); return !n ? 'Give it a name' : n.length > 60 ? 'Keep it under 60 characters' : `${icon('check', 14)} Good name`; }
  function choices(key, list) {
    return `<div class="ob-choices" role="radiogroup">${list.map(([k, ic, t, sub, rec]) => `<button type="button" class="ob-choice" role="radio" aria-checked="${S[key] === k}" data-pick="${key}:${k}" data-hover="${key}:${k}">
      <span class="ob-choice-ic">${icon(ic, 22)}</span><span class="ob-choice-t"><b>${t}</b><small>${sub}</small></span>${rec ? '<span class="ob-rec">Recommended</span>' : ''}<span class="ob-radio" aria-hidden="true"></span></button>`).join('')}</div>`;
  }

  /* --------------------------------------------------------------- window */
  const win = $('#obWin'), stageEl = $('#obStage'), mainEl = $('#obMain'), footEl = $('#obFoot'), railEl = $('#obRail');
  let stage = null;
  // sound (sound.js): every click, step and choice has one, in the look's own kit
  const SND = () => window.PipSound || null;
  const sfx = (ev, o) => { const P = SND(); if (P) try { P.play(ev, o || {}); } catch (e) { /* silent */ } };
  function syncSound() {
    const P = SND(), on = !!(P && !P.muted);
    $$('[data-act="sound"]').forEach((b) => { b.setAttribute('aria-pressed', String(on)); b.title = on ? 'Sound on' : 'Sound off'; b.setAttribute('aria-label', b.title); b.innerHTML = icon(on ? 'sound' : 'mute', 18) + (b.classList.contains('cc-btn') ? `<span>${on ? 'Sound on' : 'Sound off'}</span>` : ''); });
  }
  window.addEventListener('pipsound', syncSound);

  function applyTheme() {
    const th = TH[S.theme];
    document.body.dataset.theme = S.theme; document.body.dataset.fam = th.family; document.body.dataset.scheme = th.scheme;
    if (root.getAttribute('data-theme') !== S.theme) { applyTheme.self = true; root.setAttribute('data-theme', S.theme); }
    root.style.colorScheme = th.scheme;
    $$('[data-pip-mark]').forEach((n) => { n.innerHTML = L.svg({ theme: S.theme, px: +(n.dataset.pipMark || 24), decorative: true }); });
    if (stage) stage.setTheme(S.theme);
    const P = SND(); if (P && P.setTheme) P.setTheme(S.theme);
    $('#themeSel').value = S.theme;
  }
  function layoutFor() { const w = win.getBoundingClientRect().width; return w < 520 ? 'compact' : w < 820 ? 'banner' : 'portrait'; }

  /* The chapter rail: a string pulled taut between two screw eyes with a bead for each chapter. Pip rides
     it like a zip line: the string dips under Pip's weight, Pip slides to the current chapter and swings
     when it stops. NieR's rail is rigid, a track Pip glides along. */
  const rail = { x: null, v: 0, dip: 0, dv: 0, ang: 0, av: 0, cur: -1, raf: 0, last: 0 };
  function renderRail() {
    const scr = SCREENS[S.screen], cur = CHAPTERS.findIndex(([c]) => c === scr.chapter);
    railEl.innerHTML = `<svg class="ob-rail-svg" aria-hidden="true"><path class="ob-rail-str"/><path class="ob-rail-hi"/><circle class="ob-rail-eye" r="3.4"/><circle class="ob-rail-eye" r="3.4"/></svg>
      <ol>${CHAPTERS.map(([c, n], i) => `<li data-state="${i < cur ? 'done' : i === cur ? 'now' : 'next'}"><button type="button" ${i < cur ? `data-chapter="${c}"` : 'disabled'} aria-current="${i === cur ? 'step' : 'false'}"><span class="ob-bead">${i < cur ? icon('check', 11) : ''}</span><span class="ob-rail-l">${n}</span></button></li>`).join('')}</ol>
      <span class="ob-railpip">${L.svg({ theme: S.theme, px: 30, decorative: true })}</span>`;
    railEl.setAttribute('aria-label', `Setup progress: chapter ${cur + 1} of ${CHAPTERS.length}, ${CHAPTERS[cur][1]}`);
    if (rail.cur !== -1 && cur !== rail.cur && !S.reduced) { sfx('rail'); rail.av += (cur > rail.cur ? -1 : 1) * .6; }
    rail.cur = cur;
    railKick();
  }
  function railKick() { if (!rail.raf) { rail.last = performance.now(); rail.raf = requestAnimationFrame(railTick); } }
  function railTick(tn) {
    rail.raf = 0;
    const W = railEl.clientWidth, n = CHAPTERS.length, fam = famOf(S.theme), rigid = fam === 'nier';
    if (!W) return;
    const dt = Math.min(.04, ((tn || performance.now()) - rail.last) / 1000); rail.last = tn || performance.now();
    const y0 = 12, x0 = 8, x1 = W - 8, bx = (i) => x0 + 14 + (x1 - x0 - 28) * (i + .5) / n;
    const tx = bx(rail.cur), weight = rigid ? 0 : fam === 'basic' ? 3 : 6;
    if (rail.x == null || S.reduced) { rail.x = tx; rail.v = 0; rail.dip = weight; rail.dv = 0; rail.ang = 0; rail.av = 0; }
    // Pip slides along the string to its chapter (each look with its own spring), the string dips under it
    const M = { friendly: [70, 11], glass: [26, 7.5], basic: [90, 19], retro: [110, 15], nier: [60, 16] }[fam];
    const ax = M[0] * (tx - rail.x) - M[1] * rail.v;
    rail.v += ax * dt; rail.x += rail.v * dt;
    const dA = 160 * (weight + Math.min(5, Math.abs(rail.v) * .012) - rail.dip) - 9 * rail.dv; rail.dv += dA * dt; rail.dip += rail.dv * dt;
    const aA = -38 * rail.ang - 3.2 * rail.av - ax * .0016; rail.av += aA * dt; rail.ang += rail.av * dt;
    let px = rail.x, dip = Math.max(0, rail.dip);
    if (fam === 'retro') { px = Math.round(px / 4) * 4; dip = Math.round(dip); }
    const yAt = (x) => x <= px ? y0 + dip * (x - x0) / Math.max(1, px - x0) : y0 + dip * (x1 - x) / Math.max(1, x1 - px);
    const k = 7, d = dip > .4 ? `M${x0} ${y0}L${(px - k).toFixed(1)} ${yAt(px - k).toFixed(1)}Q${px.toFixed(1)} ${(y0 + dip).toFixed(1)} ${(px + k).toFixed(1)} ${yAt(px + k).toFixed(1)}L${x1} ${y0}` : `M${x0} ${y0}H${x1}`;
    const svg = railEl.querySelector('.ob-rail-svg');
    if (svg) {
      svg.setAttribute('viewBox', `0 0 ${W} 40`);
      svg.querySelector('.ob-rail-str').setAttribute('d', d);
      // the walked part of the string, from the first eye to Pip
      svg.querySelector('.ob-rail-hi').setAttribute('d', dip > .4 ? `M${x0} ${y0}L${(px - k).toFixed(1)} ${yAt(px - k).toFixed(1)}Q${px.toFixed(1)} ${(y0 + dip).toFixed(1)} ${px.toFixed(1)} ${(y0 + dip).toFixed(1)}` : `M${x0} ${y0}H${px.toFixed(1)}`);
      const eyes = svg.querySelectorAll('.ob-rail-eye');
      eyes[0].setAttribute('cx', x0); eyes[0].setAttribute('cy', y0); eyes[1].setAttribute('cx', x1); eyes[1].setAttribute('cy', y0);
    }
    // beads ride the string; their labels keep one line, the current one under Pip
    railEl.querySelectorAll('li').forEach((li, i) => { const x = bx(i), top = yAt(x) - 7; li.style.left = x.toFixed(1) + 'px'; li.style.top = top.toFixed(1) + 'px'; li.style.setProperty('--ly', ((i === rail.cur ? 41 : 28) - top).toFixed(1) + 'px'); });
    const pip = railEl.querySelector('.ob-railpip');
    // the mark's pin (32, 14.5 of 64) rides the string; at 30 px that is (15, 6.8)
    if (pip) pip.style.transform = `translate(${(px - 15).toFixed(1)}px, ${(y0 + dip - 6.8).toFixed(1)}px) rotate(${(rail.ang * 57.3).toFixed(2)}deg)`;
    const moving = Math.abs(tx - rail.x) > .3 || Math.abs(rail.v) > 1 || Math.abs(rail.av) > .01 || Math.abs(rail.ang) > .004 || Math.abs(rail.dip - weight) > .05;
    if (moving && !S.reduced) railKick();
  }
  new ResizeObserver(() => railKick()).observe(railEl);
  function val(v) { return typeof v === 'function' ? v() : v; }
  // Retro: the title arrives the way a terminal prints, a few characters at a time
  function typeTitle(h) {
    const full = h.textContent; let i = 0;
    h.textContent = ''; h.dataset.typing = '1';
    const t = setInterval(() => { i += 2; h.textContent = full.slice(0, i); if (i >= full.length) { clearInterval(t); delete h.dataset.typing; } }, 16);
  }
  function renderScreen(dir) {
    const scr = SCREENS[S.screen];
    // Friendly's window takes the chapter's colour, like its stage
    const wd = window.PipWorlds.WORLDS[S.theme];
    document.body.style.setProperty('--tint', (wd.chapter && wd.chapter[scr.chapter]) || '');
    const html = `<div class="ob-screen" data-screen="${S.screen}" data-dir="${dir || 0}">
      <p class="ob-eyebrow">${esc(val(scr.eyebrow))}</p><h1 class="ob-title" id="obTitle">${val(scr.title)}</h1><p class="ob-lead">${val(scr.lead)}</p>
      <div class="ob-bodyx">${scr.body()}</div></div>`;
    mainEl.innerHTML = html;
    if (famOf(S.theme) === 'retro' && dir && !S.reduced) typeTitle($('#obTitle'));
    const f = val(scr.foot) || {};
    const back = S.history.length ? `<button type="button" class="ob-btn ob-ghost ob-back" data-act="back">${icon('back', 18)}Back</button>` : '<span></span>';
    footEl.innerHTML = `${back}<div class="ob-foot-r">${f.secondary ? `<button type="button" class="ob-btn ob-ghost" data-act="${f.secondary[1]}">${f.secondary[0]}</button>` : ''}${f.primary ? `<button type="button" class="ob-btn ob-primary" data-act="${f.primary[1]}"${f.primary[2] ? ' disabled' : ''}>${f.primary[0]}</button>` : ''}</div>`;
    renderRail();
    $('#screenSel').value = S.screen;
    direct();
    if (S.screen === 'name') {
      const inp = $('#obName');
      inp.addEventListener('input', () => {
        const was = S.name.trim().length > 60;
        S.name = inp.value; $('#obNameHint').innerHTML = nameHint();
        sfx('key', { index: inp.value.length });
        if (stage) stage.busy();
        direct();
        if (!was && S.name.trim().length > 60) { sfx('warn'); sfx('alert'); }
      });
    }
  }
  function direct() {
    const scr = SCREENS[S.screen];
    let hov = null;
    if (S.hover) { const [k, v] = S.hover.split(':'); hov = (k === S.screen || k === 'look' || k === 'safe' || k === 'ai') ? (S.screen === 'safe' ? S.hover : v) : null; }
    const spec = scr.scene(hov);
    if (S.screen === 'look' && stage) stage.tryOn(hov ? (hov === 'nier' ? 'nier-' + schemeOf(S.theme) : hov + '-' + schemeOf(S.theme)) : S.theme);
    if (stage) stage.direct(spec);
  }

  /* ----------------------------------------------------------------- flow */
  let timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, S.reduced ? Math.min(ms, 120) : ms));
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }
  function go(screen, opts) {
    if (!SCREENS[screen]) return;
    const from = S.screen;
    clearTimers();
    if (!(opts && opts.back) && from !== screen) S.history.push(from);
    S.screen = screen; S.hover = null;
    if (from !== screen) sfx(opts && opts.back ? 'back' : 'next', { chapter: CHAPTERS.findIndex(([c]) => c === SCREENS[screen].chapter) });
    renderScreen(opts && opts.back ? -1 : 1);
    enter(screen);
    if (stage && !(opts && opts.back) && from !== screen) stage.feel('happy', 600);
  }
  // what happens on arrival: the wake, the review's ticks, the build, the power-up, the curtain call
  function enter(screen) {
    if (screen === 'welcome' && stage) stage.wake();
    if (screen === 'review') { S.reviewTicks = 0; for (let i = 1; i <= 4; i++) later(() => { S.reviewTicks = i; direct(); sfx('tick', { index: i - 1 }); if (i === 4 && stage) stage.cheer('clipboard'); }, 380 * i + 200); }
    if (screen === 'creating') {
      S.phase = 0; renderScreen(1);
      const n = phases().length;
      for (let i = 1; i <= n; i++) later(() => { S.phase = i; renderScreen(0); if (stage) stage.cheer('b' + (i - 1), { mood: i === n ? 'happy' : 'dots', sound: 'block', index: i - 1, count: n }); }, 1100 * i + 300);
    }
    if (screen === 'ai') {
      PROVIDERS.forEach(([k]) => { S.ai[k] = 'checking'; });
      renderScreen(0);
      let lit = 0;
      [['claude', 'ready', 1300], ['codex', 'ready', 2300], ['antigravity', 'off', 2900], ['cursor', 'off', 3300]].forEach(([k, st, ms]) => later(() => { S.ai[k] = st; renderScreen(0); if (st === 'ready' && stage) stage.cheer('o' + k, { sound: 'power', index: lit++ }); }, ms));
    }
    if (screen === 'ready' && stage) { later(() => { stage.confetti(60); stage.cheer(null, { sound: 'crew' }); }, 500); }
  }
  function next() { const i = FLOW.indexOf(S.screen); if (i < FLOW.length - 1) go(FLOW[i + 1]); }
  function back() { const prev = S.history.pop(); if (prev) go(prev, { back: true }); }

  /* --------------------------------------------------------------- events */
  document.addEventListener('click', (e) => {
    const b = e.target.closest('button, [data-hover]');
    if (!b) return;
    if (b.dataset.pick) {
      const [k, v] = b.dataset.pick.split(':');
      S[k] = v; S.hover = null; renderScreen(0);
      sfx('select');
      const spec = SCREENS[S.screen].scene(null); if (stage) { stage.busy(); stage.direct(spec); stage.cheer(spec.target); }
      return;
    }
    if (b.dataset.look) {
      const t = b.dataset.look + '-' + schemeOf(S.theme === 'nier-light' ? 'basic-light' : S.theme === 'nier-dark' ? 'basic-dark' : S.theme);
      S.theme = t; S.hover = null; applyTheme(); renderScreen(0); sfx('select'); if (stage) stage.cheer('palette', { mood: 'wink' }); return;
    }
    if (b.dataset.scheme) {
      const fam = famOf(S.theme); S.theme = (fam === 'nier' ? 'nier' : fam) + '-' + b.dataset.scheme; applyTheme(); renderScreen(0); sfx('tap'); return;
    }
    if (b.dataset.vcs) { S.vcs = b.dataset.vcs; renderScreen(0); sfx('select'); if (stage) stage.cheer('vault'); return; }
    if (b.dataset.online) { S.online = b.dataset.online === 'true'; renderScreen(0); sfx(S.online ? 'toggleOn' : 'toggleOff'); if (stage && S.online) stage.cheer('cloud'); return; }
    if (b.dataset.backup) { S.backup = b.dataset.backup === 'null' ? null : b.dataset.backup; renderScreen(0); sfx(S.backup ? 'toggleOn' : 'toggleOff'); if (stage && S.backup) stage.cheer('backup'); return; }
    if (b.dataset.go) { go(b.dataset.go); return; }
    if (b.dataset.chapter) { const first = { welcome: 'welcome', computer: 'where', project: 'begin', ai: 'ai' }[b.dataset.chapter]; while (S.history.length && S.history[S.history.length - 1] !== first) S.history.pop(); S.history.pop(); go(first, { back: true }); return; }
    const act = b.dataset.act;
    if (act === 'next') next();
    else if (act === 'back') back();
    else if (act === 'skip' || act === 'close') setOpen(false);
    else if (act === 'later') go('ai');
    else if (act === 'noai') { PROVIDERS.forEach(([k]) => { S.ai[k] = 'off'; }); renderScreen(0); sfx('tap'); }
    else if (act === 'look') go('look');
    else if (act === 'resume') setOpen(true);
    else if (act === 'sound') { const P = SND(); if (P) { P.toggle(); syncSound(); if (!P.muted) sfx('toggleOn'); } }
    else if (b.closest('.ob')) sfx('tap');
  });
  document.addEventListener('change', (e) => {
    if (e.target.matches('[data-nier]')) {
      const sch = schemeOf(S.theme);
      S.theme = e.target.checked ? 'nier-' + sch : 'basic-' + sch; applyTheme(); renderScreen(0);
      sfx(e.target.checked ? 'toggleOn' : 'toggleOff');
      if (stage) stage.cheer('palette');
    }
  });
  // hovering or focusing a choice previews it on the stage
  let thinkT = 0;
  const setHover = (h) => {
    if (h === S.hover) return;
    S.hover = h;
    if (h) { sfx('hover'); if (stage) stage.busy(); if (performance.now() - thinkT > 2600) { thinkT = performance.now(); setTimeout(() => { if (S.hover === h) sfx('think'); }, 260); } }
    direct();
  };
  mainEl.addEventListener('pointerover', (e) => { const h = e.target.closest('[data-hover]'); setHover(h ? h.dataset.hover : null); });
  mainEl.addEventListener('pointerleave', () => setHover(null));
  mainEl.addEventListener('focusin', (e) => { const h = e.target.closest('[data-hover]'); if (h) setHover(h.dataset.hover); });
  mainEl.addEventListener('focusout', () => setHover(null));
  document.addEventListener('keydown', (e) => {
    if (!S.open) return;
    if (e.key === 'Enter' && !e.target.matches('button, input[type="checkbox"]')) { const p = $('.ob-primary'); if (p && !p.disabled) p.click(); }
    if (e.key === 'Escape') setOpen(false);
  });

  /* ------------------------------------------------------- concept controls */
  function setOpen(open) {
    S.open = open; document.body.dataset.open = open ? '1' : '0';
    $('#resumePill').hidden = open;
    $('.shell').setAttribute('aria-hidden', open ? 'true' : 'false');
    win.setAttribute('aria-hidden', open ? 'false' : 'true');
    if (stage) { stage.setActive(open); if (setOpen.ready) { if (open) stage.powerOn(); else stage.powerOff(); } }
    if (setOpen.ready) sfx(open ? 'open' : 'close');
    if (open) { renderScreen(0); }
  }
  function setWidth(w) {
    S.width = w; document.body.dataset.width = w;
    $$('[data-width]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.width === w)));
    requestAnimationFrame(() => { if (stage) { stage.setLayout(layoutFor()); S.layout = stage.layoutName; direct(); } });
  }
  function setReduced(r) {
    S.reduced = r; root.setAttribute('data-reduced-motion', r ? '1' : '0'); document.body.dataset.reduced = r ? '1' : '0';
    if (stage) stage.setReduced(r);
    const P = SND(); if (P && P.setReduced) P.setReduced(r);
    $('#reducedBtn').setAttribute('aria-pressed', String(r));
  }
  function buildControls() {
    $('#themeSel').innerHTML = THEMES10.map((t) => `<option value="${t}">${TH[t].label}</option>`).join('');
    $('#screenSel').innerHTML = FLOW.map((s, i) => `<option value="${s}">${i + 1}. ${{ welcome: 'Welcome', look: 'Pick a look', where: 'The computer', begin: 'Project begins', name: 'Name', safe: 'Keep it safe', away: 'Away from home', review: 'Review', creating: 'Creating', ai: 'AI power', ready: 'Ready' }[s]}</option>`).join('');
    $('#themeSel').addEventListener('change', (e) => { S.theme = e.target.value; applyTheme(); renderScreen(0); });
    $('#screenSel').addEventListener('change', (e) => { S.history = FLOW.slice(0, FLOW.indexOf(e.target.value)); go(e.target.value, { back: true }); });
    $('#replayBtn').addEventListener('click', () => { clearTimers(); renderScreen(0); enter(S.screen); });
    $('#reducedBtn').addEventListener('click', () => setReduced(!S.reduced));
    $$('[data-width]').forEach((b) => b.addEventListener('click', () => setWidth(b.dataset.width)));
    new MutationObserver(() => {
      if (applyTheme.self) { applyTheme.self = false; return; }
      const t = root.getAttribute('data-theme'), r = root.getAttribute('data-reduced-motion') === '1';
      if (TH[t] && t !== S.theme) { S.theme = t; applyTheme(); renderScreen(0); }
      if (r !== S.reduced) setReduced(r);
    }).observe(root, { attributes: true, attributeFilter: ['data-theme', 'data-reduced-motion'] });
    new ResizeObserver(() => { if (stage) { const l = layoutFor(); if (l !== stage.layoutName) { stage.setLayout(l); S.layout = l; direct(); } } }).observe(win);
  }

  /* ----------------------------------------------------------------- boot */
  buildControls();
  setWidth(S.width);
  applyTheme();
  setReduced(S.reduced);
  stage = new window.PipStage.Stage(stageEl, { theme: S.theme, layout: layoutFor(), reduced: S.reduced });
  S.layout = stage.layoutName;
  if (!SCREENS[S.screen]) S.screen = 'welcome';
  if (S.screen !== 'welcome') S.history = FLOW.slice(0, FLOW.indexOf(S.screen));
  // jumping straight past the AI screen: two providers are already connected
  if (FLOW.indexOf(S.screen) > FLOW.indexOf('ai')) { S.ai.claude = 'ready'; S.ai.codex = 'ready'; S.ai.antigravity = 'off'; S.ai.cursor = 'off'; }
  setOpen(true);
  setOpen.ready = true;
  syncSound();
  enter(S.screen);
  window.__ob = { S, go, stage: () => stage };
})();
