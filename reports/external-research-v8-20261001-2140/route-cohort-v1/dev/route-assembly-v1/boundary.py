"""Explicit pinned v8 public capture overlay; no implicit legacy module search."""
import importlib.util
from pathlib import Path

SOURCE=Path(__file__).resolve().parent.parent/'source-capture-v1/boundary.py'
spec=importlib.util.spec_from_file_location('v8_source_capture_boundary',SOURCE)
module=importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
allowlist=module.allowlist
mcp_config=module.mcp_config
