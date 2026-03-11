import re

with open('Concepts/PuppetMasterDashComp.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Make sure the close chat icon btn logic allows hiding if active
js_old = r'''                const sidePanelSlot = document.getElementById('sidePanelSlot');
                if (isActive) {
                    // Close the panel
                    if (sidePanelSlot) sidePanelSlot.classList.add('hidden');
                } else {'''
js_new = r'''                const sidePanelSlot = document.getElementById('sidePanelSlot');
                if (isActive) {
                    // Close the panel
                    if (sidePanelSlot) sidePanelSlot.classList.add('hidden');
                    iconBtn.classList.remove('active');
                } else {'''
if js_old in content:
    content = content.replace(js_old, js_new)
    print("Fixed left bar closing")

with open('Concepts/PuppetMasterDashComp.html', 'w', encoding='utf-8') as f:
    f.write(content)
