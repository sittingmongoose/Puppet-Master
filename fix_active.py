with open('Concepts/PuppetMasterDashComp.html', 'r', encoding='utf-8') as f:
    content = f.read()

import re
match = re.search(r"if \(isActive\) \{\s*if \(sidePanelSlot\) sidePanelSlot\.classList\.add\('hidden'\);\s*\}\s*else \{", content, re.DOTALL)
if match:
    old = match.group(0)
    new = r'''if (isActive) {
                    if (sidePanelSlot) sidePanelSlot.classList.add('hidden');
                    iconBtn.classList.remove('active');
                } else {'''
    content = content.replace(old, new)
    print("Fixed iconBtn classList remove")
else:
    print("Could not find isActive logic")

with open('Concepts/PuppetMasterDashComp.html', 'w', encoding='utf-8') as f:
    f.write(content)
