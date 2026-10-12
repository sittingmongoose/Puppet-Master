import asyncio
import heapq
import json
import platform
import sys


async def bounded_admission():
    q = asyncio.Queue(maxsize=20)
    for i in range(20):
        await q.put(f"J{i:02d}")
    active = [await q.get() for _ in range(4)]
    for i in range(20, 24):
        await q.put(f"J{i:02d}")
    accepted = 24
    blocked = asyncio.create_task(q.put("J24"))
    await asyncio.sleep(0)
    blocked_before_close = not blocked.done()
    q.shutdown(immediate=False)
    try:
        await blocked
        blocked_result = "unexpectedly accepted"
    except asyncio.QueueShutDown:
        blocked_result = "rejected by shutdown; not accepted"
    waiting = []
    while q.qsize():
        waiting.append(await q.get())
        q.task_done()
    for _ in active:
        q.task_done()
    await q.join()
    return {
        "queue_maxsize": 20,
        "active_workers": len(active),
        "queue_waiting_before_close": 20,
        "accepted_queue_plus_workers": accepted,
        "next_put_blocked_before_close": blocked_before_close,
        "next_put_after_graceful_shutdown": blocked_result,
        "waiting_drained_normally": len(waiting),
        "join_after_every_item_acknowledged": True,
        "active_ids": active,
    }


async def immediate_shutdown_counterexample():
    q = asyncio.Queue(maxsize=20)
    await q.put("active-1")
    await q.put("waiting-1")
    active = await q.get()
    ledger = {"active-1": "running", "waiting-1": "queued"}

    # In an event-loop turn, snapshot the app ledger before the queue drains.
    ledger["waiting-1"] = "abandoned"
    q.shutdown(immediate=True)
    join = asyncio.create_task(q.join())
    await asyncio.sleep(0)
    before_active_ack = join.done()
    ledger["active-1"] = "cancelled"
    q.task_done()
    await join

    q2 = asyncio.Queue()
    await q2.put("only-waiting-1")
    await q2.put("only-waiting-2")
    waiting_ledger = {
        "only-waiting-1": "abandoned",
        "only-waiting-2": "abandoned",
    }
    q2.shutdown(immediate=True)
    await q2.join()
    return {
        "active_cancelled_and_waiting_abandoned": {
            "queue_size_after_immediate_shutdown": q.qsize(),
            "join_done_before_active_ack": before_active_ack,
            "join_done_after_active_ack": join.done(),
            "ledger": ledger,
            "success_count": sum(v == "succeeded" for v in ledger.values()),
            "interpretation": "join returned after the active job was acknowledged as cancelled; no job succeeded",
        },
        "only_waiting_items": {
            "queue_size_after_immediate_shutdown": q2.qsize(),
            "join_returned_without_processing": True,
            "ledger": waiting_ledger,
            "success_count": 0,
        },
    }


def simulated_completion_times(job_count, workers, service_seconds):
    available = [0.0] * workers
    completions = []
    for _ in range(job_count):
        worker = min(range(workers), key=available.__getitem__)
        available[worker] += service_seconds
        completions.append(available[worker])
    return completions


async def main():
    bounded = await bounded_admission()
    force = await immediate_shutdown_counterexample()
    small = simulated_completion_times(12, 4, 2.0)
    long = simulated_completion_times(120, 4, 2.0)
    assert bounded["accepted_queue_plus_workers"] == 24
    assert bounded["next_put_blocked_before_close"]
    assert "not accepted" in bounded["next_put_after_graceful_shutdown"]
    assert force["active_cancelled_and_waiting_abandoned"]["success_count"] == 0
    assert force["active_cancelled_and_waiting_abandoned"]["join_done_after_active_ack"]
    assert force["only_waiting_items"]["join_returned_without_processing"]
    assert max(small) == 6.0
    assert max(long) == 60.0
    result = {
        "python": sys.version,
        "implementation": platform.python_implementation(),
        "bounded_admission": bounded,
        "immediate_shutdown_counterexample": force,
        "independent_discrete_worker_schedule": {
            "assumptions": {
                "jobs": 12,
                "workers": 4,
                "service_seconds_per_job": 2.0,
                "all_jobs_ready_at_time_zero": True,
                "identical_independent_jobs": True,
                "overhead_retries_contention": "excluded",
            },
            "simulated_completion_times_seconds": small,
            "makespan_seconds": max(small),
            "long_run_schedule_check": {
                "jobs": 120,
                "makespan_seconds": max(long),
                "simulated_rate_jobs_per_second": 120 / max(long),
            },
        },
    }
    print(json.dumps(result, sort_keys=True, indent=2))


if __name__ == "__main__":
    asyncio.run(main())
