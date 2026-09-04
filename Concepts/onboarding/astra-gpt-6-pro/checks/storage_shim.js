/* TEST HARNESS ONLY: about:blank has an opaque origin in the managed browser.
   Supply Storage semantics so the unchanged shell owner can commit layout.
   This does not prove native browser storage / disk durability. */
(() => { const create = () => {const d=new Map(); return {get length(){return d.size},key(i){return [...d.keys()][i]??null},getItem(k){return d.has(String(k))?d.get(String(k)):null},setItem(k,v){d.set(String(k),String(v))},removeItem(k){d.delete(String(k))},clear(){d.clear()},_dump(){return Object.fromEntries(d)}}}; Object.defineProperty(window,'localStorage',{value:create(),configurable:true}); Object.defineProperty(window,'sessionStorage',{value:create(),configurable:true});})();
