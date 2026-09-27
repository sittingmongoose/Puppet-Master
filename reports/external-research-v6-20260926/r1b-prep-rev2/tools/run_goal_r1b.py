#!/usr/bin/env python3
"""R1b wrapper around the unchanged R1 run_goal.py: Muse host runs with --disable-shell (available native restriction)."""
import sys
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
import muse_goal_driver as mg  # noqa: E402
mg.MUSE = HERE / "muse-serve-noshell.sh"
import run_goal  # noqa: E402
sys.exit(run_goal.main())
