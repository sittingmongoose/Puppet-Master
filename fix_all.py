import re

with open('Concepts/PuppetMasterDashComp.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Make sure the close chat icon btn logic allows hiding if active
js_old = r'''                if (isActive) {
                    // Close the panel
                    if (sidePanelSlot) sidePanelSlot.classList.add('hidden');
                } else {
                    iconBtn.classList.add('active');'''
js_new = r'''                if (isActive) {
                    // Close the panel
                    if (sidePanelSlot) sidePanelSlot.classList.add('hidden');
                    iconBtn.classList.remove('active');
                } else {
                    iconBtn.classList.add('active');'''
if js_old in content:
    content = content.replace(js_old, js_new)
    print("Fixed left bar closing")

# Fix height and padding of title bar
css_titlebar_old = r'''    .title-bar {
      height: 28px;
      min-height: 28px;
      background: var(--surface);
      border-bottom: var(--border-width) solid var(--border);
      display: flex;
      align-items: center;
      padding: 0 var(--md);'''

css_titlebar_new = r'''    .title-bar {
      height: 40px;
      min-height: 40px;
      background: var(--surface);
      border-bottom: var(--border-width) solid var(--border);
      display: flex;
      align-items: center;
      padding: var(--sm) var(--md);'''
if css_titlebar_old in content:
    content = content.replace(css_titlebar_old, css_titlebar_new)
    print("Fixed title bar height and padding")


with open('Concepts/PuppetMasterDashComp.html', 'w', encoding='utf-8') as f:
    f.write(content)
