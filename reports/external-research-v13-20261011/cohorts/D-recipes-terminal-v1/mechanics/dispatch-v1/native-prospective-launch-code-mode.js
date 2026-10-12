const B=load("B"),root=B+"/mechanics/dispatch-v1/admitted/"+arm;
const captureHelper=B+"/helpers/"+(arm.startsWith("D-")?"prospective-terminal-capture-v1":"prospective-capture-v1");
const src=await tools.exec_command({cmd:"cat '"+root+"/helpers/er12-screen-v1/bootstrap.js'",max_output_tokens:18000});
const shim=await tools.exec_command({cmd:"cat '"+B+"/helpers/prospective-capture-v1/captureSpec-shim.js'",max_output_tokens:4000});
const marker="// Paste into T3 functions code mode.";if(src.output.split(marker).length!==2)throw Error("unique bootstrap marker missing");
const body=src.output.replace('const STAGE = "investigator";','const STAGE = "'+stage+'";').replace(marker,shim.output.replace("__HELPER_DIR_JSON__",JSON.stringify(captureHelper))+"\n"+marker);
await(new Function("tools","text","exit","return (async()=>{"+body+"\n})()"))(tools,text,exit);
text(await tools.exec_command({cmd:"python3 -B '"+B+"/mechanics/dispatch-v1/record-inventory.py' "+arm+" "+stage+" '"+root+"/run/"+arm+"/stages/"+stage+"/dispatch.json'",max_output_tokens:700}));
