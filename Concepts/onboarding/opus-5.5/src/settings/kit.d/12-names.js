/* O55 · AI service names. Older fixtures (web abilities, media routes, Back Seat Driver, commands) name services the
   way the Settings list used to ("Claude Code", "Codex", "Kimi For Coding"). The list now uses onboarding's names;
   PM51.serviceName reads an old name as the current one, so a route that says "Codex" matches "ChatGPT / Codex". */
const O55_OLD_SERVICE_NAMES = {
  'Claude Code': 'Claude', 'Codex': 'ChatGPT / Codex', 'OpenAI Codex': 'ChatGPT / Codex', 'Antigravity CLI': 'Google Antigravity',
  'Gemini Direct': 'Gemini API', 'Cursor CLI': 'Cursor', 'Kimi For Coding': 'Kimi Code', 'Alibaba / Qwen Coding Plan': 'Qwen Coding Plan',
  'Z.AI / Zhipu Coding Plan': 'Z.AI Coding Plan', 'OpenCode': 'OpenCode on your computer', 'Local / offline endpoint': 'Local model server'
};
PM51.serviceName = name => O55_OLD_SERVICE_NAMES[name] || name;
PM51.sameService = (a, b) => PM51.serviceName(a) === PM51.serviceName(b);
/* Old names inside a sentence ("Antigravity CLI signed out"): only the names that cannot be part of a new one. */
const O55_OLD_IN_TEXT = [['Antigravity CLI', 'Google Antigravity'], ['Kimi For Coding', 'Kimi Code'], ['Gemini Direct', 'Gemini API'], ['Cursor CLI', 'Cursor'], ['Alibaba / Qwen Coding Plan', 'Qwen Coding Plan'], ['Z.AI / Zhipu Coding Plan', 'Z.AI Coding Plan']];
PM51.serviceText = s => O55_OLD_IN_TEXT.reduce((out, [from, to]) => out.split(from).join(to), String(s == null ? '' : s));
