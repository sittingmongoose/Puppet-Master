"""Pure administrative declaration constructor for pre-freeze case compilation."""
VISIBLE_CLOCK='inputs/STAGE_CLOCK.json'
DECL_SCHEMA='er9.luna.predeclared-clock-delivery.v1'
INITIAL_POLICY='unchanged-scientific-first-text/exact-builder-neutral-clock-second-text/no-goal-objective-append-v1'


def declaration(stage_id):
    if not isinstance(stage_id,str) or not stage_id:raise ValueError('exact stage identity required')
    return {'schema':DECL_SCHEMA,'behavioral_version':'v1.5-clock-telemetry','stage_id':stage_id,
        'visible_clock_path':VISIBLE_CLOCK,'initial_native_input_policy':INITIAL_POLICY,
        'goal_objective_policy':'unchanged','runtime_generated_file_policy':'exclusive initial snapshot from exact selected builder UTF8; no scientific input overwrite',
        'clock_authority':'proven original candidate action deadline; cleanup separate; missing proof UNKNOWN',
        'clock_consumption_claim':'input/file delivery recorded; model semantic consumption not asserted'}
