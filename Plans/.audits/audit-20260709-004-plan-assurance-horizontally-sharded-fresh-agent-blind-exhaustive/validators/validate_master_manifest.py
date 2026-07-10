#!/usr/bin/env python3
import importlib.util, json, sys
from pathlib import Path
root = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('audit004_build', root / 'build_launch.py')
module = importlib.util.module_from_spec(spec)
assert spec and spec.loader
sys.modules[spec.name] = module
spec.loader.exec_module(module)
print(json.dumps(module.validate_existing(), indent=2, sort_keys=True))
