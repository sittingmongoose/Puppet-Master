/* FO-186 (Jared's Settings review, 2026-11-13, #4: "There is a field that says model nicknames...It makes no sense, it
   doesnt let you set any values that make sense, this is pointless."). Canon: Plans/settings_inventory.json
   ai.models.model-alias and Models_System 6.7-6.8 (DL-479): one Model nicknames list, on Models › Presets and nicknames,
   for chat and media models; the Media box (media.image.model-aliases) is retired into it.
     a line        a nickname and the one model it means: the model is chosen in the shared model picker (the model
                   rows' popup, kit.d/31-model-rows.js), models only, no depth (a preset, not a nickname, holds a depth)
     built-ins     the 6.8 table's nicknames are in the same list, marked Built in; a line of yours whose nickname
                   normalizes the same replaces one, and removing that line brings it back. The stored value holds only
                   your own lines ({} by default)
     refusals      a nickname that normalizes the same as one already in the list, or that equals a model's exact name
                   (it would hide that model), is not saved, and says why, beside the line and in a toast
   Nicknames normalize as 6.7 says: lowercase, spaces, underscores and hyphens collapse. The row is wide: the list under
   its words, then a line to add one. */
const O55_NICK_ID = 'ai.models.model-alias';
const O55_NICK_BUILTIN = [
  ['nano banana', 'gemini-2.5-flash-image', 'Gemini 2.5 Flash Image', 'Pictures'],
  ['nano banana pro', 'gemini-3-pro-image-preview', 'Gemini 3 Pro Image', 'Pictures'],
  ['veo fast', 'veo-3.1-fast-generate-preview', 'Veo 3.1 Fast', 'Videos'],
  ['tts flash', 'gemini-2.5-flash-preview-tts', 'Gemini 2.5 Flash speech', 'Reading aloud'],
  ['tts pro', 'gemini-2.5-pro-preview-tts', 'Gemini 2.5 Pro speech', 'Reading aloud']
];
const o55NickNorm = s => String(s == null ? '' : s).trim().toLowerCase().replace(/[\s_-]+/g, ' ');
const o55NickValue = () => { const v = PM51.value ? PM51.value(O55_NICK_ID) : null; return v && typeof v === 'object' && !Array.isArray(v) ? Object.assign({}, v) : {}; };
/* the models a nickname may name: your signed-in models, then the media models of the built-in table */
function o55NickChoices() {
  const chat = o55Ready().map(m => ({ value: m.value, label: String(m.label).split(' · ').slice(0, -1).join(' · ') || m.label, meta: m.meta || '', brand: o55BrandOf(m.value, m) }));
  const media = O55_NICK_BUILTIN.map(([, id, name, kind]) => ({ value: id, label: name, meta: kind, brand: 'Google' }));
  const seen = new Set();
  return chat.concat(media).filter(m => !seen.has(m.value) && seen.add(m.value));
}
const o55NickModelName = id => { const m = o55NickChoices().find(x => x.value === id); return m ? m.label : String(id || ''); };
/* why a nickname can't be saved, or '' */
function o55NickRefusal(nick, model, own, editing) {
  const n = o55NickNorm(nick);
  if (!n) return 'Type a nickname first.';
  if (!model) return `Choose the model “${String(nick).trim()}” means.`;
  const twin = Object.keys(own).find(k => k !== editing && o55NickNorm(k) === n);
  if (twin) return `“${String(nick).trim()}” is already a nickname here (as “${twin}”). A nickname can mean only one model.`;
  const ids = o55NickChoices().flatMap(m => [m.value, String(m.value).split('/').pop()]);
  const exact = ids.find(id => o55NickNorm(id) === n);
  if (exact) return `“${String(nick).trim()}” is a model's exact name (${exact}). A nickname can't hide a model.`;
  return '';
}
const o55NickChoicesFor = (cur, first) => (first ? [first] : []).concat(o55NickChoices()).concat(cur && !o55NickChoices().some(m => m.value === cur) ? [{ value: cur, label: cur, meta: 'Not in the list now' }] : []);
function o55NickHtml(msg) {
  const own = o55NickValue();
  const mine = Object.keys(own).map(k => ({ nick: k, model: own[k], builtin: O55_NICK_BUILTIN.some(([b]) => b === o55NickNorm(k)) }));
  const shown = O55_NICK_BUILTIN.filter(([b]) => !mine.some(x => o55NickNorm(x.nick) === b));
  const line = x => `<div class="o55-nick-line" role="listitem" data-nick="${a(x.nick)}"><span class="o55-nick-name">${h(x.nick)}</span><span class="o55-nick-eq" aria-hidden="true">means</span>${PM51.modelSelect(O55_NICK_ID, x.model, { choices: o55NickChoicesFor(x.model), action: 'pm51-nick-model', data: { nick: x.nick }, label: `Model for “${x.nick}”` })}${x.builtin ? '<em class="o55-nick-tag">Replaces a built-in</em>' : ''}${PM51.iconBtn({ icon: 'trash', label: `Remove “${x.nick}”`, action: 'pm51-nick-remove', data: { nick: x.nick } })}</div>`;
  const built = ([n, id]) => `<div class="o55-nick-line is-builtin" role="listitem" data-nick="${a(n)}"><span class="o55-nick-name">${h(n)}</span><span class="o55-nick-eq" aria-hidden="true">means</span><span class="o55-nick-model" title="${a(id)}">${h(o55NickModelName(id))}</span><em class="o55-nick-tag">Built in</em>${PM51.iconBtn({ icon: 'edit', label: `Point “${n}” at another model`, action: 'pm51-nick-replace', data: { nick: n } })}</div>`;
  return `<div class="o55-nick" data-setting-id="${a(O55_NICK_ID)}"><div class="o55-nick-list" role="list" aria-label="Model nicknames">${mine.map(line).join('')}${shown.map(built).join('')}</div>
    <div class="o55-nick-add"><input class="text-control o55-nick-input" type="text" autocomplete="off" spellcheck="false" placeholder="Nickname, for example fast" aria-label="New nickname">${PM51.modelSelect(O55_NICK_ID, '', { choices: o55NickChoicesFor('', { value: '', label: 'Choose a model…', pre: true, none: true }), cls: 'o55-nick-pick', label: 'Model the new nickname means' })}${PM51.btn({ label: 'Add', icon: 'plus', small: true, action: 'pm51-nick-add' })}</div>
    <div class="o55-nick-msg${msg ? ' is-refused' : ''}" role="status" aria-live="polite">${msg ? `${icon('alert')}<span>${h(msg)}</span>` : ''}</div></div>`;
}
/* the list redrawn in place after a change; focus goes where the next step is */
function o55NickRedraw(msg, focus) {
  document.querySelectorAll('.o55-nick').forEach(el => {
    const tpl = document.createElement('template'); tpl.innerHTML = o55NickHtml(msg);
    const next = tpl.content.firstElementChild; el.replaceWith(next);
    const f = focus && next.querySelector(focus);
    if (f) { try { f.focus({ preventScroll: true }); } catch (e) { f.focus(); } }
  });
}
function o55NickSave(next, said) {
  /* no lines of your own is the default (only the built-ins): the row goes back to it and is no longer Changed */
  const ok = Object.keys(next).length ? commitSettingValue(O55_NICK_ID, next) : restoreSettingDefault(O55_NICK_ID);
  if (!ok) return false;
  saveState(); o55MarkChanged(O55_NICK_ID);
  if (said) showToast('Saved', said, 'success', 2200);
  return true;
}
function o55NickRefuse(why, focus) { showToast('Not saved', why, 'info', 3200); o55NickRedraw(why, focus); }
PM51.on('nick-add', el => {
  const box = el.closest('.o55-nick'); if (!box) return;
  const input = box.querySelector('.o55-nick-input'), sel = box.querySelector('.o55-nick-add select');
  const nick = String(input.value || '').trim(), model = sel ? sel.value : '';
  const own = o55NickValue(), why = o55NickRefusal(nick, model, own, null);
  if (why) {
    /* the typed nickname and the chosen model stay, so the person can fix the one that was refused */
    o55NickRefuse(why, '.o55-nick-input');
    const again = document.querySelector('.o55-nick .o55-nick-input'); if (again) again.value = nick;
    const pick = document.querySelector('.o55-nick .o55-nick-add select'); if (pick && model) { pick.value = model; const w = pick.closest('.o55-msel'); if (w) o55MselRefresh(w); }
    return;
  }
  own[nick] = model;
  const replaces = O55_NICK_BUILTIN.some(([b]) => b === o55NickNorm(nick));
  if (o55NickSave(own, `Model nicknames: “${nick}” means ${o55NickModelName(model)}${replaces ? ', in place of the built-in' : ''}.`)) o55NickRedraw('', '.o55-nick-input');
});
PM51.onChange('nick-model', el => {
  const nick = ds(el, 'nick'), own = o55NickValue(); if (!(nick in own)) return;
  own[nick] = el.value;
  o55NickSave(own, `Model nicknames: “${nick}” means ${o55NickModelName(el.value)}.`);
});
PM51.on('nick-remove', el => {
  const nick = ds(el, 'nick'), own = o55NickValue(); if (!(nick in own)) return;
  delete own[nick];
  const back = O55_NICK_BUILTIN.some(([b]) => b === o55NickNorm(nick));
  if (o55NickSave(own, `Model nicknames: “${nick}” removed${back ? '; the built-in is back' : ''}.`)) o55NickRedraw('', '.o55-nick-input');
});
/* a built-in is pointed elsewhere by a line of your own with its nickname: the add line, filled in, its picker next */
PM51.on('nick-replace', el => {
  const box = el.closest('.o55-nick'); if (!box) return;
  const input = box.querySelector('.o55-nick-input'); input.value = ds(el, 'nick');
  const t = box.querySelector('.o55-nick-add .o55-msel-trigger'); if (t) { try { t.focus({ preventScroll: true }); } catch (e) { t.focus(); } }
});
/* Enter in the nickname box adds the line */
document.addEventListener('keydown', e => {
  if (e.key !== 'Enter' || !e.target || !e.target.classList || !e.target.classList.contains('o55-nick-input')) return;
  const add = e.target.closest('.o55-nick').querySelector('[data-action="pm51-nick-add"]'); if (!add) return;
  e.preventDefault(); add.click();
}, true);
const o55NickKit = renderControl;
renderControl = function (setting) {
  if (setting && setting.id === O55_NICK_ID) return o55NickHtml('');
  return o55NickKit.apply(this, arguments);
};
/* the value in words: your own lines (the built-ins are not stored) */
const o55NickText = PM51.valueText;
PM51.valueText = (setting, v) => {
  if (!setting || setting.id !== O55_NICK_ID) return o55NickText(setting, v);
  const own = v && typeof v === 'object' && !Array.isArray(v) ? Object.entries(v) : [];
  return own.length ? own.map(([n, m]) => `${n} → ${o55NickModelName(m)}`).join(', ') : 'Only the built-in nicknames';
};
