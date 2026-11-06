// Saved producer references without the newer label cache or current NAS selection.
export default async function(t) {
 const f=await t.app.open({onboarding:true,query:'o55=fresh'});
 await f.waitForFunction(()=>window.O55?.S?.open);
 for(const ref of ['ssh:sshp:server-this:a95f0eb3/volume1/projects','pm:home/volume1/projects','constructor','toString','__proto__']) {
  for(const backup of [false,true]) {
   const r=await f.evaluate(([ref,backup])=>{const S=O55.S,d=S.sess.drafts.main;S.sess.nas=backup?{purpose:'dest',device:S.env.devices.find(x=>x.id!=='nas-home').id}:{};S.sess.nasPlaces={};d.project_mode='existing_local';d.project_transport='ssh';d.project_source_ref=ref;d.storage_mode='project_source';d.storage_location=ref;S.openedAt='review';S.sess.screen='review';O55.ui.refresh();const label=O55.nas.placeLabel(S,ref);return {type:typeof label,label:String(label)};},[ref,backup]);
   await f.waitForTimeout(700);
   const text=await f.locator('.o55-pane > .o55-layer:not(.o55-out)').innerText();
   const seed=ref.includes('/volume1/');
   await t.check(`${ref} backup=${backup}: own device or safe fallback`,r.type==='string'&&(seed?/Home NAS/.test(r.label)&&/Home NAS/.test(text):! /native code|\[object Object\]/.test(r.label)),JSON.stringify({r,text}));
  }
 }
}
