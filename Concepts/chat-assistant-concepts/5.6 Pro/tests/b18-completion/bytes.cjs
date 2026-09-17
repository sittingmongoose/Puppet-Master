/* Independent SHA-256 and full-size decoding checks on the shipped module.
   No private mirror of the decoder or digest implementation. */
const fs=require('fs'),path=require('path'),vm=require('vm'),crypto=require('crypto'),assert=require('assert');
const source=path.resolve(__dirname,'../../attachment-snapshots.js'),text=fs.readFileSync(source,'utf8');
const exporters=new Map(),ctx={PM56_EXT:{ctx:()=>({esc:String})},PM56_ARTIFACTS:{registerRenderer(){},registerExporter:(k,f)=>exporters.set(k,f)},PM56_ATTACHMENTS:{},PM56_TX:{},TextEncoder,TextDecoder,Uint8Array,DataView,atob,btoa};
vm.createContext(ctx);vm.runInContext(text,ctx,{filename:source});const rows=[];
function check(name,fn){fn();rows.push({name,pass:true});}
for(const size of [0,1,1024*1024,16*1024*1024])check('Exact binary '+size+' bytes',()=>{
 const bytes=Buffer.alloc(size);for(let i=0;i<size;i++)bytes[i]=(i*73+255)%256;
 const digest=crypto.createHash('sha256').update(bytes).digest('hex');
 const exported=exporters.get('file_snapshot')({payload:{schema:'pm.concept.file_snapshot.v1',filename:'binary.dat',base64:bytes.toString('base64'),sha256:digest,byte_length:size}});
 assert(Buffer.from(exported.bytes).equals(bytes));assert.strictEqual(exported.mime,'application/octet-stream');
});
for(const bad of ['=AAA','AA=A','AAAA=','AAAA===','####','AAA'])check('Invalid encoding '+bad,()=>{
 assert.throws(()=>exporters.get('file_snapshot')({payload:{schema:'pm.concept.file_snapshot.v1',filename:'bad',base64:bad,byte_length:0,sha256:'invalid'}}));
});
console.log(JSON.stringify({status:'pass',source_sha256:crypto.createHash('sha256').update(text).digest('hex'),checks:rows},null,2));
