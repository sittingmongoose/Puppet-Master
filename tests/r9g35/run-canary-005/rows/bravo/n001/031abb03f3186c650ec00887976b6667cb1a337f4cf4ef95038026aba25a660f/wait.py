#!/usr/bin/env python3
import runpy,sys

sys.argv=["progressive_waiter_journal.py","--wait","/mnt/Cursor/PuppetMaster/tests/r9g35/canary_005_plan.json",sys.argv[1]]
runpy.run_path("/mnt/Cursor/PuppetMaster/tests/r9g35/progressive_waiter_journal.py",run_name="__main__")
