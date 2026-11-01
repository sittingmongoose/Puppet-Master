#!/usr/bin/env python3
"""DL-272 static Models route command and reverse-coverage check; no native proof."""
import json
from pathlib import Path
import jsonschema
ROOT=Path(__file__).resolve().parents[1]
def check():
    read=lambda p: json.loads((ROOT/'Plans'/p).read_text())
    schema=read('free_models_route_contracts.schema.json')
    fixtures=read('free_models_route_contract_fixtures.json')
    jsonschema.Draft202012Validator.check_schema(schema)
    failures=[]
    def require(ok,why):
        if not ok:failures.append(why)
    for kind in ['valid','invalid']:
        for case in fixtures[kind]:
            scoped={**schema,'$ref':'#/$defs/'+case['definition']}
            valid=jsonschema.Draft202012Validator(scoped).is_valid(case['value'])
            require(valid==(kind=='valid'),case['name']+': wrong typed admission')
    command='cmd.free_models.route.disable'
    require(schema['$defs']['route_command_id']['enum']==[command],'Route command enum widened')
    entries=read('Wiring_Matrix.production.json')['entries']
    rows=[r for r in entries.values() if r['ui_command_id']==command]
    require(len(rows)==1,'Expected one shared Turn off producer')
    if rows:
        row=rows[0]
        require(row['handler_location']=='handlers::models::disable_free_route','Wrong Models handler')
        require(row['request_schema_ref']=='Plans/free_models_route_contracts.schema.json#/$defs/disable_request','Wrong payload reference')
        require(row['result_schema_ref']=='Plans/free_models_route_contracts.schema.json#/$defs/disable_result','Wrong result reference')
        require(not row['expected_event_types'],'Route disable invents an event')
    binding=[r for r in read('pm7_control_bindings.json')['bindings'] if r['control_id']=='onboarding.free_models.route.disable']
    require(len(binding)==1 and binding[0]['action_ids']==[command] and not binding[0]['setting_ids'],'Route binding is missing or confused with whole-provider setting')
    touch=read('touch_closure.json');tr=[r for r in touch['rows'] if r[3]==command]
    require(len(tr)==1 and tr[0][4]=='partial','Touch closure missing or falsely promoted')
    profiles=[p for p in touch['profiles'] if p['profile_id']=='TCP-FREE-MODELS-ROUTE-DISABLE']
    require(len(profiles)==1 and profiles[0]['command_ids']==[command],'Touch profile widened')
    for doc in ['Commands_System.md','UI_Command_Catalog.md','Models_System.md','UI_Wiring_Rules.md','Wiring_Matrix.md']:
        require(command in (ROOT/'Plans'/doc).read_text() or doc=='UI_Wiring_Rules.md' and 'CS-108' in (ROOT/'Plans'/doc).read_text(),'Missing owner/cross-owner route in '+doc)
    admission=read('product_onboarding_contracts.schema.json')['x-footage-review']
    require(admission['native_client_sign_in']['requires_human_action'] and not admission['native_client_sign_in']['cached_projection_starts_auth'] and not admission['native_client_sign_in']['grants_PM_pairing_or_Server_listener'],'Pre-Review native auth lost its narrow boundary')
    return {'status':'fail' if failures else 'pass','valid_cases':len(fixtures['valid']),'invalid_cases':len(fixtures['invalid']),'command':command,'native_certification':False,'failures':failures}
if __name__=='__main__':
    d=check();print(json.dumps(d,indent=2));raise SystemExit(bool(d['failures']))
