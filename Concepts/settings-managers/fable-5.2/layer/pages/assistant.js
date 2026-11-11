/* Settings managers, rethought (Fable 5.2): the chapter "Chat & assistant".
   Today these rows are four of the twelve sections of General › App & Input (66 rows on one scroll, from themes to
   spelling), plus one row kept by Context & Memory, three by Goals & Automation and three by Readiness & Doctor. Here
   they are three pages, each about one thing a person wonders: what happens when I send a message, what does the chat
   show me, how much does the app explain. Each page opens with a sentence that says how the chat behaves now, built
   from the real values; every word in it that can be changed leads to its row. The rows are PMConcept7's own, grouped
   by the moment they matter; the rarely changed ones are under "More options" and "For experts".
   Choices that belong to another page are linked, never repeated: the model that answers (AI providers), what the
   assistant may do without asking (Safety), Pip's look (Look & feel), the computer for a chat with no project
   (Computers). */
(function (W) {
  'use strict';
  const SMX = W.SMX; if (!SMX) return;
  const ui = SMX.ui, h = SMX.h, S = SMX.sec;
  const kit = () => W.PM51;
  const G = 'general.interaction.';
  const val = (id) => SMX.val(id);
  const on = (id) => { const v = val(id); return v === true || v === 'on' || v === 'true'; };
  const word = (id, v) => { const x = v === undefined ? val(id) : v; try { return String(kit().valueLabel(id, x) || x || ''); } catch (e) { return String(x == null ? '' : x); } };
  const listOf = (a) => (a.length <= 1 ? a.join('') : `${a.slice(0, -1).join(', ')} and ${a[a.length - 1]}`);
  /* a word in a sentence that leads to the row where it is changed */
  const at = (route, id, text) => ui.word(text, { go: route, reveal: id });

  const KEY = G + 'submit-key', BUSY = G + 'queue-behavior', MODE = G + 'assistant-mode', CARDS = G + 'question-cards', SPELL = G + 'spellcheck', LANGS = G + 'spellcheck-languages';
  /* what a new chat is for, in the inventory's own terms ("Ask only answers, Agent makes changes, Debug diagnoses,
     Plan and Deep Plan think first") and Planning's ("A Deep Plan looks harder and asks you more") */
  const MODES = {
    Ask: ['it only answers', 'Only answers and looks around. It changes nothing.'],
    Agent: ['it makes changes', 'Makes changes: it writes, runs and fixes things. What it may do without asking is set under Safety & permissions.'],
    Debug: ['it tracks down a problem', 'Tracks down a problem: it looks for the cause before it changes anything.'],
    Plan: ['it writes a plan before it builds', 'Thinks first and writes a plan before it builds.'],
    'Deep Plan': ['it writes a deeper plan and asks you more before it builds', 'Like Plan, but it looks harder and asks you more before anything is built.']
  };

  SMX.reword({
    [G + 'queue-size']: { label: 'How many messages can wait in line', help: 'Messages you send while the assistant is busy wait their turn. When the line is full, you wait before sending another.' },
    [G + 'chat-keep-open']: { label: 'Keep the chat open in a narrow window', help: 'On: the chat keeps its width. Off: when little room is left for the other panels, the chat folds to a thin strip at the edge so they stay usable.' },
    [G + 'chat-history-list']: { label: 'Where the list of past chats starts', help: 'As a fly-out you open when you want it, or pinned beside the messages. A window where you already chose keeps your choice.' },
    [LANGS]: { help: 'Tick every language you write in.' },
    [MODE]: { help: 'What a new chat is for. The table under these rows says what each one does.' },
    [G + 'eli5-default']: { help: 'New chats explain technical words as they come up. A chat you set differently keeps its own choice.' },
    [G + 'progress-widget-layout']: { help: 'Which panels the progress view of a Goal shows, and where.' }
  });

  /* ================================================================== Sending & answering */
  const sayKey = () => { const k = String(val(KEY) || 'Enter'); return k === 'Enter' ? `${at('assistant', KEY, 'Enter')} sends a message.` : `${at('assistant', KEY, word(KEY))} sends a message, so Enter alone never sends a half-typed one.`; };
  const sayBusy = () => `If you send while the assistant is busy, your message ${at('assistant', BUSY, String(val(BUSY)) === 'Steer' ? 'goes into the running answer at once' : 'waits for the current step')}.`;
  const sayMode = () => { const m = String(val(MODE) || 'Agent'); return `A new chat starts in ${at('assistant', MODE, word(MODE))} mode: ${h((MODES[m] || ['it works the way that mode says'])[0])}.`; };
  const saySpell = () => { const l = val(LANGS); const names = Array.isArray(l) ? l.map(String) : []; return on(SPELL) ? `spelling is checked in ${at('assistant', LANGS, names.length ? listOf(names) : 'no language yet')}` : `spelling is ${at('assistant', SPELL, 'not checked')}`; };
  const chapter = SMX.chapters.find((c) => c.id === 'assistant');
  if (chapter && !chapter.status) chapter.status = () => ({ tone: 'ready', text: `${word(KEY)} sends · new chats in ${word(MODE)} mode` });

  SMX.extend('assistant', {
    purpose: 'How you talk to the assistant: what sends a message, what a new chat is for, and how it asks you things.',
    keywords: ['enter', 'send', 'submit', 'mode', 'plan mode', 'agent', 'ask', 'debug', 'questions', 'cards', 'spelling', 'spell', 'dictionary', 'queue', 'steer'],
    lead: () => [
      { key: 'summary', html: ui.summary({ icon: 'chat', lines: [
        `${sayKey()} ${sayBusy()}`,
        `${sayMode()} It asks its questions ${at('assistant', CARDS, on(CARDS) ? 'as cards' : 'as plain text')}, and ${saySpell()}.`
      ] }) }
    ],
    sections: [
      { key: 'send', title: 'When I send a message', help: 'The key that sends, and what happens to a message sent while the assistant is still working.', ids: [KEY, BUSY, G + 'edit-resend'] },
      { key: 'box', title: 'The message box', help: 'Buttons for adding a picture, or asking for one. They show only while the model in use can work with pictures.', ids: [G + 'composer-media-controls'] },
      { key: 'start', title: 'When a chat starts', help: 'What a new chat is for. You can change it in any chat, at any time.', ids: [MODE, G + 'natural-language-modes'] },
      { key: 'modes', html: () => { const m = String(val(MODE) || 'Agent'); return ui.card({ title: 'What each mode is for', body: ui.facts(Object.keys(MODES).map((k) => [k === m ? `${k} (new chats start here)` : k, MODES[k][1]])) + ui.links([{ label: 'What the assistant may do without asking', go: 'safety' }, { label: 'How a plan is made', go: 'planning' }, { label: 'Which model answers', go: 'ai/models' }]) }); } },
      { key: 'asks', title: 'When it asks me something', help: 'A question from the assistant can be a card with choices, and what you typed into one is kept.', ids: [CARDS, G + 'question-drafts'] },
      { key: 'spelling', title: 'Spelling', help: 'For what you write in chat and in notes. Code is never marked.', ids: [SPELL, LANGS, G + 'spellcheck-words'] }
    ],
    more: [
      { key: 'typing', title: 'What I was typing, and waiting messages', ids: [G + 'composer-persist-unsent', G + 'queue-size'] },
      { key: 'narrow', title: 'The chat in a narrow window', ids: [G + 'chat-keep-open'] },
      Object.assign(S('app-chat-assistant', { key: 'big', title: 'Big jobs', help: 'For work that takes many steps.' }), { also: ['planning.interview.todo-auto-use'] }),
      S('app-chat', { key: 'send-rest', title: 'More about sending' })
    ],
    moreHelp: 'Unsent text, the line of waiting messages, narrow windows and big jobs',
    tail: () => [{ key: 'links', html: ui.links([{ label: 'Pip, the helper in the chat: Look & feel › Customize Pip', go: 'look', reveal: 'general.visual.pip-parts' }, { label: 'The computer that answers a chat with no project', go: 'computers/work', reveal: G + 'no-project-default-computer' }, { label: 'Sounds when you send and when the answer arrives', go: 'notifications/sounds' }]) }],
    changes: [
      { was: 'These rows are the third, fourth and ninth of the twelve sections of App & Input: 66 rows on one scroll that starts with themes and ends with spelling.', now: 'A chapter of its own, three pages. This one opens with two sentences that say what sends a message, what happens to one sent while the assistant is busy, what a new chat starts as, how it asks, and whether spelling is checked. Each of those words leads to its row.' },
      { was: '“Sending messages” holds seven rows that are not all about sending: “Computer for chats with no project” and “Keep the chat open in narrow Windows” are among them.', now: 'The computer row is on Computers & remote access › Where work runs, and this page links to it. The rows here are grouped by the moment they matter: when I send a message, when a chat starts, when it asks me something, spelling. Four rarely changed rows are under More options.' },
      { was: '“New chats start in” offers Ask, Agent, Debug, Plan and Deep Plan. Its line explains three of them (“Ask only answers, Agent makes changes, Plan thinks first”) and sends you to “Permissions” for the rest.', now: 'A short table under the row says what each of the five is for, with links to what the assistant may do without asking, how a plan is made, and which model answers.' },
      { was: '“Keep the chat open in narrow Windows” has a line that describes what happens when it is off; “Messages that can wait — When the line is full, new messages must wait” does not say what the number counts.', now: 'Reworded: “Keep the chat open in a narrow window”, with a line for on and for off; “How many messages can wait in line”.' },
      { was: '“Keep a checklist for big tasks” sits in App & Input among the chat rows; “Image tools in message box” sits in Media & Output.', now: 'The checklist is with plans, on Planning & goals, and this page points to it under “Big jobs”. The picture buttons are a choice about the message box, so they are here.' }
    ]
  });

  /* ================================================================== What the chat shows */
  const THINK = G + 'thought-stream', WORK = G + 'working-activity-style', CARDS_DO = G + 'activity-cards', FOLLOW = G + 'auto-follow', MARK = G + 'unread-marker', COPY = G + 'copy-code-button', DRAW = G + 'mermaid';
  SMX.extend('assistant/view', {
    purpose: 'What you see in a conversation: the work as it happens, the thinking, code and pictures, and your place in a long chat.',
    keywords: ['thinking', 'reasoning', 'activity', 'diagrams', 'mermaid', 'history', 'copy button', 'scroll', 'unread', 'meter', 'progress', 'graph'],
    blurb: () => `${on(CARDS_DO) ? 'Shows what the assistant does' : 'Hides what the assistant does'} · thinking ${String(val(THINK)) === 'Expanded' ? 'stays open' : 'shows while it thinks'}`,
    lead: () => [
      { key: 'summary', html: ui.summary({ icon: 'eye', lines: [
        `While the assistant works you see ${at('assistant/view', CARDS_DO, on(CARDS_DO) ? 'what it does' : 'only its answer')}, in the ${at('assistant/view', WORK, word(WORK))} view, and its thinking ${at('assistant/view', THINK, String(val(THINK)) === 'Expanded' ? 'stays open beside the answer' : 'shows while it thinks')}.`,
        `Code ${at('assistant/view', COPY, on(COPY) ? 'has a copy button' : 'has no copy button')}, diagrams are ${at('assistant/view', DRAW, on(DRAW) ? 'drawn as pictures' : 'left as text')}, and the chat ${at('assistant/view', FOLLOW, on(FOLLOW) ? 'follows new messages' : 'stays where you scrolled')}${on(MARK) ? ` and ${at('assistant/view', MARK, 'marks where you stopped reading')}` : ''}.`
      ] }) }
    ],
    sections: [
      { key: 'working', title: 'While it answers', help: 'What you see of the work as it happens. None of these changes an answer.', ids: [WORK, THINK, CARDS_DO, G + 'file-discovery-cards'] },
      { key: 'message', title: 'What I see in a message', help: 'Code, diagrams and small previews inside an answer.', ids: [COPY, DRAW, G + 'inline-visualizers'] },
      { key: 'place', title: 'Keeping my place', help: 'In a long conversation.', ids: [FOLLOW, MARK] },
      S('memory-context-meter', { title: 'How full the chat is', help: 'A chat can keep only so much in mind. The meter shows how much room is left.' })
    ],
    more: [
      { key: 'thinking', title: 'Thinking, and the list of past chats', ids: [G + 'thought-stream-lines', G + 'chat-history-list'] },
      S('app-chat-view', { key: 'view-rest', title: 'More about what the chat shows' })
    ],
    moreHelp: 'How many lines of thinking, and where past chats are listed',
    expert: [S('goals-progress', { title: 'How the progress of a Goal is drawn', help: 'A Goal is long work the assistant keeps doing by itself. These shape its progress view in a chat.' })],
    expertHelp: 'The progress view of a Goal',
    tail: () => [{ key: 'links', html: ui.links([{ label: 'What happens when a chat fills up', go: 'memory/space' }, { label: 'How Goals work', go: 'planning/goals' }, { label: 'Text size and motion', go: 'look/text' }]) }],
    changes: [
      { was: '“What the chat shows” is eleven rows in one list on App & Input. The meter that shows how full a chat is sits in Context & Memory, and how a Goal’s progress is drawn sits in Goals & Automation, though all three change only what a chat displays.', now: 'One page for what a chat displays. A sentence says what you see now; the rows are grouped as while it answers, what I see in a message, keeping my place, and how full the chat is. The Goal’s progress view is under For experts.' },
      { was: '“History in new workspaces — Starts as a flyout or pinned beside the messages. A workspace’s saved choice always wins.” uses “workspace” for a window’s layout, the word other pages use for a project.', now: 'Reworded: “Where the list of past chats starts”, with a line that says what the two choices are.' }
    ]
  });

  /* ================================================================== Help & explanations */
  const TALK = G + 'mode', ELI5 = G + 'eli5-default', TIPS = G + 'show-tooltips', FIND = G + 'settings-search';
  SMX.extend('assistant/help', {
    purpose: 'How much the app explains as you go, and in what words.',
    keywords: ['plain english', 'expert', 'hints', 'tooltips', 'explain', 'jargon', 'eli5', 'status labels', 'fix-it', 'search settings'],
    blurb: () => `${String(val(TALK)) === 'Expert' ? 'Expert words' : word(TALK)} · hints ${on(TIPS) ? 'on' : 'off'}`,
    lead: () => [
      { key: 'summary', html: ui.summary({ icon: 'info', lines: [
        String(val(TALK)) === 'Expert' ? `The app talks to you ${at('assistant/help', TALK, 'as an expert')}: every control is shown, in its technical words.` : `The app talks to you in ${at('assistant/help', TALK, word(TALK))}: jargon and rarely used controls are hidden.`,
        `Hints ${at('assistant/help', TIPS, on(TIPS) ? 'appear when you hover' : 'are off')}, and technical words in a chat are ${at('assistant/help', ELI5, on(ELI5) ? 'explained as they come up' : 'not explained unless you turn that on in a chat')}.`
      ] }) }
    ],
    sections: [
      { key: 'words', title: 'The words the app uses', help: 'For the app itself, and for the answers in a chat.', ids: [TALK, ELI5] },
      { key: 'hints', title: 'Hints as you go', help: 'Small explanations that appear where you are pointing.', ids: [TIPS, G + 'explain-disabled'] },
      S('doctor-display', { title: 'Status words around the app', help: 'Small labels that say whether something is ready, and links that take you to the fix.' })
    ],
    more: [S('app-help-more', { title: 'Where a setting comes from, and hidden features', help: 'Two switches about Settings and search themselves.' }), S('app-help', { key: 'help-rest', title: 'More about help' })],
    moreHelp: 'Where each setting comes from, and features you have hidden',
    tail: () => [{ key: 'links', html: ui.links([{ label: 'Search every setting', action: 'run-setting-action', data: { setting: FIND, settingId: FIND } }, { label: 'Take the tour again', go: 'system/setup' }, { label: 'Pip, the helper in the chat: Look & feel › Customize Pip', go: 'look', reveal: 'general.visual.pip-parts' }]) }],
    covers: { [FIND]: 'The search box at the top of the Settings list, and the link “Search every setting” on this page.' },
    changes: [
      { was: 'Help & explanations has five rows. The fifth, “Search all settings”, is a button whose only job is to move the cursor to the search box.', now: 'Four rows in two groups. Search is the box at the top of the Settings list; a link at the foot of this page still takes you to it.' },
      { was: 'Three switches about status labels, half-working connections and fix-it links are on Readiness & Doctor as “What you see around the app”.', now: 'They are here, with the other choices about how much the app explains.' },
      { was: '“Explain technical terms in chats — Default for chats in this project; a chat’s own choice wins.”', now: 'Reworded line: “New chats explain technical words as they come up. A chat you set differently keeps its own choice.”' }
    ]
  });
})(window);
