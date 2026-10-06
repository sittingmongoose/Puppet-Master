"""Versioned trusted generic release selected only for client-dynamic route."""
import hashlib
import importlib.util
import json
from pathlib import Path

TOOLS=Path(__file__).resolve().parents[3]/'tools'/'versions'/'v1.5-clock-telemetry'


def load_tools():
    pins=json.loads((TOOLS/'SOURCE_PINS.json').read_text())
    for name,pin in pins['files'].items():
        if hashlib.sha256((TOOLS/name).read_bytes()).hexdigest()!=pin:
            raise ValueError('trusted generic tool source drift')
    for name,pin in pins['runtime_binaries'].items():
        if hashlib.sha256(Path(name).read_bytes()).hexdigest()!=pin:
            raise ValueError('trusted generic tool runtime drift')
    spec=importlib.util.spec_from_file_location('er9_dynamic_tools',TOOLS/'config.py')
    module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
    return module
