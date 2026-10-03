"""Exact public model/tool controls; no provider or credential access."""
import copy
import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
MODEL = 'gpt-6-luna'
EFFORT = 'max'
CLI = Path('USER_HOME/.codex/packages/standalone/releases/0.159.2-x86_64-unknown-linux-musl/bin/codex')
CLI_SHA = '1748767b230ebfc3d4ab7e4e254920d0c0ad9691fd8c11f190e7d44511a4a92e'
DELTA = {'apply_patch_tool_type': None, 'tool_mode': None, 'experimental_supported_tools': [], 'supports_search_tool': False}
OFF = ('shell_tool unified_exec unified_exec_tty shell_snapshot shell_snapshot_v2 '
       'multi_agent multi_agent_v2 memories plugins hooks apps browser_use '
       'browser_use_external browser_use_full_cdp_access computer_use view_image '
       'image_generation in_app_browser in_app_local_automation workspace_dependencies '
       'daemon_auto_start skill_search skill_mcp_dependency_install '
       'skill_env_var_dependency_prompt code_mode code_mode_host code_mode_only '
       'code_mode_prewarm deferred_executor deferred_tool_world_state '
       'request_permissions_tool send_message_to_user_async token_budget '
       'current_time_reminder sleep_tool tool_suggest remote_plugin recommended_plugins '
       'chronicle agent_message_board unbounded_connection_retries '
       'tool_call_mcp_elicitation auth_elicitation system_proxy_fallback').split()
NATIVE_GOAL_TOOLS = {'create_goal', 'get_goal', 'update_goal'}
MCP_TOOLS = {'read_file', 'write_file', 'mechanical', 'public_https_get'}


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def verify_sources():
    m = json.loads((HERE / 'selected-sources.json').read_text())
    for path, pin in m['sources'].items():
        if sha(path) != pin: raise ValueError('selected public source drift')
    if sha(CLI) != CLI_SHA: raise ValueError('standalone executable drift')
    official = json.loads((HERE / 'official-luna-catalog.json').read_text())
    restricted = json.loads((HERE / 'restricted-luna-catalog.json').read_text())
    if len(official['models']) != 1 or official['models'][0]['slug'] != MODEL:
        raise ValueError('one original Luna row required')
    expected = copy.deepcopy(official)
    expected['models'][0].update(DELTA)
    if restricted != expected: raise ValueError('undeclared catalog mutation')
    if not any(x['effort'] == EFFORT for x in expected['models'][0]['supported_reasoning_levels']):
        raise ValueError('official Luna max missing')
    if expected['models'][0]['experimental_supported_tools']:
        raise ValueError('unreviewed catalog experimental tools')
    return {'catalog_delta': DELTA, 'model': MODEL, 'effort': EFFORT,
            'actual_inference_payload': 'UNOBSERVED', 'account_model_access': 'UNKNOWN'}


def config(proxy_argv):
    if not proxy_argv or proxy_argv[0] != '/usr/bin/python3':
        raise ValueError('fixed sibling MCP proxy required')
    result = {'model': MODEL, 'model_provider': 'openai', 'model_reasoning_effort': EFFORT,
              'model_catalog_json': str(HERE / 'restricted-luna-catalog.json'),
              'approval_policy': 'never', 'approvals_reviewer': 'user',
              'sandbox_mode': 'workspace-write', 'web_search': 'disabled',
              'forced_login_method': 'chatgpt', 'cli_auth_credentials_store': 'file',
              'history.persistence': 'none', 'project_doc_max_bytes': 0,
              'project_doc_fallback_filenames': [], 'agents.enabled': False,
              'tools.update_plan.enabled': False, 'tools.experimental_request_user_input.enabled': False,
              'memories.generate_memories': False, 'memories.use_memories': False,
              'memories.dedicated_tools': False, 'analytics.enabled': False, 'feedback.enabled': False,
              'mcp_servers': {'pm_boundary': {'command': proxy_argv[0], 'args': proxy_argv[1:],
                    'enabled': True, 'required': True, 'enabled_tools': sorted(MCP_TOOLS),
                    'startup_timeout_sec': 20, 'tool_timeout_sec': 20,
                    'default_tools_approval_mode': 'auto'}}}
    result.update({'features.' + name: False for name in OFF})
    result['features.skip_host_skill_discovery'] = True
    result['features.goals'] = True
    return result


def projected_config_check(effective, expected):
    omitted=[]
    for key,value in expected.items():
        node=effective
        try:
            for part in key.split('.'):
                node=node[part]
        except (KeyError,TypeError):
            if key in ('tools.update_plan.enabled','tools.experimental_request_user_input.enabled'):
                omitted.append(key);continue
            raise ValueError('required effective native control omitted')
        def matches(actual,wanted):
            if isinstance(wanted,dict):
                return isinstance(actual,dict) and all(k in actual and matches(actual[k],v) for k,v in wanted.items())
            return actual==wanted
        if not matches(node,value):raise ValueError('effective native control drift')
    # Source-proven typed fields above are parsed by --strict-config, but app-server
    # ConfigReadResponse uses ToolsV2 and deliberately omits these two fields.
    return {'projected_selected_controls_match':True,'unprojected_supported_controls':omitted}


def config_argv(values):
    # JSON strings/scalars/arrays are also TOML values. Objects need TOML inline tables.
    def toml(value):
        if isinstance(value, dict):
            return '{ ' + ', '.join(json.dumps(k) + ' = ' + toml(v) for k,v in value.items()) + ' }'
        if isinstance(value, list): return '[' + ', '.join(toml(v) for v in value) + ']'
        return json.dumps(value)
    argv = []
    for key, value in values.items(): argv += ['-c', key + '=' + toml(value)]
    return argv
