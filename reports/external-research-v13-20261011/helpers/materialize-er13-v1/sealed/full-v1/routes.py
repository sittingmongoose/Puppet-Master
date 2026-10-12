#!/usr/bin/env python3
"""Read-only route planning from an actual caller-supplied T3 catalog; no dispatch."""
import argparse,json
from pathlib import Path
ROUTES={
 'luna':{'driver':'codex','model':'gpt-6-luna','options':{'reasoningEffort':'max','serviceTier':'default'},'activation_transport':'functions.exec native create_goal direct capture','mechanical_ready':True},
 'muse':{'driver':'muse','model':'muse-spark-1.3-contributor','options':{'reasoningEffort':'max'},'activation_transport':'BLOCKED: native Muse tools exist but inspected T3 has no supported machine-composed direct create/capture transport','mechanical_ready':False},
 'zcode':{'driver':'acpRegistry','model':'builtin:zai-coding-plan\\GLM-5.3-Flash','options':{'thought':'max'},'activation_transport':'BLOCKED: backend session/goal exists; T3 lacks direct extension transport/capture and default /goal is a bridge loop','mechanical_ready':False}}
def plan(catalog,candidate,provider_instance):
 if 'structuredContent' in catalog: catalog=catalog['structuredContent']
 r=ROUTES[candidate]
 p=next((p for p in catalog['providers'] if p['providerInstanceId']==provider_instance),None)
 if not p or p.get('canRunChildTask') is not True or p.get('constraints') or p.get('driverKind')!=r['driver']:
  raise ValueError('exact requested provider/driver is unavailable; no substitution')
 m=next((m for m in p['models'] if m['id']==r['model']),None)
 if not m:raise ValueError('requested native candidate model is unavailable')
 for k,v in r['options'].items():
  if not any(x.get('id')==k and any(y.get('id')==v for y in x.get('options',[])) for x in m.get('options',[])):
   raise ValueError('requested candidate option unavailable: '+k)
 return {'candidate':candidate,'target':{'providerInstanceId':provider_instance,'driverKind':r['driver'],'model':r['model'],'options':r['options']},'catalog_supported':True,'mechanical_ready':r['mechanical_ready'],'native_lifecycle_observed':False,'actual_native_activation_transport':r['activation_transport'],'dispatches':0}
def main():
 a=argparse.ArgumentParser(description=__doc__);a.add_argument('--catalog',type=Path,required=True);a.add_argument('--candidate',choices=list(ROUTES),required=True);a.add_argument('--provider-instance',required=True);v=a.parse_args()
 try:print(json.dumps(plan(json.loads(v.catalog.read_text()),v.candidate,v.provider_instance),indent=2))
 except (ValueError,KeyError,OSError) as e:a.exit(2,str(e)+'\n')
if __name__=='__main__':main()
