from pathlib import Path
root=Path("/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro")

def sub(p, old, new, count=1):
    t=p.read_text()
    if t.count(old)!=count:
        raise SystemExit(f"ANCHOR FAIL in {p.name}: found {t.count(old)} of:\n{old[:160]}")
    p.write_text(t.replace(old,new,count))

css=root/'styles.css'
CSS_BLOCK = """
.demo-dialog { left:auto;top:auto;transform:none;max-height:none;min-width:360px;min-height:280px;animation:demo-dialog-in var(--spring) both; }
.demo-dialog .drawer-head[data-dialog-drag] { cursor:move;touch-action:none;user-select:none; }
.demo-dialog .drawer-head[data-dialog-drag] button { cursor:pointer;user-select:auto; }
.demo-resize { position:absolute;z-index:30;touch-action:none;user-select:none; }
.demo-resize[data-dialog-resize="n"] { top:0;left:10px;right:10px;height:6px;cursor:ns-resize; }
.demo-resize[data-dialog-resize="s"] { bottom:0;left:10px;right:10px;height:6px;cursor:ns-resize; }
.demo-resize[data-dialog-resize="e"] { top:10px;right:0;bottom:10px;width:6px;cursor:ew-resize; }
.demo-resize[data-dialog-resize="w"] { top:10px;left:0;bottom:10px;width:6px;cursor:ew-resize; }
.demo-resize[data-dialog-resize="ne"],.demo-resize[data-dialog-resize="nw"],.demo-resize[data-dialog-resize="se"],.demo-resize[data-dialog-resize="sw"] { width:12px;height:12px; }
.demo-resize[data-dialog-resize="ne"] { top:0;right:0;cursor:nesw-resize; }
.demo-resize[data-dialog-resize="nw"] { top:0;left:0;cursor:nwse-resize; }
.demo-resize[data-dialog-resize="se"] { bottom:0;right:0;cursor:nwse-resize; }
.demo-resize[data-dialog-resize="sw"] { bottom:0;left:0;cursor:nesw-resize; }
.demo-resize:hover,.demo-resize.dragging { background:color-mix(in srgb,var(--accent) 28%,transparent); }
.demo-dialog.dragging,.demo-dialog.resizing { animation:none;user-select:none; }"""
sub(css, "outline:0}\n.toast-stack{position:fixed", "outline:0}"+CSS_BLOCK+"\n.toast-stack{position:fixed")
sub(css, "@keyframes dialog-in{0%{opacity:0;transform:translate(-50%,-47%) scale(.97)}100%{opacity:1;transform:translate(-50%,-50%)}}\n",
         "@keyframes dialog-in{0%{opacity:0;transform:translate(-50%,-47%) scale(.97)}100%{opacity:1;transform:translate(-50%,-50%)}}\n@keyframes demo-dialog-in{0%{opacity:0;transform:scale(.97)}100%{opacity:1;transform:none}}\n")

app=root/'app.js'
HELPERS = """  let dragState = null;
  let lastDemoGeom = null;
  const DEMO_MIN_W = 360, DEMO_MIN_H = 280;

  function defaultDemoGeom(){
    const width=Math.min(820,window.innerWidth-20);
    const height=Math.min(Math.round(window.innerHeight*0.72),window.innerHeight-20);
    return {left:Math.round((window.innerWidth-width)/2),top:Math.round((window.innerHeight-height)/2),width,height};
  }
  function clampDemoGeom(g){
    const width=clamp(g.width,DEMO_MIN_W,window.innerWidth-8);
    const height=clamp(g.height,DEMO_MIN_H,window.innerHeight-8);
    const left=clamp(g.left,4,Math.max(4,window.innerWidth-width-4));
    const top=clamp(g.top,4,Math.max(4,window.innerHeight-height-4));
    return {left,top,width,height};
  }
  function openDemoDialog(){
    const geom=clampDemoGeom((state.dialog?.type==='demo'&&state.dialog.geom)||lastDemoGeom||defaultDemoGeom());
    state.dialog={type:'demo',geom};state.menu=null;renderOverlays();
  }
  function applyDemoGeomStyles(el,g){
    if(!el||!g)return;
    el.style.left=`${g.left}px`;el.style.top=`${g.top}px`;el.style.width=`${g.width}px`;el.style.height=`${g.height}px`;el.style.transform='none';
  }
  function demoResizeHandles(){
    return ['n','e','s','w','ne','nw','se','sw'].map(d=>`<div class="demo-resize" data-dialog-resize="${d}"></div>`).join('');
  }
"""
sub(app, "  let dragState = null;\n", HELPERS)

# renderDemoDialog return -> geometry-aware
sub(app, "    return `<section class=\"dialog\"><div class=\"drawer-head\"><span class=\"event-icon\">${icon('sparkles',13)}</span><strong>Demo Studio</strong>",
         "    const g=clampDemoGeom(state.dialog.geom||lastDemoGeom||defaultDemoGeom());\n    state.dialog.geom=g;\n    return `<section class=\"dialog demo-dialog\" style=\"left:${g.left}px;top:${g.top}px;width:${g.width}px;height:${g.height}px;transform:none\"><div class=\"drawer-head\" data-dialog-drag><span class=\"event-icon\">${icon('sparkles',13)}</span><strong>Demo Studio</strong>")
sub(app, "</section>`).join('')}</div></div></section>`;\n  }", "</section>`).join('')}</div></div>${demoResizeHandles()}</section>`;\n  }")

sub(app, "    if(a==='open-demo'){state.dialog={type:'demo'};state.menu=null;renderOverlays();return;}\n    if(a==='close-dialog'){state.dialog=null;renderOverlays();return;}",
         "    if(a==='open-demo'){openDemoDialog();return;}\n    if(a==='close-dialog'){if(state.dialog?.type==='demo'&&state.dialog.geom)lastDemoGeom={...state.dialog.geom};state.dialog=null;renderOverlays();return;}")

sub(app, "if(k==='recipe'){applyRecipe(e.target.value);state.dialog={type:'demo'};renderOverlays();return;}",
         "if(k==='recipe'){applyRecipe(e.target.value);openDemoDialog();return;}")

sub(app, "      if(state.dialog){state.dialog=null;renderOverlays();return;}",
         "      if(state.dialog){if(state.dialog.type==='demo'&&state.dialog.geom)lastDemoGeom={...state.dialog.geom};state.dialog=null;renderOverlays();return;}")

POINTERDOWN = """    const resizeHandle=e.target.closest('[data-dialog-resize]');
    if(resizeHandle&&state.dialog?.type==='demo'){
      e.preventDefault();
      const g=state.dialog.geom||defaultDemoGeom();
      const el=document.querySelector('.demo-dialog');
      resizeHandle.setPointerCapture?.(e.pointerId);
      dragState={kind:'demo-resize',dir:resizeHandle.dataset.dialogResize,startX:e.clientX,startY:e.clientY,orig:{...g},el,handle:resizeHandle};
      el?.classList.add('resizing');resizeHandle.classList.add('dragging');
      return;
    }
    const dragBar=e.target.closest('[data-dialog-drag]');
    if(dragBar&&state.dialog?.type==='demo'&&!e.target.closest('button,select,input,a,[data-action]')){
      e.preventDefault();
      const g=state.dialog.geom||defaultDemoGeom();
      const el=document.querySelector('.demo-dialog');
      dragBar.setPointerCapture?.(e.pointerId);
      dragState={kind:'demo-move',startX:e.clientX,startY:e.clientY,orig:{...g},el};
      el?.classList.add('dragging');
      return;
    }
    const handle=e.target.closest('[data-resize]');if(!handle)return;"""
sub(app, "    const handle=e.target.closest('[data-resize]');if(!handle)return;", POINTERDOWN)

POINTERMOVE = """    if(!dragState)return;
    if(dragState.kind==='demo-move'){
      const g=clampDemoGeom({...dragState.orig,left:dragState.orig.left+(e.clientX-dragState.startX),top:dragState.orig.top+(e.clientY-dragState.startY)});
      state.dialog.geom=g;applyDemoGeomStyles(dragState.el,g);return;
    }
    if(dragState.kind==='demo-resize'){
      const dx=e.clientX-dragState.startX, dy=e.clientY-dragState.startY, o=dragState.orig, dir=dragState.dir;
      let left=o.left, top=o.top, width=o.width, height=o.height;
      if(dir.includes('e')) width=o.width+dx;
      if(dir.includes('s')) height=o.height+dy;
      if(dir.includes('w')){width=o.width-dx;left=o.left+dx;}
      if(dir.includes('n')){height=o.height-dy;top=o.top+dy;}
      const g=clampDemoGeom({left,top,width,height});
      // When clamping width/height from n/w edges, keep the opposite edge anchored.
      if(dir.includes('w')&&g.width!==width) g.left=o.left+o.width-g.width;
      if(dir.includes('n')&&g.height!==height) g.top=o.top+o.height-g.height;
      const final=clampDemoGeom(g);
      state.dialog.geom=final;applyDemoGeomStyles(dragState.el,final);return;
    }
    const dx=e.clientX-dragState.startX;"""
sub(app, "    if(!dragState)return;\n    const dx=e.clientX-dragState.startX;", POINTERMOVE)

sub(app, "  document.addEventListener('pointerup',()=>{if(dragState){document.querySelectorAll('.dragging').forEach(x=>x.classList.remove('dragging'));dragState=null;savePrefs();}});",
"""  document.addEventListener('pointerup',()=>{
    if(!dragState)return;
    if(dragState.kind==='demo-move'||dragState.kind==='demo-resize'){
      dragState.el?.classList.remove('dragging','resizing');
      dragState.handle?.classList.remove('dragging');
      if(state.dialog?.geom)lastDemoGeom={...state.dialog.geom};
      dragState=null;return;
    }
    document.querySelectorAll('.dragging').forEach(x=>x.classList.remove('dragging'));dragState=null;savePrefs();
  });""")

sub(app, "  window.addEventListener('resize',()=>{if(state.menu||state.hover)renderOverlays();if(isNarrow()&&state.historyMode==='pinned')renderApp();});",
"""  window.addEventListener('resize',()=>{
    if(state.dialog?.type==='demo'&&state.dialog.geom){
      state.dialog.geom=clampDemoGeom(state.dialog.geom);lastDemoGeom={...state.dialog.geom};
      applyDemoGeomStyles(document.querySelector('.demo-dialog'),state.dialog.geom);
    }
    if(state.menu||state.hover)renderOverlays();if(isNarrow()&&state.historyMode==='pinned')renderApp();
  });""")
print("backport applied")
