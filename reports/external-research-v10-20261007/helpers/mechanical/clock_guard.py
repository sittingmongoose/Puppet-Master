#!/usr/bin/env python3
"""Read-only UTC expiry decision. No waits, worker RPCs, Goal changes or scheduling."""
import argparse
import datetime as dt
import json

def utc(value):
    parsed = dt.datetime.fromisoformat(value.replace("Z", "+00:00").replace(" UTC", "+00:00"))
    if parsed.tzinfo is None:
        raise ValueError("An explicit UTC offset or Z is required")
    return parsed.astimezone(dt.timezone.utc)

def decide(deadline, observed, notice=None, grace=60, policy="lifecycle_notice"):
    if not 0 <= grace <= 60:
        raise ValueError("Grace must be between0 and60 seconds")
    remaining = (deadline - observed).total_seconds()
    end = notice + dt.timedelta(seconds=grace) if notice else None
    if remaining > 0:
        action = "NO_EXPIRY_ACTION"
    elif policy == "passive_cancel":
        action = "CAPTURE_THEN_OWNED_CANCEL_IF_LIVE"
    elif notice is None:
        action = "LIFECYCLE_DELIVERY_NOTICE_IF_LIVE"
    elif observed < end:
        action = "WAIT_FOR_DELIVERY_NOTIFICATION"
    else:
        action = "OWNED_CANCEL_IF_STILL_LIVE"
    return {
        "schema": "ER10-readonly-clock-guard-v1",
        "observed_at": observed.isoformat(),
        "original_deadline": deadline.isoformat(),
        "seconds_remaining": remaining,
        "deadline_elapsed": remaining <= 0,
        "prior_notice_at": notice.isoformat() if notice else None,
        "prior_notice_was_early": notice < deadline if notice else None,
        "actual_notice_grace_end": end.isoformat() if end else None,
        "grace_elapsed": observed >= end if end else None,
        "policy": policy,
        "decision": action,
        "limitation": "Only a timing predicate; actual owned task/native state and artifact checks are required before any action. It neither authorizes new work nor extends a deadline."
    }

def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--deadline", required=True)
    p.add_argument("--observed-at")
    p.add_argument("--prior-notice-at")
    p.add_argument("--grace-seconds", type=int, default=60)
    p.add_argument("--policy", choices=["lifecycle_notice", "passive_cancel"], default="lifecycle_notice")
    a = p.parse_args()
    result = decide(utc(a.deadline), utc(a.observed_at) if a.observed_at else dt.datetime.now(dt.timezone.utc),
                    utc(a.prior_notice_at) if a.prior_notice_at else None, a.grace_seconds, a.policy)
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main()

