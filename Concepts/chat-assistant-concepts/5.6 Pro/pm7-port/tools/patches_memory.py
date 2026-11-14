"""Hosted-only patches for the chat's memory (FO-167, 2026-11-12: the quiet Memory design Jared approved on 2026-11-11,
share/puppet-master/2026-11-11-memory-review).

In PMConcept7 memory is one list, Settings > Memory & Automation > Memory, and the chat opens that same page as a sheet
(pm7-port/js/80-quiet-memory.js, window.PM7_MEMORY from the Settings manager). A reply says at most that it saved
something ("Saved to memory · View"). So, hosted only (window.PM56_HOST; the standalone 5.6 Pro concept is untouched):

1. memory-protocol.js: no reply mark ("Noted", "Verified: label checks pass (3/3)" and its hover naming the note), no
   "suggested change to your rule" line in the chat (it renders as nothing), and no note made by itself after every
   reply: boundary() only lets Teach check the reply against the rules that rode along (T.noteReply, idempotent), as
   it did before, and saves nothing (PACKET: a finished reply is not a reason to make a memory).
2. assistant-features.js: the wand's Memory row says what the page holds; its action opens the sheet (80-quiet-memory).
3. app.js: a reply's body ends with the extension slot messageBodyEnd, where 80-quiet-memory.js draws the save line
   inside the reply, under its last paragraph (mock 08), or the inline View after a one-line reply (mock 09).

Entries: (file, old, new, count).
"""
from __future__ import annotations

HOSTED_JS_PATCHES = [
    ('memory-protocol.js',
     "E.slot('messageMeta',c=>{\n  const m=c.message;if(!m||m.role!=='assistant')return '';",
     "E.slot('messageMeta',c=>{\n  if(window.PM56_HOST)return '';const m=c.message;if(!m||m.role!=='assistant')return '';", 1),
    ('memory-protocol.js',
     "E.slot('transcriptMessage',c=>{\n  const m=c.m;if(m?.type!=='af-memory-proposal')return '';",
     "E.slot('transcriptMessage',c=>{\n  const m=c.m;if(m?.type!=='af-memory-proposal')return '';if(window.PM56_HOST)return '<span hidden data-k=\"mem-proposal-quiet:'+c.esc(m.id)+'\"></span>';", 1),
    ('memory-protocol.js',
     "function boundary(t,m){if(!m||m.role!=='assistant'||m.type!=='text'||m.internalOnly)return fail('not_assistant_final');",
     "function boundary(t,m){if(!m||m.role!=='assistant'||m.type!=='text'||m.internalOnly)return fail('not_assistant_final');if(window.PM56_HOST){T.noteReply?.(t,m);return fail('quiet_memory');}", 1),
    ('assistant-features.js',
     "'<span class=\"menu-copy\"><strong class=\"menu-ttl\">Memory</strong><span class=\"menu-sub\">Taught (lock-aware) and automatic — two owners, one panel</span></span></button>'+",
     "'<span class=\"menu-copy\"><strong class=\"menu-ttl\">Memory</strong><span class=\"menu-sub\">'+(window.PM56_HOST?'Notes Puppet Master keeps between chats':'Taught (lock-aware) and automatic — two owners, one panel')+'</span></span></button>'+", 1),
    ('app.js',
     ": `<div class=\"message-body ${isLong&&!expanded?'long-fade':''}\">${m.rich&&window.PM56_RICH?window.PM56_RICH.html(m.body):formatText(m.body)}</div>`;",
     ": `<div class=\"message-body ${isLong&&!expanded?'long-fade':''}\">${m.rich&&window.PM56_RICH?window.PM56_RICH.html(m.body):formatText(m.body)}${window.PM56_HOST?extRender('messageBodyEnd',{message:m}):''}</div>`;", 1),
]
