/* O55 · Show words beside the status bar's agent and process counts (general.interaction.status-bar-words; D5,
   SSYS-057). OWNER: pm7-activity (PM7 build, 2026-10-29). Off (the default) the two items are glyph and number pairs,
   the words in their hover tags; on, they read "16 agents · 2 questions". The value is published as
   html[data-pm-status-words="on"|"off"], which O55's 48-work.js repaints from. Every write path ends in a commit, a
   reset or a render (the row, search, All Project Settings, a project switch), so those three publish it. */
const O55_WORDS_ID = 'general.interaction.status-bar-words';
function o55ApplyStatusWords() {
  const v = PM51.value(O55_WORDS_ID), want = o55On(v) ? 'on' : 'off', root = document.documentElement;
  if (root.getAttribute('data-pm-status-words') !== want) root.setAttribute('data-pm-status-words', want);
}
const o55WordsCommit = commitSettingValue;
commitSettingValue = function (id) { const ok = o55WordsCommit.apply(this, arguments); if (ok && id === O55_WORDS_ID) o55ApplyStatusWords(); return ok; };
const o55WordsRestore = restoreSettingDefault;
restoreSettingDefault = function (id) { const ok = o55WordsRestore.apply(this, arguments); if (id === O55_WORDS_ID) o55ApplyStatusWords(); return ok; };
const o55WordsRender = renderApp;
renderApp = function () { const r = o55WordsRender.apply(this, arguments); o55ApplyStatusWords(); return r; };
window.setTimeout(o55ApplyStatusWords, 0);
