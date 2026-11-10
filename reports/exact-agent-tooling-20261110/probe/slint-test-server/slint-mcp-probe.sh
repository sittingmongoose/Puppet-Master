#!/bin/bash
# usage: slint-mcp-probe.sh <binary> <outdir> <port>
BIN=$1; O=$2; PORT=$3; mkdir -p $O
SLINT_MCP_PORT=$PORT SLINT_BACKEND=headless $BIN > $O/app.log 2>&1 & APP=$!
call(){ curl -s -m 20 -X POST http://127.0.0.1:$PORT/mcp -H 'Content-Type: application/json' -d "$1"; }
tool(){ call "{\"jsonrpc\":\"2.0\",\"id\":9,\"method\":\"tools/call\",\"params\":{\"name\":\"$1\",\"arguments\":$2}}"; }
for i in $(seq 1 40); do call '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"probe","version":"1.0"}}}' > $O/initialize.json; [ -s $O/initialize.json ] && break; sleep 0.25; done
call '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}' > $O/tools-list.json
tool list_windows '{}' > $O/list-windows.json
python3 - "$O" "$PORT" <<'PY'
import json, sys, subprocess, time, base64, re
O, PORT = sys.argv[1], sys.argv[2]
def tool(name, args):
    t0 = time.time()
    r = subprocess.run(['curl','-s','-m','20','-X','POST',f'http://127.0.0.1:{PORT}/mcp','-H','Content-Type: application/json','-d',json.dumps({"jsonrpc":"2.0","id":9,"method":"tools/call","params":{"name":name,"arguments":args}})],capture_output=True,text=True).stdout
    return r, (time.time()-t0)*1000
def payload(raw):
    d = json.loads(raw); c = d.get('result',{}).get('content',[])
    for x in c:
        if x.get('type') == 'text':
            try: return json.loads(x['text'])
            except Exception: return x['text']
    return d
res = {}
init = json.load(open(f'{O}/initialize.json'))['result']
res['server'] = init.get('serverInfo'); res['instructions_chars'] = len(init.get('instructions',''))
open(f'{O}/instructions.txt','w').write(init.get('instructions',''))
tl = json.load(open(f'{O}/tools-list.json'))['result']['tools']
res['tools'] = [t['name'] for t in tl]; res['tools_list_bytes'] = len(open(f'{O}/tools-list.json').read())
wins = payload(open(f'{O}/list-windows.json').read()); res['list_windows'] = wins
wh = (wins.get('windowHandles') or wins.get('window_handles'))[0]
raw, ms = tool('get_window_properties', {'windowHandle': wh}); wp = payload(raw); res['window_properties'] = wp; open(f'{O}/window-properties.json','w').write(raw)
root = wp.get('rootElementHandle') or wp.get('root_element_handle')
raw, ms = tool('get_element_tree', {'elementHandle': root}); open(f'{O}/element-tree.json','w').write(raw)
tree = payload(raw); els = tree.get('elements', tree if isinstance(tree, list) else [])
res['element_tree'] = {'response_bytes': len(raw), 'elements': len(els), 'bytes_per_element': round(len(raw)/max(1,len(els))), 'ms': round(ms,1), 'truncated': tree.get('truncated') if isinstance(tree, dict) else None}
ids = []
for e in els:
    for tn in e.get('typeNamesAndIds', []) or e.get('type_names_and_ids', []):
        if tn.get('id'): ids.append(tn['id'])
res['element_tree']['with_id'] = len(ids); res['element_tree']['sample_ids'] = [i for i in ids if 'btn-' in i or 'sw-' in i or 'input-' in i][:8]
# The compact listing is made from the saved reply by project_tree.py (it handles the omitted `accessibleEnabled`).
raw, ms = tool('find_elements_by_id', {'windowHandle': wh, 'elementsId': 'SettingsPage::btn-github-connect'}); res['find_by_id_raw'] = raw[:400]; open(f'{O}/find-by-id.json','w').write(raw)
f = payload(raw); hs = (f.get('elementHandles') or f.get('element_handles') or []) if isinstance(f, dict) else []
if hs:
    h = hs[0]
    raw, ms = tool('get_element_properties', {'elementHandle': h}); res['connect_properties'] = payload(raw); res['get_element_properties_bytes'] = len(raw)
    raw, ms = tool('click_element', {'elementHandle': h}); res['click'] = {'raw': raw[:200], 'ms': round(ms,1)}
    raw2, _ = tool('find_elements_by_id', {'windowHandle': wh, 'elementsId': 'SettingsPage::status-last-command'}); f2 = payload(raw2); h2 = ((f2.get('elementHandles') or [None])[0]) if isinstance(f2, dict) else None
    if h2:
        raw, _ = tool('get_element_properties', {'elementHandle': h2}); p = payload(raw); res['status_after_click'] = {'accessibleLabel': p.get('accessibleLabel'), 'accessibleValue': p.get('accessibleValue')}
    raw3, _ = tool('find_elements_by_id', {'windowHandle': wh, 'elementsId': 'SettingsPage::btn-github-disconnect'}); f3 = payload(raw3); h3 = ((f3.get('elementHandles') or [None])[0]) if isinstance(f3, dict) else None
    if h3:
        raw, _ = tool('get_element_properties', {'elementHandle': h3}); res['disconnect_enabled_after_click'] = payload(raw).get('accessibleEnabled')
raw, ms = tool('take_screenshot', {'windowHandle': wh}); d = json.loads(raw); img = next((c for c in d.get('result',{}).get('content',[]) if c.get('type')=='image'), None)
if img:
    png = base64.b64decode(img['data']); open(f'{O}/screenshot.png','wb').write(png); res['screenshot'] = {'response_bytes': len(raw), 'png_bytes': len(png), 'ms': round(ms,1)}
else: res['screenshot'] = {'raw': raw[:300]}
json.dump(res, open(f'{O}/probe-result.json','w'), indent=1); print(json.dumps(res, indent=1)[:3800])
PY
kill $APP 2>/dev/null; wait $APP 2>/dev/null; head -3 $O/app.log
