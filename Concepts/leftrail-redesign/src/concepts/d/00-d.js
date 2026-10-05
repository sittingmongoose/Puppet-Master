/* Concept D (Polish) — today's rail, polished. A skin concept: it keeps the shell's own Files, Source Control and
   Docker panels (#panel-files, #panel-source, #panel-docker) and restyles them under html[data-rail-skin="d"] in d.css,
   adding motion and small DOM enhancements in mount(). Stub registered at handoff (2026-10-05); the Polish build
   replaces it. See ~/PM-Experiments/leftrail-redesign-20261002/HANDOFF-D-POLISH.md. */
PMR.concepts.register('d', {
  label: 'Polish', blurb: "Today's rail, polished", skin: true,
  mount() { return { show() {}, destroy() {} }; },
});
