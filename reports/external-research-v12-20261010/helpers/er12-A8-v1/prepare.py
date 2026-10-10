#!/usr/bin/env python3
"""Pinned R0 preparer plus exact stage-only A8 prompt additions; root dispatches."""
import importlib.util, sys
sys.dont_write_bytecode = True
from pathlib import Path

HERE = Path(__file__).resolve().parent
PINNED = HERE.parent / "er11"
METHOD = HERE.parent.parent / "methods" / "A8"
spec = importlib.util.spec_from_file_location("er11_a8_pinned", PINNED / "prepare.py")
b = importlib.util.module_from_spec(spec)
spec.loader.exec_module(b)
PINS = {
    "prepare.py": "ae736bfb6748175284d2abbcc7f851f031593612b0de160d72df91dd11ae70a7",
    "reveal.py": "ec9579204af96aa6a45caba1eef94c6ca1a799c296a2363b179af359bd908abe",
    "bootstrap.js": "f8b21ce31ca521880adc9a362dda04bdaa5f5a4285d3a9d0b019f855e2623595",
}
DELTAS = {
    "critic": (METHOD / "critic_prompt_delta.txt", "6ca210592ebaffd1228f390855af2dcbb7b338dcbb3e00c9fb57f0bdc8672c0d"),
    "reviser": (METHOD / "reviser_prompt_delta.txt", "31b0b79da9d1a99d81103a485448bbd2d518e5c48cd56b15a1a1a9cb9d11e087"),
}
for name, sha in PINS.items():
    if b.digest(PINNED / name) != sha:
        b.fail(f"pinned R0 helper changed: {name}")
for path, sha in DELTAS.values():
    if b.digest(path) != sha:
        b.fail(f"frozen A8 delta changed: {path}")
b.REPO = PINNED  # exact original reveal, not a variant
original_prompt, original_prepare, original_config = b.make_prompt, b.prepare, b.load_config


def make_prompt(c, stage, inputs, deadline, whole):
    full_r0 = original_prompt(c, stage, inputs, deadline, whole)
    if stage == "investigator":
        return full_r0  # investigator delta is exactly empty
    path, sha = DELTAS[stage]
    if b.digest(path) != sha:
        b.fail(f"frozen A8 delta changed: {path}")
    return full_r0 + "\n" + path.read_bytes().decode("utf-8")


def prepare(c, stage):
    result = original_prepare(c, stage)
    if not result.get("retry") and not result.get("alreadyDispatched"):
        p = c["_root"] / "stages" / stage
        freeze = b.read_json(p / "freeze.json")
        if stage in DELTAS:
            path, sha = DELTAS[stage]
            freeze["frozen_inputs"].append({"path": str(path), "sha256": sha, "bytes": path.stat().st_size})
        freeze["method"] = {"id": "A8-SCW-6-v1", "stage_delta": str(DELTAS[stage][0]) if stage in DELTAS else None,
                            "investigator_delta_empty": True, "r0_mechanics_preserved": True}
        b.put_json(p / "freeze.json", freeze)
        req = b.read_json(p / "request.json")
        key = f"er12-A8-{c['run_id']}-{stage}-v1"
        req["clientRequestId"] = req["args"]["clientRequestId"] = key
        b.put_json(p / "request.json", req)
        result["args"] = req["args"]
    return result


def load_config(path):
    c = original_config(path)
    if c.get("method") != "A8-SCW-6-v1" or c.get("dispatch_owner") != "root":
        b.fail("require A8-SCW-6-v1 and root sole dispatch owner")
    return c


b.make_prompt, b.prepare, b.load_config = make_prompt, prepare, load_config
if __name__ == "__main__":
    b.main()
