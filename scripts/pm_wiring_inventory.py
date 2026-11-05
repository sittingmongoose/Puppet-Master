"""Shared read-only command inventory checks; never dispatcher admission."""

import fnmatch
import json
import re

# A retired projects-refresh command keeps the TCP-FB number its binding row held, so no
# later number moves when the row goes. It has no binding row, production row, handler or
# alias; its Touch row stays, blocked. DL-335: UCC-058 forbids exposing Bind Existing as
# cmd.chat.worktree.bind_existing, which was binding row 258 of 494 (TCP-FB-259).
RETIRED_PROJECTS_REFRESH_COMMANDS = {
    'cmd.chat.worktree.bind_existing': 'TCP-FB-259',
}


def wiring_command_excluded(command_id, excluded_tokens):
    for token in excluded_tokens:
        if "*" in token and fnmatch.fnmatchcase(command_id, token):
            return True
        if token.endswith("_") and command_id.startswith(token):
            return True
        if command_id == token:
            return True
    return False


def command_handler_bindings(entries):
    bindings = {}
    for row in entries.values():
        if not isinstance(row, dict) or not isinstance(row.get("ui_command_id"), str):
            continue
        targets = bindings.setdefault(row["ui_command_id"], set())
        handler = row.get("handler_location")
        if isinstance(handler, str):
            targets.add(handler)
    return {command: sorted(targets) for command, targets in sorted(bindings.items())}


def projects_refresh_action_inventory(root, sources):
    """Extract reviewed bindings independently of Touch rows and profiles.

    Source deletion/unknown actions fail against the bounded companion and
    typed schemas. Tool IDs additionally come from their actual Tools units.
    """
    from pm_projects_refresh_contracts import COMPUTER_TOOLS, PROJECT_TOOLS
    manifest = json.loads((root / 'Plans/projects_refresh_command_bindings.json').read_text())
    expected = {}
    groups = (
        ('commands', 'command_id', 'projects_refresh_commands', 'command', 1),
        ('local_actions', 'action_id', 'projects_refresh_local', 'ui_action', 493),
        ('tools', 'tool_id', 'projects_refresh_tools', 'tool', 555),
    )
    for group, key, source, kind, offset in groups:
        rows = manifest[group]
        ids = [r[key] for r in rows]
        if len(ids) != len(set(ids)) or set(ids) != sources[source]:
            raise ValueError('Projects refresh independent source inventory drift: ' + source)
        slots = list(ids)
        if group == 'commands':
            # Put each retired command back in the slot its stored TCP-FB id names, so
            # every live row keeps the number it had before the retirement.
            for action, touch_id in sorted(RETIRED_PROJECTS_REFRESH_COMMANDS.items(), key=lambda item: item[1]):
                if action in ids:
                    raise ValueError('Projects refresh retired command still has a binding row: ' + action)
                slot = int(touch_id.rsplit('-', 1)[1]) - offset
                if not 0 <= slot <= len(slots):
                    raise ValueError('Projects refresh retired command slot out of range: ' + touch_id)
                slots.insert(slot, action)
                expected[action] = (touch_id, kind, 'blocked')
        for index, action in enumerate(slots):
            if group == 'commands' and action in RETIRED_PROJECTS_REFRESH_COMMANDS:
                continue
            number = offset + index
            if group == 'commands' and action.startswith('cmd.server.ssh.'):
                number = 561 if action == 'cmd.server.ssh.trust' else 562
            if group == 'tools' and action in COMPUTER_TOOLS:
                number = 563 + list(COMPUTER_TOOLS).index(action)
            expected[action] = (f'TCP-FB-{number:03d}', kind, 'partial')
    local_schema = json.loads((root / 'Plans/final_gui_interaction_contracts.schema.json').read_text())
    local_ids = set(local_schema['$defs']['ProjectsRefreshLocalActionRequest']['properties']['action_id']['enum'])
    local_ids |= {'ui.thread.request.preview', 'ui.thread.spawn.preview'}
    if sources['projects_refresh_local'] != local_ids:
        raise ValueError('Projects refresh typed local schema inventory drift')
    text = (root / 'Plans/Tools.md').read_text()
    declared = set()
    for unit, family in (('T-185', 'projects'), ('T-186', 'computer')):
        match = re.search(r'^### ' + unit + r'\b.*?(?=^### |\Z)', text, re.M | re.S)
        if match:
            # Only quoted/table command declarations, excluding explicit
            # rejected names such as computer.stop in the negative constraints.
            declared |= set(re.findall(r'`(' + family + r'\.[a-z_]+)`\s*\|', match.group()))
            if family == 'projects':
                declared |= set(re.findall(r'\bprojects\.(?:list|status|search|read_file|read_chat|read_plans)\b', match.group()))
    if declared != PROJECT_TOOLS | COMPUTER_TOOLS.keys() or sources['projects_refresh_tools'] != declared:
        raise ValueError('Projects refresh Tools owner/schema inventory drift')
    return expected
