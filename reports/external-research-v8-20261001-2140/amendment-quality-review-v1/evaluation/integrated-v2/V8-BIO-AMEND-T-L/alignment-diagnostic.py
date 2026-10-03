"""Evaluator-only arithmetic diagnostic. Does not execute any candidate fixture/app."""
import json
from pathlib import Path

def point(scale, index, translation=0):
    return scale * index + translation

def intervals_disjoint(a, b):
    return a[1] < b[0] or b[1] < a[0]

# Candidate F4b specialized to equal 1000-pixel shapes and zero offsets.
# This only tests the sufficiency of the stated disjoint-bbox predicate.
image_bbox=(0, point(.5, 999))
label_bbox=(0, point(1., 999))
assert not intervals_disjoint(image_bbox, label_bbox)
assert image_bbox != label_bbox
assert point(.5,500) != point(1.,500)

# Missing-unit numerical mappings have no supplied common-space conversion.
# Two possible unit interpretations yield identical numerical declared bboxes,
# but different world coordinates; this is an underdetermination diagnostic.
label_numeric_coordinate=point(.5,100)
label_if_micrometer=label_numeric_coordinate
label_if_millimeter_in_micrometers=1000*label_numeric_coordinate
assert label_if_micrometer != label_if_millimeter_in_micrometers

# 0.4 uncalibrated fallback is relative to EACH pyramid's first resolution.
# A 2x lower-resolution label and an image may each declare first-level scale 1.
# Equal numerical scale is insufficient to identify their physical pixel sizes.
relative_image=point(1.,100)
relative_label=point(1.,100)
assert relative_image == relative_label
known_image_um=point(.5,100)
unknown_label_um_if_2x=point(1.,100)
assert known_image_um != unknown_label_um_if_2x

result={
 'diagnostic_scope':'evaluator arithmetic only; candidate F1-F9 remain unexecuted',
 'bbox_counterexample':{'image_bbox':image_bbox,'label_bbox':label_bbox,'stated_disjoint_predicate':intervals_disjoint(image_bbox,label_bbox),'equal_extents':image_bbox==label_bbox,'index500_image_um':point(.5,500),'index500_label_um':point(1.,500)},
 'absent_unit_ambiguity':{'same_numeric_label_coordinate':label_numeric_coordinate,'if_micrometer_um':label_if_micrometer,'if_millimeter_um':label_if_millimeter_in_micrometers,'note':'Neither unit is supplied by a missing unit field; values demonstrate why an additional common-basis contract is necessary.'},
 'uncalibrated_relative_fallback':{'image_first_scale':1,'label_first_scale':1,'same_numeric_coordinate':relative_image,'example_image_um':known_image_um,'example_label_um':unknown_label_um_if_2x,'note':'Physical numbers illustrate possible independent pyramids; they are not source-declared calibration.'},
 'candidate_execution_claim':'NONE',
 'runtime_or_rendering_test':'NONE'
}
Path(__file__).with_suffix('.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result,indent=2))
