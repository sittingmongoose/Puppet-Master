/* Existing manager dispatch, data and persistence stay authoritative. This
   presentation pass makes non-essential explanations explicitly available,
   rather than deleting them or mixing them into every first-view row. */
function narrowManagerMarkup(html){
  const tpl=document.createElement('template');tpl.innerHTML=html;
  tpl.content.querySelectorAll('.stat-note').forEach(el=>{
    if(el.querySelector('button,input,a,select'))return;
    const card=el.closest('.stat-card'),label=card?.querySelector('.stat-label')||card;
    if(label){label.title=el.textContent.trim();el.remove();}
  });
  tpl.content.querySelectorAll('.panel-subtitle').forEach(el=>{
    if(!el.textContent.trim()||el.querySelector('button,input,a,select'))return;
    const details=document.createElement('details');details.className='pm50-explanation';
    const summary=document.createElement('summary');summary.textContent='About';
    details.append(summary,el.cloneNode(true));el.replaceWith(details);
  });
  tpl.content.querySelectorAll('.panel-title-row').forEach(row=>{
    const title=row.querySelector('.panel-title');const guide=row.querySelector('.pm50-explanation summary');
    if(title&&guide)guide.setAttribute('aria-label','About '+title.textContent.trim());
  });
  return tpl.innerHTML;
}
const narrowOriginalWorkspaceBody=renderWorkspaceBody;
renderWorkspaceBody=function(workspace,domain){return narrowManagerMarkup(narrowOriginalWorkspaceBody(workspace,domain));};
// All Settings already has an explicit Details inspector; keep its label and
// value visible, with its longer explanation in that existing inspector.
const narrowOriginalSettingRow=renderSettingRow;
renderSettingRow=function(setting,section,workspace){
 const tpl=document.createElement('template');tpl.innerHTML=narrowOriginalSettingRow(setting,section,workspace);
 const description=tpl.content.querySelector('.setting-description');
 if(description){const label=tpl.content.querySelector('.setting-label');if(label)label.title=description.textContent;description.remove();}
 return tpl.innerHTML;
};
window.PM50_NARROW_REVIEW={version:'3-rebuilt',managerInventory:()=>D.domains.flatMap(d=>d.workspaces.filter(w=>w.type!=='settings').map(w=>({domain:d.id,id:w.id,label:w.label,type:w.type}))),layout:'aligned rows with optional descriptions'};
