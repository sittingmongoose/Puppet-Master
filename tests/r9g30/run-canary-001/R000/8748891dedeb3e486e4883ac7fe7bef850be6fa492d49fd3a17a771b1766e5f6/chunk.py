#!/usr/bin/env python3
import runpy,sys

sys.argv=["stream_harness.py","--chunk","/mnt/Cursor/PuppetMaster/tests/r9g30/canary_plan.json",sys.argv[1],sys.argv[2]]
runpy.run_path("/mnt/Cursor/PuppetMaster/tests/r9g30/stream_harness.py",run_name="__main__")
