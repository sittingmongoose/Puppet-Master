"""Exercise C1/terminal/already_issued through the original test caller."""

from pm_goal_dg5_methodb_stage9_ca_checkers import main

from pm_goal_dg_ca_oracles import Suite, c1_until


def retain_original_terminal_times(world, action):
    # Replay the actual timestamp observations from the first original call.
    now = world.sir.clock.now
    times = []

    def record_time():
        timestamp = now()
        times.append(timestamp)
        return timestamp

    world.sir.clock.now = record_time
    action()
    observations = tuple(times)
    cursor = [0]

    def original_time():
        timestamp = observations[cursor[0]]
        cursor[0] += 1
        return timestamp

    world.sir.clock.now = original_time


def fixture(directory, negative):
    world, route = c1_until(Suite(directory), "terminal")
    world.root = world.storage.root
    if negative:
        retain_original_terminal_times(world, route.terminal)
    return world, route.terminal, (), {}


if __name__ == "__main__":
    main({'c1-terminal-already-issued': ('scripts/pm_goal_dg_ca_c1.py', 705, 'C1/terminal/already_issued', fixture)})
