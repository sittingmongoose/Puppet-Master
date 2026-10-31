#!/usr/bin/env python3
"""DL-259 static onboarding, credential and connector contract checks."""
from pathlib import Path
import json
import re
import runpy
import sys

import jsonschema
import yaml

ROOT = Path(__file__).resolve().parents[1]
PLANS = ROOT / 'Plans'


def read(name):
    return json.loads((PLANS / name).read_text())


def check():
    failures, counts = [], {}

    def require(ok, message):
        if not ok:
            failures.append(message)

    verifier = runpy.run_path(str(ROOT / 'scripts/pm-new-contracts-verify.py'))
    registry = verifier['offline_schema_registry']()
    for stem in ('product_onboarding', 'guided_tour', 'remote_access_system'):
        schema_name = stem + '_contracts.schema.json'
        fixture_name = stem + '_contract_fixtures.json'
        schema, fixtures = read(schema_name), read(fixture_name)
        jsonschema.Draft202012Validator.check_schema(schema)
        positives = fixtures.get('valid', [])
        by_name = {case['name']: case['value'] for case in positives}
        for case in positives:
            definition, selected = verifier['select_definition'](schema, case, case['value'], require_valid=True)
            errors = list(verifier['validator_for'](schema, selected, registry).iter_errors(case['value']))
            semantic = [] if errors else verifier['contract_semantic_failures'](
                'Plans/' + schema_name, definition, case['value'], context=case.get('context'))
            require(not errors and not semantic, fixture_name + ': positive ' + case['name'] + ': ' +
                    (errors[0].message if errors else str(semantic)))
            if definition in verifier['root_definition_names'](schema):
                require(verifier['validator_for'](schema, schema, registry).is_valid(case['value']),
                        fixture_name + ': aggregate rejects ' + case['name'])
        negatives = fixtures.get('invalid', [])
        for case in negatives:
            value = verifier['materialize_invalid'](case, by_name)
            definition, selected = verifier['select_definition'](schema, case, value, require_valid=False)
            valid = verifier['validator_for'](schema, selected, registry).is_valid(value)
            semantic = verifier['contract_semantic_failures'](
                'Plans/' + schema_name, definition, value, context=case.get('context')) if valid else []
            require(not valid or bool(semantic), fixture_name + ': negative accepted ' + case['name'])
        counts[stem] = {'positive': len(positives), 'negative': len(negatives)}

    policy = read('product_onboarding_contracts.schema.json')['x-product-rulings']
    require(policy['owner_ref'] == 'Plans/Decision_Log.md#DL-259', 'Product-ruling authority differs')
    require(policy['onboarding_free_front'] == [
        {'provider': 'openrouter', 'auth': 'sign_in'}, {'provider': 'groq', 'auth': 'api_key'},
        {'provider': 'nvidia', 'auth': 'api_key'}], 'Three front Free Models providers differ')
    require(policy['advanced_free_providers'] == {'initially_open': False, 'controls_per_surface': 1,
            'source': 'current_eligible_Free_Models_catalog', 'fixed_list': False, 'fixed_count': False,
            'Settings_matches': True}, 'Advanced free catalog disclosure differs')
    require(policy['free_catalog_source'].endswith('/releases/tag/v0.6.0') and
            policy['free_catalog_read_date'] == '2026-10-31', 'Live upstream reference differs')
    require(policy['broader_catalog_owner'] == 'Plans/Models_System.md#MS-118', 'Broader catalog lost its owner')
    require(policy['provider_admission'] == 'immediately_before_product_build' and
            policy['wizard_provider_caveats'] is False, 'Provider-admission ruling differs')
    require(policy['backup_offer'] == ['NAS', 'Google Drive', 'OneDrive', 'Amazon S3', 'Backblaze B2',
                                     'S3-compatible', 'SFTP', 'WebDAV'] and
            policy['backup_Settings'] == ['Azure Blob', 'Google Cloud Storage', 'REST server'],
            'Onboarding backup subset differs from D2')
    require(policy['file_safe_group'] == ['command_blocklist', 'write_scope', 'security_filter',
                                        'pre_write_safe_points'] and not policy['file_safe_bypass_allowed'],
            'FileSafe grouping bypasses a guard')
    require(policy['credential_custody'] == 'execution_host' and
            policy['native_client_tailnet'] == 'built_in_no_separate_install' and
            policy['plain_browser_tailnet'] == 'none_use_remote_link_or_device_private_path',
            'Credential/native/browser ownership differs')
    interaction = policy['interaction_mode']
    row = next(r for r in read('settings_inventory.json')['settings'] if r['id'] == interaction['setting_id'])
    require(row['default'] == interaction['default'] == 'ELI5' and row['scope'] == ['global'],
            'Interaction mode lost its one global default')
    require(interaction['labels'] == {'ELI5': 'Plain English', 'Expert': 'Expert'} and
            interaction['dual_copy_scope'] == 'tips_and_help_only', 'DL-126 dual-copy boundary differs')
    bindings = {r['control_id']: r for r in read('pm7_control_bindings.json')['bindings']}
    for cid in ('onboarding.interaction.mode', 'tour.interaction.mode'):
        binding = bindings[cid]
        require(binding['setting_ids'] == ['general.interaction.mode'] and
                binding['action_ids'] == ['cmd.settings.transaction.preview', 'cmd.settings.transaction.apply'],
                cid + ': shared mode bypasses Settings')
    # The owner contracts can agree while an older consumer still promises an
    # independent Off state. Check the consumer unit as well as the typed policy.
    def owner_unit(document, unit_id):
        for block in re.finditer(r'^```yaml\n(.*?)^```', (PLANS / document).read_text(), re.M | re.S):
            if re.search(r'^plan_unit_id: ' + re.escape(unit_id) + r'$', block[1], re.M):
                return yaml.load(block[1], Loader=yaml.BaseLoader)
        raise ValueError('Missing owner unit ' + unit_id)

    tour_unit = owner_unit('FinalGUISpec.md', 'F3-521')
    tour_contract = json.dumps({key: tour_unit[key] for key in
                               ('canonical_text', 'acceptance_criteria', 'negative_constraints',
                                'preserved_exact_tokens')})
    require(all(token in tour_contract for token in
                ('general.interaction.mode', 'Plain English', 'Expert', 'DL-259')) and
            'ELI5: Off' not in tour_contract and 'only tour-specific' not in tour_contract,
            'F3-521 retains a separate/default-Off Tour preference')
    shared_rule = owner_unit('DRY_Rules.md', 'DR-074')['canonical_text']
    require(all(token in shared_rule for token in ('general.interaction.mode',
                'onboarding.interaction.mode', 'tour.interaction.mode')),
            'DR-074 omits the shared mode owner/consumers')
    catalog_text = (PLANS / 'UI_Command_Catalog.md').read_text()
    require("top-bar ELI5 control changes the tour's narration only" not in catalog_text,
            'Catalog consumer still promises narration-only Tour mode')
    counts['shared_mode_consumer_checks'] = 3
    remote = read('remote_access_system_contracts.schema.json')
    require(remote['$defs']['reverse_proxy_configuration']['properties']['proxy_family']['enum'] ==
            ['caddy', 'nginx', 'traefik'], 'Generated proxy families differ')
    require(len(remote['$defs']['command_payload']['oneOf']) == 44,
            'D7 introduced or removed a Remote Access primary command')
    account_schema = read('multi_account_contracts.schema.json')
    jsonschema.Draft202012Validator.check_schema(account_schema)
    provider = account_schema['x-provider-entry-amendments']
    entries = {r['provider_entry_id']: r for r in provider['entries']}
    require(set(entries) == {'cursor_sdk', 'alibaba_token_plan'}, 'Distinct new provider entries differ')
    require(provider['existing_cursor_cli_default_auth'] == 'browser' and
            all(r['default_auth_surface'] == 'api_key' for r in entries.values()),
            'SDK/Token defaults overwrite the CLI browser default')
    descriptor = {**account_schema, '$ref': '#/$defs/ProviderEntryPolicy'}
    descriptor.pop('oneOf', None)
    validator = verifier['validator_for'](account_schema, descriptor, registry)
    require(all(validator.is_valid(r) for r in entries.values()), 'Provider entry policy is invalid')
    require(not validator.is_valid({**entries['cursor_sdk'], 'default_auth_surface': 'browser'}),
            'SDK entry accepts the CLI default')
    require(not validator.is_valid({**entries['alibaba_token_plan'], 'billing_class': 'pay_as_you_go'}),
            'Token Plan collapses into DashScope billing')
    require(provider['pre_build_verification'] == ['Z.AI_listed_tools', 'Kimi_Code_client_identity',
            'OpenCode_Go_client_identity', 'Muse_only_subscription_credential'] and
            provider['provider_caveats_in_wizard'] is False, 'D4 checklist became wizard caveats')
    counts['provider_entry_policy'] = {'positive': 2, 'negative': 2}
    return {'check': 'pm7-onboarding-rulings', 'status': 'fail' if failures else 'pass',
            'claim_boundary': 'static_contract_fixtures_only_no_runtime_or_provider_admission_proof',
            'counts': counts, 'failures': failures}


if __name__ == '__main__':
    result = check()
    print(json.dumps(result, indent=2))
    sys.exit(bool(result['failures']))
