"""Exercise C1/capture_source/final/permission through the original test caller."""

from pm_goal_dg5_methodb_stage9_ca_checkers import main

from pm_goal_dg_ca_oracles import Suite, c1_route


def fixture(directory, negative):
    world, route = c1_route(Suite(directory))
    world.root = world.storage.root
    if negative:
        observe = route.observe_sources

        def change_final_observation(current_route):
            # Substitute only the final permission observation in this copied fixture.
            def final_observation():
                sources = observe()
                return dict(sources, permission="0" * 64)

            current_route.observe_sources = final_observation

        route.inject["capture_source", "final"] = change_final_observation
    return world, route.capture_source, (), {}


if __name__ == "__main__":
    main({'c1-source-recheck': ('scripts/pm_goal_dg_ca_c1.py', 91, 'C1/capture_source/final/permission', fixture)})
