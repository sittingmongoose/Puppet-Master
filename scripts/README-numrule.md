# NUMRULE date-time self-test

Run `python3 scripts/pm_event_datetime_selftest.py --self-test` from the repository root.
It runs the [all-scope NUMRULE suite](../reports/event-authority-20261105/NUMRULE-ADOPTION.md),
including inventory admission, and prints a JSON report. Exit 0 means the suite passed,
exit 1 means it failed, and exit 2 indicates invalid usage.

The older `python3 scripts/pm_event_datetime.py --self-test` invocation loads the
module and exits without running checks because the retained Browser 2.0.0 recipe
uses the module's frozen bytes for custody.
