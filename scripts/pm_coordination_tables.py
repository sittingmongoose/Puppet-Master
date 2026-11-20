"""Coordination guard-table registry. Not part of a table scan."""

from pm_coordination_table_payload_schema import payload_schema_case
from pm_coordination_table_payload_instance import payload_instance_case
from pm_coordination_table_projection_schema import projection_schema_case
from pm_coordination_table_projection_value import projection_value_case
from pm_coordination_table_projection_unprovable import projection_unprovable_case
from pm_coordination_table_ledger import ledger_case
from pm_coordination_table_ledger_unprovable import ledger_unprovable_case
from pm_coordination_table_registry import registry_case
from pm_coordination_table_preflight import preflight_case
from pm_coordination_table_svr import svr_case
from pm_coordination_table_svr_unprovable import svr_unprovable_case
from pm_coordination_table_envelope import envelope_case
from pm_coordination_table_fixtures import fixtures_case
from pm_coordination_table_validation import validation_case
from pm_coordination_table_ats import ats_case
from pm_coordination_table_transition import transition_case
from pm_coordination_table_wave2 import wave2_case
from pm_coordination_table_wave2_entailed import wave2_entailed_case

CASES = {
    'payload_schema': payload_schema_case,
    'payload_instance': payload_instance_case,
    'projection_schema': projection_schema_case,
    'projection_value': projection_value_case,
    'projection_unprovable': projection_unprovable_case,
    'ledger': ledger_case,
    'ledger_unprovable': ledger_unprovable_case,
    'registry': registry_case,
    'preflight': preflight_case,
    'svr': svr_case,
    'svr_unprovable': svr_unprovable_case,
    'envelope': envelope_case,
    'fixtures': fixtures_case,
    'validation': validation_case,
    'ats': ats_case,
    'transition': transition_case,
    'wave2': wave2_case,
    'wave2_entailed': wave2_entailed_case,
}

