from __future__ import annotations
import ast
import hashlib
import json
import sys
from abc import ABC
from pathlib import Path
from types import SimpleNamespace

class Vector(list):
    def tolist(self):
        return list(self)

class Affine:
    def __init__(self, scale=None, translate=None):
        self.scale = Vector(scale if scale is not None else [1.0] * len(translate))
        self.translate = Vector(translate if translate is not None else [0.0] * len(scale))
    def compose(self, other):
        return Affine([a*b for a,b in zip(self.scale,other.scale)],
                      [a*b+c for a,b,c in zip(self.scale,other.translate,self.translate)])

class Group:
    def __init__(self, attrs, children=None, name="group"):
        self.attrs = attrs
        self.children = children or {}
        self.name = name
    def __getitem__(self, key):
        return self.children[key]

def extracted(namespace, path, names):
    parsed = ast.parse(path.read_text())
    nodes = [n for n in parsed.body if getattr(n, "name", None) in names]
    assert {n.name for n in nodes} == set(names)
    mod = ast.Module(body=[ast.ImportFrom(module="__future__", names=[ast.alias(name="annotations")], level=0)] + nodes, type_ignores=[])
    exec(compile(ast.fix_missing_locations(mod), str(path), "exec"), namespace)

raw = Path(sys.argv[1])
reader = raw / "plugin-reader.txt"
fmt = raw / "ome-format.txt"
assert hashlib.sha256(reader.read_bytes()).hexdigest() == "255ca2c58e4f52ca4ce2bafd9bdfc0db56a0827d86c592c9c786f430a57ea98e"
assert hashlib.sha256(fmt.read_bytes()).hexdigest() == "82b61d30f62d6eddd81ff63b43146fd4f7be93be767ae5561b74a99951c24eca"
ns = dict(ABC=ABC, Affine=Affine, AXES_5D=[], AXES_TYPES={}, np=SimpleNamespace(ones=lambda n: Vector([1.0]*n)))
extracted(ns, reader, ["Spec", "Multiscales", "Label", "single_transform_to_affine", "transforms_to_affine"])
axes = [{"name":"y","type":"space","unit":"micrometer"}, {"name":"x","type":"space","unit":"micrometer"}]
def attrs(scale, is_label=False):
    a = {"multiscales":[{"version":"0.4","axes":axes,"datasets":[{"path":"0","coordinateTransformations":[{"type":"scale","scale":scale},{"type":"translation","translation":[0.0,-10.0]}]}]}]}
    if is_label:
        a["image-label"] = {}
    return a
label = Group(attrs([0.75,0.75], True), name="labels/test")
container = Group({"labels":["test"]}, {"test":label})
image = Group(attrs([0.5,0.5]), {"labels":container})
m = ns["Multiscales"](image)
child = m.children()[0]
i = m.metadata()
l = child.metadata()
assert i["scale"] == [0.5,0.5]
assert l["scale"] == [0.75,0.75]
assert m.parent_transforms == child.parent_transforms == []
assert i["affine"].translate == l["affine"].translate == [0.0,0.0]

parsed = ast.parse(fmt.read_text())
cls = next(n for n in parsed.body if isinstance(n,ast.ClassDef) and n.name == "FormatV04")
fn = next(n for n in cls.body if isinstance(n,ast.FunctionDef) and n.name == "generate_coordinate_transformations")
mod = ast.Module(body=[ast.ImportFrom(module="__future__", names=[ast.alias(name="annotations")], level=0), fn], type_ignores=[])
g = {}
exec(compile(ast.fix_missing_locations(mod), str(fmt), "exec"),g)
cts = g["generate_coordinate_transformations"](None,[(64,64),(32,32)])
assert cts[1][0]["scale"] == [2.0,2.0]
assert cts[1][1]["translation"] == [0.5,0.5]
relative_to_physical = [t*0.5 for t in cts[1][1]["translation"]]
assert relative_to_physical == [0.25,0.25]
result = {
 "kind":"evaluator isolated AST witness; upstream classes extracted from independently captured pinned source; dependencies stubbed; no napari GUI/runtime execution",
 "plugin_plain_0_4_image_scale":i["scale"],
 "plugin_plain_0_4_label_scale":l["scale"],
 "parent_transforms_image":m.parent_transforms,
 "parent_transforms_label":child.parent_transforms,
 "plugin_image_translation":list(i["affine"].translate),
 "format_shape_inputs":[[64,64],[32,32]],
 "format_level1_cts":cts[1],
 "format_level1_translation_native_unit":"level-0 pixels",
 "format_level1_translation_if_level0_pixel_is_0_5_um":relative_to_physical,
 "image_formula_1_over_2_minus_0_5_over_2_um":0.25,
 "nearest_sample_14_minus_float_index_13_75":0.25,
 "assertions":"PASS",
 "limitations":"Affine stub checks scale/translation only. This does not execute napari multiscale internals, viewer behavior, actual arrays, original candidate fixtures, or proposed tests."
}
print(json.dumps(result,indent=2))
