/* O55 · the persona library follows Plans/Personas.md §6 (RESERVED-PERSONAS): nine protected core personas with
   fixed ids and display labels. The concept's older seed had four core personas under other names (Puppet Master,
   Generalist, Planning Compiler, Repository Auditor), while the inventory's "Default persona" and "Built-in core
   personas" rows already use the canon ids, so a default could name a persona the list did not have. The library is
   brought in line once: the nine canon personas become the locked core, bundled and custom personas stay, and every
   place that names a persona (crews, Goal templates and Goals, the persona defaults) follows the rename. */
const O55_CORE_PERSONAS = [
  { id: 'assistant', name: 'Assistant', description: 'The default chat persona: broad, warm and collaborative.', tone: 'Warm, helpful', route: 'Balanced route', tools: ['Standard tools'], prompt: 'Help with whatever is asked, directly and kindly. Ask when something is unclear.', chat: true, helper: false },
  { id: 'general-purpose', name: 'General', description: 'Work-first persona for multi-step jobs: look, act, then check.', tone: 'Focused, practical', route: 'Balanced coding route', tools: ['All approved project tools'], prompt: 'Inspect before acting, make the change, and verify it before reporting.', chat: true, helper: true },
  { id: 'overseer', name: 'Overseer', description: 'Delegates, reviews and checks that work is complete and honest.', tone: 'Skeptical, precise', route: 'Highest quality route', tools: ['Repository read', 'Testing', 'Source control'], prompt: 'Hand out bounded tasks, compare the results with what was promised, and record what was verified.', chat: true, helper: true },
  { id: 'bash', name: 'Bash', description: 'Runs terminal commands and keeps their output short. Works as a helper only.', tone: 'Terse', route: 'Fast route', tools: ['Terminal'], prompt: 'Run the commands asked for and report only what matters from the output.', chat: false, helper: true },
  { id: 'teacher', name: 'Teacher', description: 'Explains Puppet Master, its settings and developer tools, patiently.', tone: 'Warm, explanatory', route: 'Balanced route', tools: ['Standard tools', 'Documents'], prompt: 'Explain step by step in plain words, with a small example when it helps.', chat: true, helper: false },
  { id: 'collaborator', name: 'Collaborator', description: 'Plans, clarifies and shapes ideas with you.', tone: 'Curious, structured', route: 'Highest quality route', tools: ['Repository read', 'Planning tools'], prompt: 'Ask the questions that matter, then turn the answers into a clear plan.', chat: true, helper: true },
  { id: 'researcher', name: 'Researcher', description: 'Read-only research across your code and current sources.', tone: 'Analytical, cites sources', route: 'Research route', tools: ['Web', 'Repository read'], prompt: 'Combine what the code shows with current primary sources, and say where each fact came from.', chat: true, helper: true },
  { id: 'deep-researcher', name: 'Deep Researcher', description: 'Read-only, high-effort research: broad sources, comparison and synthesis.', tone: 'Thorough, careful', route: 'Research route', tools: ['Web', 'Documents', 'Repository read'], prompt: 'Cover the question from several sources, compare them, and write down the conclusion and its limits.', chat: true, helper: true },
  { id: 'explorer', name: 'Explorer', description: 'A fast, read-only look through the code for files and symbols. Works as a helper only.', tone: 'Quick, factual', route: 'Fast route', tools: ['Repository read'], prompt: 'Find the files and symbols asked for and return them with short evidence.', chat: false, helper: true }
];
const O55_PERSONA_RENAME = { 'Puppet Master': 'Assistant', Generalist: 'General', 'Planning Compiler': 'Collaborator', 'Repository Auditor': 'Overseer' };
function o55PersonaCanon() {
  if (!state || state.o55PersonasCanon || !Array.isArray(state.personas) || !state.personas.length) return;
  state.o55PersonasCanon = true;
  const rn = n => O55_PERSONA_RENAME[n] || n;
  const core = O55_CORE_PERSONAS.map(c => Object.assign({ group: 'Core', locked: true, crews: [] }, clone(c)));
  state.personas = core.concat(state.personas.filter(p => !p.locked && !core.some(c => c.id === p.id)));
  (state.crews || []).forEach(c => { c.members = [...new Set((c.members || []).map(rn))]; c.lead = rn(c.lead); });
  (state.goalTemplates || []).forEach(t => { t.persona = rn(t.persona); });
  (state.activeGoals || []).forEach(g => { g.persona = rn(g.persona); });
  const s = state.pm51 || {};
  if (s.goals && s.goals.defaults) s.goals.defaults.persona = rn(s.goals.defaults.persona);
  if (s.goals && Array.isArray(s.goals.finished)) s.goals.finished.forEach(f => { f.persona = rn(f.persona); });
  if (s.personas && s.personas.defaults) Object.keys(s.personas.defaults).forEach(k => { s.personas.defaults[k] = rn(s.personas.defaults[k]); });
  state.personas.forEach(p => { p.crews = (state.crews || []).filter(c => (c.members || []).includes(p.name)).map(c => c.name); });
}
const o55EnsurePm51State = ensurePm51State;
ensurePm51State = function () { o55EnsurePm51State(); try { o55PersonaCanon(); } catch (e) { /* the library stays as it was */ } };
