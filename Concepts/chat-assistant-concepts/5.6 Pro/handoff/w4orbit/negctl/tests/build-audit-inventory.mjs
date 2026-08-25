#!/usr/bin/env node
import fs from 'node:fs';import vm from 'node:vm';import path from 'node:path';import {fileURLToPath} from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');const code=fs.readFileSync(path.join(ROOT,'data.js'),'utf8');
const sandbox={window:{},console:{log(){},warn(){},error(){}},document:{},localStorage:{getItem(){return null},setItem(){}},crypto:{randomUUID:()=>String(Math.random())},setTimeout,clearTimeout};sandbox.globalThis=sandbox;vm.createContext(sandbox);let error='';try{vm.runInContext(code,sandbox,{filename:'data.js'})}catch(e){error=String(e.stack||e)}
const roots=[sandbox.window,sandbox];const seen=new Set(),arrays=[],objects=[];function walk(x,key='root',depth=0){if(!x||typeof x!=='object'||seen.has(x)||depth>8)return;seen.add(x);if(Array.isArray(x)){arrays.push({key,value:x});x.forEach((v,i)=>walk(v,`${key}[${i}]`,depth+1))}else{objects.push({key,value:x});for(const[k,v]of Object.entries(x))walk(v,`${key}.${k}`,depth+1)}}roots.forEach((x,i)=>walk(x,'root'+i));
const ident=x=>typeof x==='string'?x:(x?.id||x?.key||x?.slug||x?.value||x?.name||x?.label);const ids=a=>a.map(ident).filter(Boolean);
function scoreThemes(a){const x=ids(a).map(String);return a.length===8?x.filter(s=>/dark|light|glass|paper|graphite|ember|midnight|puppet/i.test(s)).length:-1}
function scoreRecipes(a){return a.length===8?ids(a).length:-1}
let themes=arrays.sort((a,b)=>scoreThemes(b.value)-scoreThemes(a.value))[0]?.value||[];if(scoreThemes(themes)<2)themes=[];
let recipeCandidates=arrays.filter(x=>x.value.length===8&&x.value!==themes&&ids(x.value).length===8);let recipes=recipeCandidates[0]?.value||[];
let families=[];for(const o of objects){const entries=Object.entries(o.value);if(entries.length===7){const f=entries.map(([id,v])=>({id,options:ids(Array.isArray(v)?v:(v?.options||v?.variants||[]))}));if(f.every(x=>x.options.length===8)){families=f;break}}}if(!families){for(const a of arrays){if(a.value.length===7){const f=a.value.map(v=>({id:ident(v),options:ids(v?.options||v?.variants||[])}));if(f.every(x=>x.id&&x.options.length===8)){families=f;break}}}}
const triggers=[];for(const a of arrays){for(const v of a.value){if(v&&typeof v==='object'&&(v.trigger||v.id)&&(/trigger|demo/i.test(a.key)||v.trigger))triggers.push(v.trigger||v.id)}}for(const o of objects){if(/trigger|demo/i.test(o.key)){for(const[k,v]of Object.entries(o.value)){if(typeof v==='string'&&v.includes(':'))triggers.push(v);else if(v&&typeof v==='object')triggers.push(v.trigger||v.id||v.key)}}}
const clean={themes:ids(themes),recipes:ids(recipes),families,triggers:[...new Set(triggers.filter(Boolean))],sourceKeys:[...new Set([...arrays.map(x=>x.key),...objects.map(x=>x.key)])].slice(0,300),evaluationError:error};
fs.writeFileSync(path.join(ROOT,'reports','audit-inventory.json'),JSON.stringify(clean,null,2));
// Keep this separate so source data remains authoritative.
fs.writeFileSync(path.join(ROOT,'audit-inventory.js'),`window.PM56_AUDIT_INVENTORY=${JSON.stringify(clean)};\n`);
