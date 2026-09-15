/* Executable tests against the actual shared controller, not a duplicate helper. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),ctx={console};ctx.window=ctx;
ctx.PM56_DATA={};ctx.PM56_EXT={slot(){},action(){},chainAction(){}};
vm.createContext(ctx);vm.runInContext(fs.readFileSync(path.join(root,'command-transaction.js'),'utf8'),ctx);
vm.runInContext(fs.readFileSync(path.join(root,'todos.js'),'utf8'),ctx);
const T=ctx.PM56_TODOS,clone=x=>JSON.parse(JSON.stringify(x));let assertions=0;
const ok=(value,msg)=>{assert.ok(value,msg);assertions++;};
const item=(id,parent=null,deps=[])=>({todo_id:id,thread_id:'b16-graph',project_id:'pm',parent_todo_id:parent,depends_on:deps,status:'pending',active_work_ids:[]});
function check(items,expected,field){const candidate={project_id:'pm',revision:2,items};const before=JSON.stringify(candidate),live=JSON.stringify(ctx.PM56_RUNTIME);
const result=T.validateGraph('b16-graph',candidate);ok(result.valid===expected,JSON.stringify(result));if(field)ok(result[field].length>0,field);ok(JSON.stringify(candidate)===before,'candidate unchanged');ok(JSON.stringify(ctx.PM56_RUNTIME)===live,'live unchanged');return result;}
check([item('p'),item('a','p'),item('b','p',['a'])],true);
check([item('__proto__'),item('constructor',null,['__proto__'])],true);
check([item('a','a')],false,'self_parent_ids');
check([item('a','b'),item('b','c'),item('c','a')],false,'parent_cycles');
check([item('p'),item('q'),item('a','p',['b']),item('b','q',['a'])],false,'dependency_cycles');
check([item('a',null,['a'])],false,'dependency_cycles');
check([item('a','missing')],false,'unknown_refs');
check([item('a',null,['missing'])],false,'unknown_refs');
check([item('a'),item('a')],false,'duplicate_ids');
check([{...item('a'),thread_id:'other'}],false,'cross_thread_refs');
check([{...item('a'),project_id:'other'}],false,'cross_thread_refs');
check([{...item('a'),status:'verifying'}],false,'invalid_statuses');
for(const field of ['verification_state','source_group_label','done_category'])check([{...item('a'),[field]:null}],false,'invalid_fields');
check([{...item('a'),depends_on:'b'}],false,'invalid_fields');
check([null,1,{}],false,'invalid_fields');
check([{...item('p'),expected_outcome:'parents do no work'},item('a','p')],false,'parent_work_refs');
let c={project_id:'pm',items:[item('a')],bindings:[{binding_id:'b',todo_id:'a',thread_id:'wrong'}]};ok(!T.validateGraph('b16-graph',c).valid,'cross-thread binding');
c={items:[item('a')],bindings:[{binding_id:'b',todo_id:'missing'}]};ok(!T.validateGraph('b16-graph',c).valid,'unknown binding');
// Independent of recursive DOM rendering or JavaScript call-stack limits.
const huge=Array.from({length:12000},(_,i)=>item('n'+i,i?'n'+(i-1):null));check(huge,true);
const reordered=[item('c',null,['b']),item('b',null,['a']),item('a')];check(reordered,true);
console.log(JSON.stringify({suite:'b16-graph',status:'pass',assertions,source_sha256:require('node:crypto').createHash('sha256').update(fs.readFileSync(path.join(root,'todos.js'))).digest('hex')}));
