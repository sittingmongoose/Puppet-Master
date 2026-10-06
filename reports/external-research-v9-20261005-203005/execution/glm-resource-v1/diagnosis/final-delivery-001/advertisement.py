"""Whitelist-only saved request tool metadata; never messages/descriptions/response."""
import datetime,hashlib,json
from pathlib import Path
HERE=Path(__file__).resolve().parent;LAB=HERE.parents[4]
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def main():
    diagnosis=json.loads((HERE/'DIAGNOSIS.json').read_text());request=json.loads(Path(diagnosis['request']['path']).read_text())
    receipt_path=Path(request['native_receipt']['path']);receipt=json.loads(receipt_path.read_text());path=receipt_path.parent/'model-io.redacted.jsonl'
    if sha(path)!=receipt['native_io']['redacted_export_sha256']:raise ValueError('Exact saved request metadata export pin mismatch')
    rows=[]
    with path.open() as file:
        for line_number,line in enumerate(file,1):
            record=json.loads(line)
            if record.get('sessionId')!=receipt['session_id']:raise ValueError('Foreign native request metadata session')
            native_request=record.get('request') or {};body=native_request.get('body');tools=body.get('tools') if isinstance(body,dict) else None
            definitions=[]
            if isinstance(tools,list):
                for index,tool in enumerate(tools):
                    if not isinstance(tool,dict):continue
                    definition=tool.get('function') if isinstance(tool.get('function'),dict) else tool
                    schema=definition.get('parameters',definition.get('input_schema',{}));schema=schema if isinstance(schema,dict) else {}
                    # Values/descriptions/enum contents/defaults/examples omitted.
                    definitions.append({'tool_index':index,'function_name':definition.get('name'),'schema_key_names':list(schema),
                        'property_key_names':list(schema.get('properties',{})) if isinstance(schema.get('properties'),dict) else None,
                        'required_property_names':schema.get('required') if isinstance(schema.get('required'),list) else None})
            metadata_names=native_request.get('toolNames');names=[r['function_name'] for r in definitions]
            writer=[r for r in definitions if r['function_name']=='mcp__pm_boundary__write_file']
            rows.append({'line_number_1based':line_number,'request_id':record.get('requestId'),'attempt':record.get('attempt'),'session_id':record.get('sessionId'),
                'started_at':record.get('startedAt'),'completed_at':record.get('completedAt'),'request_metadata_tool_names':metadata_names,
                'request_body_tools_metadata':definitions,'actual_body_tools_present':isinstance(tools,list),'metadata_names_equal_body_tools':metadata_names==names,
                'writer_advertised_in_saved_request_body':bool(writer),'writer_has_path_text_schema':bool(writer) and writer[0]['property_key_names']==['path','text'] and writer[0]['required_property_names']==['path','text'],
                'selectors':{'metadata_names':'/request/toolNames','body_function_names':'/request/body/tools/*/name or /request/body/tools/*/function/name','schema_keys':'/request/body/tools/*/input_schema keys or /function/parameters keys only'}})
    now=datetime.datetime.now(datetime.timezone.utc).isoformat()
    result={'schema':'er9.final-delivery-request-advertisement-addendum.v1','created_utc':now,'job_id':diagnosis['job_id'],
        'original_diagnosis':{'path':str(HERE/'DIAGNOSIS.json'),'sha256':sha(HERE/'DIAGNOSIS.json')},
        'source':{'path':str(path),'sha256':sha(path),'receipt_pin_source':{'path':str(receipt_path),'sha256':sha(receipt_path),'selector':'/native_io/redacted_export_sha256'}},
        'whitelist':'requestId/attempt/sessionId/timestamps, request.toolNames and request.body.tools function names/schema-key names only. No headers/providerOptions/messages/sdkMessages/tool descriptions/arguments/text_utf8/response/candidate/source bodies selected.',
        'saved_request_count':len(rows),'writer_advertised_request_count':sum(r['writer_advertised_in_saved_request_body'] for r in rows),
        'writer_path_text_schema_request_count':sum(r['writer_has_path_text_schema'] for r in rows),'metadata_and_body_names_match_request_count':sum(r['metadata_names_equal_body_tools'] for r in rows),
        'actual_model_visible_advertisement':'SUPPORTED_BY_SAVED_NATIVE_REQUEST_BODY_TOOLS' if rows and all(r['writer_advertised_in_saved_request_body'] and r['writer_has_path_text_schema'] for r in rows) else 'UNKNOWN_FOR_INCOMPLETE_REQUEST_METADATA',
        'rows':rows,'no_writer_dispatch_diagnosis_unchanged':True,'clarification':'Original scope-limited UNKNOWN advertisement remains immutable. This later authorized whitelist adds direct saved request-body tool advertisement evidence; it does not invent intent, writer calls, completion, costs or quality.',
        'new_model_goal_account_or_runtime_calls':0,'live_versions_or_original_records_changed':0}
    with (HERE/'ADVERTISEMENT_METADATA_ADDENDUM.json').open('x') as file:file.write(json.dumps(result,indent=2)+'\n')
    print(json.dumps({k:result[k] for k in ['saved_request_count','writer_advertised_request_count','writer_path_text_schema_request_count','metadata_and_body_names_match_request_count','actual_model_visible_advertisement']}))
if __name__=='__main__':main()
