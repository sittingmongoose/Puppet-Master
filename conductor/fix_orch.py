import sys

with open('Concepts/PuppetMasterDashComp.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

start_idx = -1
end_idx = -1

for i, line in enumerate(lines):
    if '<span class="status-badge">Idle</span>' in line and 'orchestrator-buttons' in lines[i+1]:
        start_idx = i
        break

if start_idx != -1:
    for i in range(start_idx, len(lines)):
        if '<div class="orch-tab-content" data-tab="tiers">' in lines[i]:
            end_idx = i
            break

if start_idx != -1 and end_idx != -1:
    new_lines = lines[:start_idx] + lines[end_idx:]
    with open('Concepts/PuppetMasterDashComp.html', 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    print("Garbage removed.")
else:
    print("Could not find the bounds.")
