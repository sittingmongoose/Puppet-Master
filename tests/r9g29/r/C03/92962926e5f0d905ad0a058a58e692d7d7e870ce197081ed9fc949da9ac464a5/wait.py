#!/usr/bin/env python3
import runpy,sys

sys.argv=["goal_harness.py","--wait","/mnt/Cursor/PuppetMaster/tests/r9g29/canary_plan.json",sys.argv[1]]
runpy.run_path("/mnt/Cursor/PuppetMaster/tests/r9g29/goal_harness.py",run_name="__main__")
