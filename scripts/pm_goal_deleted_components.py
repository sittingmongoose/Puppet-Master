"""TEST_ONLY receipt-bound native component codec; no read-time issuance."""
import base64
from dataclasses import asdict,replace
import hashlib
from pathlib import Path
import pm_event_numbers as n
import pm_goal_oracle_common as c
import pm_goal_retained as retained

ROOT=Path(__file__).resolve().parents[1]


def uint_value(value):
    if type(value)is int:n.storage_uint64(value)
    elif type(value)is float:raise n.Refusal('original_unsigned_codec_float')
    elif isinstance(value,dict):
        for child in value.values():uint_value(child)
    elif isinstance(value,list):
        for child in value:uint_value(child)
    return n.storage_value_bytes(value)


def issue(event,storage,rows,codec):
    """Called only by fixture issuance, independently of any read candidate."""
    source=Path(codec.__code__.co_filename)
    pin=c.load(ROOT/'Plans/restore_point_deleted_contract_fixtures.json')['retained_phase_subject']
    component=dict(recipe_id='TEST_ONLY/frozen-original-unsigned-msgpack-v1',physical_profile='frozen unsigned integers with shared uint64/Storage qualification',
                   codec_source_sha256=hashlib.sha256(source.read_bytes()).hexdigest(),codec_function=codec.__qualname__,
                   owner_manifest_sha256=pin['sha256'])
    custody=dict(fixture='TEST_ONLY independently issued retained original',rows=rows,native_component_recipe=component)
    receipt=retained.issue(event,storage,custody);x=receipt['original']
    recipe=n.RecipeTuple(**x['recipe'])
    manifest=n.qualified_jcs(dict(event_resources=recipe.resource_manifest_sha256,native_components=component))
    recipe=replace(recipe,full_value_profile=recipe.full_value_profile+'/sealed-native-components-v1',resource_manifest_sha256=hashlib.sha256(manifest).hexdigest())
    original=n.OriginalCustody(n.OriginalBinding(**x['binding']),recipe,x['record_bytes'],x['result_bytes'],x['receipt_bytes'])
    return custody,dict(original=asdict(original),seal=retained.seal(original)),[component]


def select(store,model,need):
    # The caller has already authenticated the exact original sealed receipt.
    # Its receipt bytes bind this custody object and component recipe verbatim.
    selected=store['custody']['native_component_recipe']
    matches=[row for row in store['installed_native_component_recipes']if c.same_json_value(row,selected)]
    need(len(matches)==1,'exact receipt-selected native component recipe')
    supported=True
    try:
        for row in model.rows.values():
            if row is not None:uint_value(row['value'])
    except n.Refusal:supported=False
    need(supported,'receipt-selected original uint64 physical profile')
