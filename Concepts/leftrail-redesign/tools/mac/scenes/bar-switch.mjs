/* Film: switch panel from the activity bar (setup shows Files; trigger clicks Docker). --param to=docker --param ms=700 */
export default (p) => ({
  ms: Number(p.ms || 700),
  async setup(pm) { await pm.panel('files'); await pm.wait(600); },
  trigger: `(() => { document.querySelector('#activityBar .icon[data-target="panel-${p.to || 'docker'}"]').click(); return true; })()`,
});
