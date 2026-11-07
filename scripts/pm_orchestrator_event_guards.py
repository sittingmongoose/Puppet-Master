"""DO guard tables (sweep part 2A): every DO refusal is one named predicate in a table.

Each predicate is `(view, context) -> None | code`: it reads only the view keys its row declares, checks one
invariant, returns None to pass or its row's exact refusal code, and never raises, mutates or calls a helper. The
lane's checkers build the view from the case (`pm_orchestrator_event_oracles`): it holds the case's own fields and
the values the lane recomputes from them (digests, identities, typed trees, schema verdicts), because a predicate may
not call a helper. A predicate abstains (returns None) when a field another row owns is malformed, so a single-defect
negative is refused by its own row alone.

A row is `(name, subject, words, code, predicate, reads, group)`. `group` names a compound clause of the original
checker that appended its code once for any failing member; the lane runner keeps that, so the checker's output lists
are unchanged.

The predicates live in one file per guard-tool suite, `scripts/do-guards/do_<suite>.py`, each with its tool adapter:
the tool scans every function of a file it reaches as checker code unless that suite's table holds it, so a suite
file holds exactly its own rows. This module assembles the stage tables from the suites, in order.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent / 'do-guards'))

import do_recipe_1  # noqa: E402
import do_checkpoint_schema_1  # noqa: E402
import do_checkpoint_identity_1  # noqa: E402
import do_checkpoint_current_1  # noqa: E402
import do_checkpoint_join_1  # noqa: E402
import do_checkpoint_join_2  # noqa: E402
import do_checkpoint_join_3  # noqa: E402
import do_checkpoint_join_4  # noqa: E402
import do_checkpoint_join_5  # noqa: E402
import do_checkpoint_join_6  # noqa: E402
import do_checkpoint_join_7  # noqa: E402
import do_checkpoint_join_8  # noqa: E402
import do_checkpoint_join_9  # noqa: E402
import do_checkpoint_frame_1  # noqa: E402
import do_checkpoint_coverage_1  # noqa: E402
import do_checkpoint_coverage_2  # noqa: E402
import do_checkpoint_coverage_3  # noqa: E402
import do_checkpoint_coverage_4  # noqa: E402
import do_checkpoint_coverage_5  # noqa: E402
import do_checkpoint_coverage_6  # noqa: E402
import do_checkpoint_coverage_7  # noqa: E402
import do_checkpoint_coverage_8  # noqa: E402
import do_checkpoint_coverage_9  # noqa: E402
import do_checkpoint_coverage_10  # noqa: E402

import do_append_number_1  # noqa: E402
import do_append_references_1  # noqa: E402
import do_append_shape_1  # noqa: E402
import do_append_join_1  # noqa: E402
import do_append_join_2  # noqa: E402
import do_append_join_3  # noqa: E402
import do_append_phase_context_1  # noqa: E402
import do_append_predicate_1  # noqa: E402
import do_append_retry_source_1  # noqa: E402
import do_append_retry_transition_1  # noqa: E402
import do_transport_types_1  # noqa: E402
import do_transport_inline_1  # noqa: E402
import do_transport_external_1  # noqa: E402
import do_transport_content_1  # noqa: E402
import do_transport_ingest_1  # noqa: E402
import do_transport_encoding_1  # noqa: E402
import do_pack_shape_1  # noqa: E402
import do_pack_types_1  # noqa: E402
import do_pack_identifier_1  # noqa: E402
import do_pack_encoding_1  # noqa: E402
import do_pack_integrity_1  # noqa: E402
import do_retry_context_1  # noqa: E402
import do_retry_context_2  # noqa: E402
import do_retry_context_3  # noqa: E402
import do_retry_transition_1  # noqa: E402
import do_retry_transition_2  # noqa: E402
import do_retry_transition_3  # noqa: E402
import do_history_state_1  # noqa: E402
import do_history_reader_1  # noqa: E402
import do_history_reader_2  # noqa: E402
import do_history_reader_3  # noqa: E402
import do_history_disclosure_1  # noqa: E402
import do_retry_number_1  # noqa: E402
import do_retry_shape_1  # noqa: E402
import do_retry_replay_1  # noqa: E402
import do_retry_identity_1  # noqa: E402
import do_retry_semantics_1  # noqa: E402
import do_board_number_1  # noqa: E402
import do_board_join_1  # noqa: E402
import do_board_join_2  # noqa: E402
import do_board_join_3  # noqa: E402
import do_board_join_4  # noqa: E402
import do_board_join_5  # noqa: E402
import do_board_member_1  # noqa: E402
import do_selected_definitions_1  # noqa: E402
import do_coordination_storage_1  # noqa: E402
import do_successor_1  # noqa: E402
import do_successor_graph_1  # noqa: E402
import do_successor_graph_2  # noqa: E402
import do_successor_graph_3  # noqa: E402
import do_successor_graph_4  # noqa: E402
import do_successor_storage_count_1  # noqa: E402
import do_successor_storage_1  # noqa: E402
import do_successor_storage_2  # noqa: E402
import do_project_input_shape_1  # noqa: E402
import do_project_input_type_1  # noqa: E402
import do_project_input_type_2  # noqa: E402
import do_project_input_type_3  # noqa: E402
import do_project_input_type_4  # noqa: E402
import do_project_input_type_5  # noqa: E402
import do_project_input_type_6  # noqa: E402
import do_project_input_type_7  # noqa: E402
import do_project_input_type_8  # noqa: E402
import do_project_input_type_9  # noqa: E402
import do_project_input_value_1  # noqa: E402
import do_project_input_value_2  # noqa: E402
import do_board_project_source_1  # noqa: E402
import do_board_project_source_2  # noqa: E402
import do_board_project_source_3  # noqa: E402
import do_board_application_shape_1  # noqa: E402
import do_board_application_source_1  # noqa: E402
import do_board_application_source_2  # noqa: E402
import do_board_application_source_3  # noqa: E402
import do_board_application_source_4  # noqa: E402
import do_board_application_source_5  # noqa: E402
import do_board_application_source_6  # noqa: E402
import do_board_application_source_7  # noqa: E402
import do_board_application_source_8  # noqa: E402
import do_board_application_source_9  # noqa: E402
import do_board_application_source_10  # noqa: E402
import do_board_application_source_11  # noqa: E402
import do_board_posted_1  # noqa: E402
import do_board_posted_2  # noqa: E402
import do_board_posted_3  # noqa: E402

# Suites, in table order: (stage table, suite name, module).
SUITES = (
    ('RECIPE_ROWS', 'recipe_1', do_recipe_1),
    ('CHECKPOINT_SCHEMA_ROWS', 'checkpoint_schema_1', do_checkpoint_schema_1),
    ('CHECKPOINT_IDENTITY_ROWS', 'checkpoint_identity_1', do_checkpoint_identity_1),
    ('CHECKPOINT_CURRENT_ROWS', 'checkpoint_current_1', do_checkpoint_current_1),
    ('CHECKPOINT_JOIN_ROWS', 'checkpoint_join_1', do_checkpoint_join_1),
    ('CHECKPOINT_JOIN_ROWS', 'checkpoint_join_2', do_checkpoint_join_2),
    ('CHECKPOINT_JOIN_ROWS', 'checkpoint_join_3', do_checkpoint_join_3),
    ('CHECKPOINT_JOIN_ROWS', 'checkpoint_join_4', do_checkpoint_join_4),
    ('CHECKPOINT_JOIN_ROWS', 'checkpoint_join_5', do_checkpoint_join_5),
    ('CHECKPOINT_JOIN_ROWS', 'checkpoint_join_6', do_checkpoint_join_6),
    ('CHECKPOINT_JOIN_ROWS', 'checkpoint_join_7', do_checkpoint_join_7),
    ('CHECKPOINT_JOIN_ROWS', 'checkpoint_join_8', do_checkpoint_join_8),
    ('CHECKPOINT_JOIN_ROWS', 'checkpoint_join_9', do_checkpoint_join_9),
    ('CHECKPOINT_FRAME_ROWS', 'checkpoint_frame_1', do_checkpoint_frame_1),
    ('CHECKPOINT_COVERAGE_ROWS', 'checkpoint_coverage_1', do_checkpoint_coverage_1),
    ('CHECKPOINT_COVERAGE_ROWS', 'checkpoint_coverage_2', do_checkpoint_coverage_2),
    ('CHECKPOINT_COVERAGE_ROWS', 'checkpoint_coverage_3', do_checkpoint_coverage_3),
    ('CHECKPOINT_COVERAGE_ROWS', 'checkpoint_coverage_4', do_checkpoint_coverage_4),
    ('CHECKPOINT_COVERAGE_ROWS', 'checkpoint_coverage_5', do_checkpoint_coverage_5),
    ('CHECKPOINT_COVERAGE_ROWS', 'checkpoint_coverage_6', do_checkpoint_coverage_6),
    ('CHECKPOINT_COVERAGE_ROWS', 'checkpoint_coverage_7', do_checkpoint_coverage_7),
    ('CHECKPOINT_COVERAGE_ROWS', 'checkpoint_coverage_8', do_checkpoint_coverage_8),
    ('CHECKPOINT_COVERAGE_ROWS', 'checkpoint_coverage_9', do_checkpoint_coverage_9),
    ('CHECKPOINT_COVERAGE_ROWS', 'checkpoint_coverage_10', do_checkpoint_coverage_10),
    ('APPEND_NUMBER_ROWS', 'append_number_1', do_append_number_1),
    ('APPEND_REFERENCE_ROWS', 'append_references_1', do_append_references_1),
    ('APPEND_SHAPE_ROWS', 'append_shape_1', do_append_shape_1),
    ('APPEND_JOIN_ROWS', 'append_join_1', do_append_join_1),
    ('APPEND_JOIN_ROWS', 'append_join_2', do_append_join_2),
    ('APPEND_JOIN_ROWS', 'append_join_3', do_append_join_3),
    ('APPEND_PHASE_CONTEXT_ROWS', 'append_phase_context_1', do_append_phase_context_1),
    ('APPEND_PREDICATE_ROWS', 'append_predicate_1', do_append_predicate_1),
    ('APPEND_RETRY_SOURCE_ROWS', 'append_retry_source_1', do_append_retry_source_1),
    ('APPEND_RETRY_TRANSITION_ROWS', 'append_retry_transition_1', do_append_retry_transition_1),
    ('TRANSPORT_TYPE_ROWS', 'transport_types_1', do_transport_types_1),
    ('TRANSPORT_INLINE_ROWS', 'transport_inline_1', do_transport_inline_1),
    ('TRANSPORT_EXTERNAL_ROWS', 'transport_external_1', do_transport_external_1),
    ('TRANSPORT_CONTENT_ROWS', 'transport_content_1', do_transport_content_1),
    ('TRANSPORT_INGEST_ROWS', 'transport_ingest_1', do_transport_ingest_1),
    ('TRANSPORT_ENCODING_ROWS', 'transport_encoding_1', do_transport_encoding_1),
    ('PACK_SHAPE_ROWS', 'pack_shape_1', do_pack_shape_1),
    ('PACK_TYPE_ROWS', 'pack_types_1', do_pack_types_1),
    ('PACK_IDENTIFIER_ROWS', 'pack_identifier_1', do_pack_identifier_1),
    ('PACK_ENCODING_ROWS', 'pack_encoding_1', do_pack_encoding_1),
    ('PACK_INTEGRITY_ROWS', 'pack_integrity_1', do_pack_integrity_1),
    ('RETRY_CONTEXT_ROWS', 'retry_context_1', do_retry_context_1),
    ('RETRY_CONTEXT_ROWS', 'retry_context_2', do_retry_context_2),
    ('RETRY_CONTEXT_ROWS', 'retry_context_3', do_retry_context_3),
    ('RETRY_TRANSITION_ROWS', 'retry_transition_1', do_retry_transition_1),
    ('RETRY_TRANSITION_ROWS', 'retry_transition_2', do_retry_transition_2),
    ('RETRY_TRANSITION_ROWS', 'retry_transition_3', do_retry_transition_3),
    ('HISTORICAL_STATE_ROWS', 'history_state_1', do_history_state_1),
    ('HISTORICAL_READER_ROWS', 'history_reader_1', do_history_reader_1),
    ('HISTORICAL_READER_ROWS', 'history_reader_2', do_history_reader_2),
    ('HISTORICAL_READER_ROWS', 'history_reader_3', do_history_reader_3),
    ('HISTORICAL_DISCLOSURE_ROWS', 'history_disclosure_1', do_history_disclosure_1),
    ('RETRY_NUMBER_ROWS', 'retry_number_1', do_retry_number_1),
    ('RETRY_SHAPE_ROWS', 'retry_shape_1', do_retry_shape_1),
    ('RETRY_REPLAY_ROWS', 'retry_replay_1', do_retry_replay_1),
    ('RETRY_IDENTITY_ROWS', 'retry_identity_1', do_retry_identity_1),
    ('RETRY_SEMANTIC_ROWS', 'retry_semantics_1', do_retry_semantics_1),
    ('BOARD_NUMBER_ROWS', 'board_number_1', do_board_number_1),
    ('BOARD_JOIN_ROWS', 'board_join_1', do_board_join_1),
    ('BOARD_JOIN_ROWS', 'board_join_2', do_board_join_2),
    ('BOARD_JOIN_ROWS', 'board_join_3', do_board_join_3),
    ('BOARD_JOIN_ROWS', 'board_join_4', do_board_join_4),
    ('BOARD_JOIN_ROWS', 'board_join_5', do_board_join_5),
    ('BOARD_MEMBER_ROWS', 'board_member_1', do_board_member_1),
    ('SELECTED_DEFINITION_ROWS', 'selected_definitions_1', do_selected_definitions_1),
    ('COORDINATION_STORAGE_ROWS', 'coordination_storage_1', do_coordination_storage_1),
    ('SUCCESSOR_ROWS', 'successor_1', do_successor_1),
    ('SUCCESSOR_GRAPH_ROWS', 'successor_graph_1', do_successor_graph_1),
    ('SUCCESSOR_GRAPH_ROWS', 'successor_graph_2', do_successor_graph_2),
    ('SUCCESSOR_GRAPH_ROWS', 'successor_graph_3', do_successor_graph_3),
    ('SUCCESSOR_GRAPH_ROWS', 'successor_graph_4', do_successor_graph_4),
    ('SUCCESSOR_STORAGE_COUNT_ROWS', 'successor_storage_count_1', do_successor_storage_count_1),
    ('SUCCESSOR_STORAGE_ROWS', 'successor_storage_1', do_successor_storage_1),
    ('SUCCESSOR_STORAGE_ROWS', 'successor_storage_2', do_successor_storage_2),
    ('PROJECT_INPUT_SHAPE_ROWS', 'project_input_shape_1', do_project_input_shape_1),
    ('PROJECT_INPUT_TYPE_ROWS', 'project_input_type_1', do_project_input_type_1),
    ('PROJECT_INPUT_TYPE_ROWS', 'project_input_type_2', do_project_input_type_2),
    ('PROJECT_INPUT_TYPE_ROWS', 'project_input_type_3', do_project_input_type_3),
    ('PROJECT_INPUT_TYPE_ROWS', 'project_input_type_4', do_project_input_type_4),
    ('PROJECT_INPUT_TYPE_ROWS', 'project_input_type_5', do_project_input_type_5),
    ('PROJECT_INPUT_TYPE_ROWS', 'project_input_type_6', do_project_input_type_6),
    ('PROJECT_INPUT_TYPE_ROWS', 'project_input_type_7', do_project_input_type_7),
    ('PROJECT_INPUT_TYPE_ROWS', 'project_input_type_8', do_project_input_type_8),
    ('PROJECT_INPUT_TYPE_ROWS', 'project_input_type_9', do_project_input_type_9),
    ('PROJECT_INPUT_VALUE_ROWS', 'project_input_value_1', do_project_input_value_1),
    ('PROJECT_INPUT_VALUE_ROWS', 'project_input_value_2', do_project_input_value_2),
    ('BOARD_PROJECT_SOURCE_ROWS', 'board_project_source_1', do_board_project_source_1),
    ('BOARD_PROJECT_SOURCE_ROWS', 'board_project_source_2', do_board_project_source_2),
    ('BOARD_PROJECT_SOURCE_ROWS', 'board_project_source_3', do_board_project_source_3),
    ('BOARD_APPLICATION_SHAPE_ROWS', 'board_application_shape_1', do_board_application_shape_1),
    ('BOARD_APPLICATION_SOURCE_ROWS', 'board_application_source_1', do_board_application_source_1),
    ('BOARD_APPLICATION_SOURCE_ROWS', 'board_application_source_2', do_board_application_source_2),
    ('BOARD_APPLICATION_SOURCE_ROWS', 'board_application_source_3', do_board_application_source_3),
    ('BOARD_APPLICATION_SOURCE_ROWS', 'board_application_source_4', do_board_application_source_4),
    ('BOARD_APPLICATION_SOURCE_ROWS', 'board_application_source_5', do_board_application_source_5),
    ('BOARD_APPLICATION_SOURCE_ROWS', 'board_application_source_6', do_board_application_source_6),
    ('BOARD_APPLICATION_SOURCE_ROWS', 'board_application_source_7', do_board_application_source_7),
    ('BOARD_APPLICATION_SOURCE_ROWS', 'board_application_source_8', do_board_application_source_8),
    ('BOARD_APPLICATION_SOURCE_ROWS', 'board_application_source_9', do_board_application_source_9),
    ('BOARD_APPLICATION_SOURCE_ROWS', 'board_application_source_10', do_board_application_source_10),
    ('BOARD_APPLICATION_SOURCE_ROWS', 'board_application_source_11', do_board_application_source_11),
    ('BOARD_POSTED_ROWS', 'board_posted_1', do_board_posted_1),
    ('BOARD_POSTED_ROWS', 'board_posted_2', do_board_posted_2),
    ('BOARD_POSTED_ROWS', 'board_posted_3', do_board_posted_3),
)

RECIPE_ROWS = do_recipe_1.ROWS
CHECKPOINT_SCHEMA_ROWS = do_checkpoint_schema_1.ROWS
CHECKPOINT_IDENTITY_ROWS = do_checkpoint_identity_1.ROWS
CHECKPOINT_CURRENT_ROWS = do_checkpoint_current_1.ROWS
CHECKPOINT_JOIN_ROWS = do_checkpoint_join_1.ROWS + do_checkpoint_join_2.ROWS + do_checkpoint_join_3.ROWS + do_checkpoint_join_4.ROWS + do_checkpoint_join_5.ROWS + do_checkpoint_join_6.ROWS + do_checkpoint_join_7.ROWS + do_checkpoint_join_8.ROWS + do_checkpoint_join_9.ROWS
CHECKPOINT_FRAME_ROWS = do_checkpoint_frame_1.ROWS
CHECKPOINT_COVERAGE_ROWS = do_checkpoint_coverage_1.ROWS + do_checkpoint_coverage_2.ROWS + do_checkpoint_coverage_3.ROWS + do_checkpoint_coverage_4.ROWS + do_checkpoint_coverage_5.ROWS + do_checkpoint_coverage_6.ROWS + do_checkpoint_coverage_7.ROWS + do_checkpoint_coverage_8.ROWS + do_checkpoint_coverage_9.ROWS + do_checkpoint_coverage_10.ROWS
APPEND_NUMBER_ROWS = do_append_number_1.ROWS
APPEND_REFERENCE_ROWS = do_append_references_1.ROWS
APPEND_SHAPE_ROWS = do_append_shape_1.ROWS
APPEND_JOIN_ROWS = do_append_join_1.ROWS + do_append_join_2.ROWS + do_append_join_3.ROWS
APPEND_PHASE_CONTEXT_ROWS = do_append_phase_context_1.ROWS
APPEND_PREDICATE_ROWS = do_append_predicate_1.ROWS
APPEND_RETRY_SOURCE_ROWS = do_append_retry_source_1.ROWS
APPEND_RETRY_TRANSITION_ROWS = do_append_retry_transition_1.ROWS
TRANSPORT_TYPE_ROWS = do_transport_types_1.ROWS
TRANSPORT_INLINE_ROWS = do_transport_inline_1.ROWS
TRANSPORT_EXTERNAL_ROWS = do_transport_external_1.ROWS
TRANSPORT_CONTENT_ROWS = do_transport_content_1.ROWS
TRANSPORT_INGEST_ROWS = do_transport_ingest_1.ROWS
TRANSPORT_ENCODING_ROWS = do_transport_encoding_1.ROWS
PACK_SHAPE_ROWS = do_pack_shape_1.ROWS
PACK_TYPE_ROWS = do_pack_types_1.ROWS
PACK_IDENTIFIER_ROWS = do_pack_identifier_1.ROWS
PACK_ENCODING_ROWS = do_pack_encoding_1.ROWS
PACK_INTEGRITY_ROWS = do_pack_integrity_1.ROWS
RETRY_CONTEXT_ROWS = do_retry_context_1.ROWS + do_retry_context_2.ROWS + do_retry_context_3.ROWS
RETRY_TRANSITION_ROWS = do_retry_transition_1.ROWS + do_retry_transition_2.ROWS + do_retry_transition_3.ROWS
HISTORICAL_STATE_ROWS = do_history_state_1.ROWS
HISTORICAL_READER_ROWS = do_history_reader_1.ROWS + do_history_reader_2.ROWS + do_history_reader_3.ROWS
HISTORICAL_DISCLOSURE_ROWS = do_history_disclosure_1.ROWS
RETRY_NUMBER_ROWS = do_retry_number_1.ROWS
RETRY_SHAPE_ROWS = do_retry_shape_1.ROWS
RETRY_REPLAY_ROWS = do_retry_replay_1.ROWS
RETRY_IDENTITY_ROWS = do_retry_identity_1.ROWS
RETRY_SEMANTIC_ROWS = do_retry_semantics_1.ROWS
BOARD_NUMBER_ROWS = do_board_number_1.ROWS
BOARD_JOIN_ROWS = do_board_join_1.ROWS + do_board_join_2.ROWS + do_board_join_3.ROWS + do_board_join_4.ROWS + do_board_join_5.ROWS
BOARD_MEMBER_ROWS = do_board_member_1.ROWS
SELECTED_DEFINITION_ROWS = do_selected_definitions_1.ROWS
COORDINATION_STORAGE_ROWS = do_coordination_storage_1.ROWS
SUCCESSOR_ROWS = do_successor_1.ROWS
SUCCESSOR_GRAPH_ROWS = do_successor_graph_1.ROWS + do_successor_graph_2.ROWS + do_successor_graph_3.ROWS + do_successor_graph_4.ROWS
SUCCESSOR_STORAGE_COUNT_ROWS = do_successor_storage_count_1.ROWS
SUCCESSOR_STORAGE_ROWS = do_successor_storage_1.ROWS + do_successor_storage_2.ROWS
PROJECT_INPUT_SHAPE_ROWS = do_project_input_shape_1.ROWS
PROJECT_INPUT_TYPE_ROWS = do_project_input_type_1.ROWS + do_project_input_type_2.ROWS + do_project_input_type_3.ROWS + do_project_input_type_4.ROWS + do_project_input_type_5.ROWS + do_project_input_type_6.ROWS + do_project_input_type_7.ROWS + do_project_input_type_8.ROWS + do_project_input_type_9.ROWS
PROJECT_INPUT_VALUE_ROWS = do_project_input_value_1.ROWS + do_project_input_value_2.ROWS
BOARD_PROJECT_SOURCE_ROWS = do_board_project_source_1.ROWS + do_board_project_source_2.ROWS + do_board_project_source_3.ROWS
BOARD_APPLICATION_SHAPE_ROWS = do_board_application_shape_1.ROWS
BOARD_APPLICATION_SOURCE_ROWS = do_board_application_source_1.ROWS + do_board_application_source_2.ROWS + do_board_application_source_3.ROWS + do_board_application_source_4.ROWS + do_board_application_source_5.ROWS + do_board_application_source_6.ROWS + do_board_application_source_7.ROWS + do_board_application_source_8.ROWS + do_board_application_source_9.ROWS + do_board_application_source_10.ROWS + do_board_application_source_11.ROWS
BOARD_POSTED_ROWS = do_board_posted_1.ROWS + do_board_posted_2.ROWS + do_board_posted_3.ROWS
