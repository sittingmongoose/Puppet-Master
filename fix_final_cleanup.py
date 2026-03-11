import re

with open('Concepts/PuppetMasterDashComp.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Make sure all elements have proper cursors and layout
css_fixes = r'''
    .resizer-col {
      width: 4px;
      background: transparent;
      cursor: col-resize;
      transition: background 0.2s;
      z-index: 100;
    }
'''
if css_fixes not in content:
    print("CSS fixes not found")

with open('Concepts/PuppetMasterDashComp.html', 'w', encoding='utf-8') as f:
    f.write(content)
