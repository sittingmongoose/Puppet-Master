"""DDBG suite setup using the real shared-view builder as a local dependency."""

from pm_debug_investigation_guard_suites import retry_request_suite


def run_setup():
    from pm_debug_investigation_views import loads_current_json

    loads_current_json('{"retries_used":1}')
    return retry_request_suite()
