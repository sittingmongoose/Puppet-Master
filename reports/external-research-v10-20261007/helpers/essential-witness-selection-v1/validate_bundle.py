#!/usr/bin/env python3
"""Read-only offline structural/identity validation. Never materializes payloads or archives."""
import argparse,hashlib,json,re
from pathlib import Path
O=Path(__file__).resolve().parent
H=lambda b:hashlib.sha256(b).hexdigest()
def load(n):return json.loads((O/n).read_bytes())
def main():
 ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--retained-fragments',type=Path,help='Root-created/extracted private fragment directory; verify payload hashes only, with no original source reads');ap.add_argument('--structure-only',action='store_true');a=ap.parse_args()
 s=load('SELECTED_MINIMAL_WITNESSES.json');c=load('ORIGINAL_OBJECT_COVERAGE.json')['coverage'];f=load('PROPOSED_FRAGMENT_INDEX.json')['fragments'];m=load('RENDERED_EXTRACT_MAPPINGS.json')['mappings'];cfg=load('config.json')
 assert len(c)==76 and len({x['source']['sha256'] for x in c})==76
 assert len(s['selections'])==47 and len({x['selection_id'] for x in s['selections']})==47
 assert all(x['locator_class'] in ('LIVE_MUTABLE_DOC_API_HISTORY','VERSIONED_RELEASE_OR_TAG') for x in c)
 assert all(not x['eligible_for_deletion'] and x['root_verification_pending'] for x in c)
 assert not s['archive_created'] and not s['cleanup_performed'] and not s['literal_payloads_stored']
 assert not s['coverage_summary']['campaign_complete'] and not s['coverage_summary']['retention_verified']
 assert cfg['maximum_private_archives']==1 and not cfg['private_archive_created']
 sources={};ranges_count=0;focus_refs=set();input_checks=0
 for x in s['selections']:
  assert not x['full_document_necessary'];assert x['source']['sha256']==x['source']['read_sha256'];assert x['policy_ref_id'] in s['policy_table']
  po=s['policy_table'][x['policy_ref_id']]['publication_and_license_restrictions'];assert po['private_proposal_only'] and not po['public_release_authorized'] and po['public_quote_word_limit_per_non_lyrical_source']==25
  refs={}
  for ref in x['frozen_assertions']:
   original=s['frozen_assertion_table'][ref['assertion_ref_id']];assert ref['explicit_original_source_bindings'];assert len(original['record_sha256'])==64 and original['pointer'].startswith('/');refs[original['pointer']]=original
   assert original['published_authored_matches'] and all(v['unchanged_original_bytes'] for v in original['published_authored_matches'])
   assert all(v['original_path']==original['record'] and v['original_sha256']==original['record_sha256'] for v in original['published_authored_matches'])
  for q in x['selected_assertion_pointers']:assert q in refs
  if x['eligible_index'] in (6,10,25):
   for q in x['selected_assertion_pointers']:
    if q.startswith('/defects/'):
     assert refs[q]['original_material'] is True;focus_refs.add(q)
  for l in x['locators']:
   loc=s['locator_table'][l];assert loc['record_id'] in s['locator_record_table']
  prev=-1
  for z in x['ranges']:
   assert 0<=z['start']<z['end_exclusive']<=x['source']['size_bytes'] and z['start']>=prev;prev=z['end_exclusive'];ranges_count+=1
   assert z['bytes']==z['end_exclusive']-z['start'] and len(z['content_sha256'])==64
   assert z['transform_for_retention'].startswith('identity')
   assert all('pattern' not in q for q in z['selectors'])
  assert sum(z['bytes'] for z in x['ranges'])==x['proposed_retained_bytes']<x['source']['size_bytes']
 assert focus_refs=={'/defects/0','/defects/1','/defects/2','/defects/3'}
 assert sum(x['proposed_retained_bytes'] for x in s['selections'])==29842
 assert sum(x['bytes'] for x in f)==29630 and len(f)==220
 assert sum(x['decision'].startswith('HOLD') for x in c)==2
 assert sum(x['all_necessary_text_components_match'] for x in m)==12 and len(m)==13
 for x in f:
  assert x['proposed_payload_name']==x['content_sha256']+'.bin'
  assert x['origins']
 if a.retained_fragments:
  base=a.retained_fragments.resolve()
  for x in f:
   path=base/x['proposed_payload_name'];b=path.read_bytes();assert len(b)==x['bytes'] and H(b)==x['content_sha256'];input_checks+=1
  scope='Root-supplied retained literal fragments only; no whole-document or original-source reconstruction claim'
 elif a.structure_only:scope='structural binding only; no source-byte verification'
 else:
  for x in c:
   p=x['source']['path'];b=Path(p).read_bytes();assert len(b)==x['source']['size_bytes'] and H(b)==x['source']['sha256'];sources[x['eligible_index']]=b;input_checks+=1
  for x in s['selections']:
   b=sources[x['eligible_index']]
   for z in x['ranges']:
    frag=b[z['start']:z['end_exclusive']];assert H(frag)==z['content_sha256']
    if all(q['kind']=='html' for q in z['selectors']):assert not re.search(rb'<(?:/?[A-Za-z]|!|\?)',frag),'markup retained in HTML data-only fragment'
  for x in c:
   i=x['eligible_index']
   if i in (54,73):
    commits=[q.decode() for q in re.findall(rb'^From ([0-9a-f]{40})',sources[i],re.M)]
    expected=x['alternative'].get('commits',[x['alternative'].get('commit')]);assert commits==expected
  scope='all 76 eligible original SHA/length identities and all proposed literal range hashes; immutable upstream availability remains unverified'
 print(json.dumps({'validation_passed':True,'scope':scope,'eligible_source_identities_checked':input_checks,'selected_objects':47,'ranges_checked':ranges_count,'unique_fragment_identities':220,'deduplicated_proposed_bytes':29630,'existing_material_defect_pointers_preserved':sorted(focus_refs),'unresolved_range_or_mapping_HOLD_objects':2,'archive_created':False,'cleanup_performed':False,'semantic_grading':False,'retention_verified':False},indent=2))
if __name__=='__main__':main()
