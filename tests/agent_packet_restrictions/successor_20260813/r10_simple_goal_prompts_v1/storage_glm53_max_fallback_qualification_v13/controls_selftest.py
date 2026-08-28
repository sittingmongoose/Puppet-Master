#!/usr/bin/env python3
import copy, json, os, shutil, subprocess
from pathlib import Path

import controller as C

def require(value, message):
    if not value: raise RuntimeError(message)

contract=copy.deepcopy(C.spec()); row=contract["rows"][0]; nonce="controls-selftest"
for field,stem in C.OMP_PATH_STEMS.items(): row[field]=f"/tmp/pm-r10-storage-dev-controls-{stem}-{nonce}"
old_spec=(C.spec,C.G.spec); C.spec=lambda:contract; C.G.spec=C.spec
try:
    with C.selected(row):
        seed=C.G.prepare_profile(); profile=Path(row["profile_dir"]); require({item.name for item in profile.iterdir()}=={"agent.db","config.yml","models.db","models.yml"},"four-file profile roster"); environment=C.G.isolated_env(dict(os.environ)); observed={}
        for key in ("goal.continuationModes","recap.enabled"):
            process=subprocess.run([contract["runtime"]["binary"],"config","get",key],capture_output=True,text=True,env=environment,timeout=30,check=False)
            require(process.returncode==0 and process.stderr=="","config command")
            observed[key]=C.P.strict_loads(process.stdout.strip())
        require(observed=={"goal.continuationModes":[],"recap.enabled":False},"control values")
        require(seed["config_overlay"]==observed and seed["config_overlay_utf8_bytes"]==71,"overlay receipt")
        require(C.P.sha256_file(profile/"config.yml")=="73bc64d668fa5cdbb57559d191b14ba009520bb7162f8ee75ebcb9d19f2035ff","exact config hash")
        require((profile/"models.yml").stat().st_size==144 and C.P.sha256_file(profile/"models.yml")=="f1a585a1ec9c1a89f2d7533322bad3b7897117cd5fe3e1899bf6bf1139969a69" and oct((profile/"models.yml").stat().st_mode&0o777)=="0o600","exact committed models override")
finally:
    C.spec,C.G.spec=old_spec
    for field in C.OMP_PATH_STEMS:
        path=Path(row[field])
        if path.exists(): shutil.rmtree(path)
    C.DB.cleanup()
print(json.dumps({"status":"PASS_ISOLATED_GOAL_CONTROLS","subject_calls":0,"observed":observed,"config_sha256":"73bc64d668fa5cdbb57559d191b14ba009520bb7162f8ee75ebcb9d19f2035ff","models_override_sha256":seed["models_override"]["sha256"],"profile_seed_overlay_sha256":seed["config_overlay_sha256"]},sort_keys=True))
