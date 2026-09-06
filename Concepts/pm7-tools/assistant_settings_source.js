/* T49 Assistant settings: projections reuse ordinary exact-ID project values.
   Model/persona catalogs are read from the existing configured inventories.
   This module adds no scheduler or assistant execution runtime. */
function installAssistantSettingsProjection(){
  const schema=window.PM49_ASSISTANT_SETTINGS;
  const ref=window.PM12_REFERENCE;
  // The previous curated row used a short alias. Bind it to the canonical
  // ID and retire the duplicate curated occurrence, rather than add a second
  // persisted preference for the same presentation.
  for(const domain of D.domains)for(const ws of domain.workspaces)for(const section of ws.sections||[]){
    section.settings=(section.settings||[]).filter(s=>s.id!=='working-activity-style');
  }

  const byId=new Map(Object.values(ref.byCat).flatMap(c=>c.settings).map(s=>[s.id,s]));
  const controlFor={radio:'segmented',toggle:'toggle',number:'number',select:'select',list:'list'};
  const sections=schema.curated_sections.map(section=>({id:section.id,label:section.label,description:'',eyebrow:'Assistant',settings:section.setting_ids.map(id=>{
    const source=byId.get(id);if(!source)throw new Error('Missing Assistant setting: '+id);
    return {id,label:source.label,description:'',control:controlFor[source.type]||source.type,value:JSON.parse(JSON.stringify(source.default)),options:source.options||[],min:source.min,max:source.max,
      detail:{what:source.desc,applies:'This project.',related:[],notes:'The runtime consumes this exact setting ID.'}};
  })}));
  D.domains.find(d=>d.id==='general').workspaces.splice(1,0,{id:'assistant',label:'Assistant',type:'settings',sections});
}
function assistantSetting(id){const f=findSettingGlobal(id);return f?settingValue(f.setting):undefined;}
function assistantSave(id,value){if(!commitSettingValue(id,value))return false;saveState();renderApp({soft:true});return true;}
function assistantButton(text,iconName,cb){return '<button type="button" class="btn pm49-choice" data-ui-action-id="ui.settings.assistant.choose" data-callback="'+registerAction(cb)+'">'+icon(iconName)+'<span>'+escapeHtml(text)+'</span>'+icon('down')+'</button>';}
function assistantModelRoutes(){
  // Same endpoint discovery owner as Web/Media/Models; expand configured
  // accounts, rather than silently keeping only each provider's default.
  return endpointOptions('').flatMap(endpoint=>(endpoint.provider.accounts||[]).filter(a=>a.active).map(a=>({...endpoint,account:a,value:endpoint.provider.id+'::'+endpoint.model.id+'::'+a.id,label:endpoint.model.name+' · '+a.nickname,providerLabel:endpoint.provider.name})));
}
function assistantRouteLabel(value){if(value==='Default'||!value)return 'Default model';return assistantModelRoutes().find(r=>r.value===value)?.label||String(value)+' · unavailable';}
function assistantPersonas(){return [...new Set(['Critical Advisor',...(state.personas||[]).map(p=>p.name).filter(Boolean)])];}
function assistantPick(anchor,kind,current,onPick){
  const choices=kind==='model'?[{value:'Default',label:'Default model',meta:'Resolver'},...assistantModelRoutes().map(r=>({value:r.value,label:r.label,meta:r.providerLabel}))]:assistantPersonas().map(name=>({value:name,label:name,meta:''}));
  openMenu(anchor,choices.map(c=>({label:c.label,meta:c.meta,icon:c.value===current?'check':kind==='model'?'brain':'user',onClick:()=>onPick(c.value)})),kind==='model'?'Model & account':'Persona');
  const menu=portalRoot().querySelector('.popover');if(!menu)return;
  menu.classList.add('pm49-picker');const input=document.createElement('input');input.type='search';input.className='text-control';input.placeholder=kind==='model'?'Search models and accounts':'Search personas';input.setAttribute('aria-label',input.placeholder);menu.insertBefore(input,menu.firstChild);
  input.addEventListener('input',()=>{const q=input.value.toLowerCase();menu.querySelectorAll('.menu-item').forEach(b=>b.hidden=!b.textContent.toLowerCase().includes(q));});requestAnimationFrame(()=>input.focus());
}
function assistantStages(){
  const id='safety.approvals.bsd-stage-bindings',projectId=window.PM7_SETTINGS_TOME.project()?.id,before=JSON.stringify(assistantSetting(id)),chosen=new Set(assistantSetting(id)||[]);
  openDialog({title:'Advisor workflow stages',body:'<div class="pm49-stage-grid">'+window.PM49_ASSISTANT_SETTINGS.stages.map(([key,label])=>'<label><input type="checkbox" name="'+key+'" '+(chosen.has(key)?'checked':'')+'> '+escapeHtml(label)+'</label>').join('')+'</div>',saveLabel:'Save stages',onSave:(_v,form)=>{
    if(window.PM7_SETTINGS_TOME.project()?.id!==projectId||JSON.stringify(assistantSetting(id))!==before){showToast('Settings changed','Reopen the workflow stages.','warning');return false;}
    return assistantSave(id,window.PM49_ASSISTANT_SETTINGS.stages.filter(([key])=>form.querySelector('[name="'+key+'"]')?.checked).map(([key])=>key));
  }});
}
function assistantRoster(id){
  const source=assistantSetting(id),before=JSON.stringify(source),projectId=window.PM7_SETTINGS_TOME.project()?.id;
  if(Array.isArray(source)&&source.some(r=>typeof r!=='string'&&(!r||typeof r!=='object'||Array.isArray(r)))){showToast('Lineup needs attention','The saved lineup contains an invalid record. Nothing was changed.','warning');return;}
  const rows=Array.isArray(source)?JSON.parse(JSON.stringify(source)).map(r=>typeof r==='string'?{role:r,model:'Default',persona:'Critical Advisor'}:r):[];
  let serial=0;rows.forEach(r=>{r._rowId=++serial;});
  function paint(){return '<div class="pm49-roster"><p class="pm49-caption">'+(rows.length?rows.length+' participants':'Automatic lineup')+'</p>'+rows.map((r,i)=>'<div class="pm49-member" data-row="'+r._rowId+'"><div class="pm49-member-head"><span>'+(i+1)+'</span><input class="text-control" data-roster-role="'+r._rowId+'" value="'+escAttr(r.role||'Participant')+'" aria-label="Participant role"><button type="button" class="icon-btn" data-callback="'+registerAction(()=>{rows.splice(rows.indexOf(r),1);repaint();})+'" aria-label="Remove participant">'+icon('close')+'</button></div><div class="pm49-member-pickers">'+assistantButton(assistantRouteLabel(r.model||'Default'),'brain',el=>assistantPick(el,'model',r.model,v=>{r.model=v;repaint();}))+assistantButton(r.persona||'Critical Advisor','user',el=>assistantPick(el,'persona',r.persona,v=>{r.persona=v;repaint();}))+'</div></div>').join('')+'<button type="button" class="btn" '+(rows.length>=8?'disabled':'')+' data-callback="'+registerAction(()=>{rows.push({_rowId:++serial,role:'Participant '+(rows.length+1),model:'Default',persona:'Critical Advisor'});repaint();})+'">'+icon('plus')+' Add participant</button></div>';}
  function repaint(){const host=portalRoot().querySelector('[data-pm49-roster]');if(host){host.innerHTML=paint();wire();}}
  function wire(){portalRoot().querySelectorAll('[data-roster-role]').forEach(input=>input.addEventListener('input',()=>{const row=rows.find(r=>r._rowId===Number(input.dataset.rosterRole));if(row)row.role=input.value;}));}
  openDialog({title:findSettingGlobal(id)?.setting.label||'Agent lineup',body:'<div data-pm49-roster>'+paint()+'</div>',wide:true,saveLabel:'Save lineup',onOpen:wire,onSave:()=>{
    if(window.PM7_SETTINGS_TOME.project()?.id!==projectId||JSON.stringify(assistantSetting(id))!==before){showToast('Settings changed','Reopen this lineup before saving.','warning');return false;}
    if(rows.some(r=>!String(r.role||'').trim())){showToast('Name each role','A participant role is empty.','warning');return false;}
    if(rows.some(r=>r.model&&r.model!=='Default'&&!assistantModelRoutes().some(m=>m.value===r.model))){showToast('Model unavailable','Choose an available model and account.','warning');return false;}
    if(rows.some(r=>r.persona&&!assistantPersonas().includes(r.persona))){showToast('Persona unavailable','Choose a current Persona before saving.','warning');return false;}
    return assistantSave(id,rows.map(({_rowId,...r})=>r));
  }});
}
const assistantOriginalControl=renderControl;
renderControl=function(setting,value){
  const id=setting.id;
  if(id==='safety.approvals.bsd-model')return assistantButton(assistantRouteLabel(value),'brain',el=>assistantPick(el,'model',value,v=>assistantSave(id,v)));
  if(id==='safety.approvals.bsd-persona')return assistantButton(value||'Critical Advisor','user',el=>assistantPick(el,'persona',value,v=>assistantSave(id,v)));
  if(id==='safety.approvals.bsd-stage-bindings')return assistantButton((value||[]).length+' stages','settings',()=>assistantStages());
  if(window.PM49_ASSISTANT_SETTINGS.roster_ids.includes(id))return assistantButton(Array.isArray(value)&&value.length?value.length+' participants':'Automatic lineup','users',()=>assistantRoster(id));
  const units={'safety.approvals.bsd-cooldown-turns':'turns','safety.approvals.schedule-wind-down-minutes':'minutes','safety.approvals.schedule-grace-minutes':'minutes'};
  if(units[id])return assistantOriginalControl(setting,value).replace('<output>number</output>','<output>'+units[id]+'</output>');
  if(id==='safety.approvals.bsd-self-compact-threshold')return assistantOriginalControl(setting,value).replace('<output>number</output>','<output>'+Math.round(Number(value)*100)+'%</output>');
  return assistantOriginalControl(setting,value);
};
function assistantBsdRows(keys){
  return keys.map(key=>{const id='safety.approvals.bsd-'+key,f=findSettingGlobal(id);if(!f)return '';return '<div class="pm49-setting" data-setting-id="'+id+'"><span>'+escapeHtml(f.setting.label)+'</span><div>'+renderControl(f.setting,settingValue(f.setting))+'</div></div>';}).join('');
}
renderBSD=function(){
  const b=state.bsd;
  // Canonical Settings values are the source for this manager projection.
  b.mode=assistantSetting('safety.approvals.bsd-mode')||'Auto';
  const model=assistantModelRoutes().find(r=>r.value===assistantSetting('safety.approvals.bsd-model'));
  if(model){b.provider=model.provider.name;b.model=model.model.name;b.account=model.account.nickname;}
  return '<div class="manager-page page-enter pm49-bsd">'+pageHeader('eye','Back Seat Driver','Read-only advisor','')+'<div class="manager-body"><div class="manager-scroll"><section class="panel-card">'+assistantBsdRows(['mode','model','persona'])+'</section><section class="panel-card"><h3>When to advise</h3>'+assistantBsdRows(['trigger-sensitivity','catch-up-seconds','cooldown-turns','stage-bindings'])+'</section><section class="panel-card"><h3>Advisor context</h3>'+assistantBsdRows(['retain-transcript','self-compact-threshold'])+'</section><details class="pm49-policy"><summary>Fallback & usage policy</summary><div class="form-grid">'+inlineSelect('Fallback provider','bsd-fallback-provider',b.fallbackProvider,state.providers.filter(p=>p.status==='active'&&p.id!=='free-models').map(p=>p.name),'change-bsd-fallback-provider')+inlineSelect('Fallback model','bsd-fallback-model',b.fallbackModel,(state.providers.find(p=>p.name===b.fallbackProvider)?.models||[]).filter(m=>m.enabled).map(m=>m.name),'change-bsd-field','fallbackModel')+'</div><div class="info-grid">'+infoRow('Usage boundary',b.usageBoundary)+infoRow('Intervention',b.intervention)+'</div><button class="btn" data-action="edit-bsd-policy">Edit policy</button></details></div></div></div>';
};
