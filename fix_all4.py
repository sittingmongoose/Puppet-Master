with open('Concepts/PuppetMasterDashComp.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the left panel active toggle logic
import re
match = re.search(r"const iconBtn = e\.target\.closest\('\.activity-bar \.icon'\);\s*if \(iconBtn\) \{(.*?)\}\s*const advSearchToggle", content, re.DOTALL)
if match:
    old_logic = match.group(0)
    new_logic = r'''const iconBtn = e.target.closest('.activity-bar .icon');
        if (iconBtn) {
            const title = iconBtn.getAttribute('title');
            const chatPanel = document.getElementById('chatPanel');
            
            if (title === 'Chat') {
                if (chatPanel) chatPanel.classList.toggle('hidden');
                iconBtn.classList.toggle('active');
            } else {
                const isActive = iconBtn.classList.contains('active');
                document.querySelectorAll('.activity-bar .icon:not([title="Chat"])').forEach(i => i.classList.remove('active'));
                
                const sidePanelSlot = document.getElementById('sidePanelSlot');
                if (isActive) {
                    if (sidePanelSlot) sidePanelSlot.classList.add('hidden');
                } else {
                    iconBtn.classList.add('active');
                    const targetId = iconBtn.getAttribute('data-target');
                    if (targetId) {
                        document.querySelectorAll('.side-panel-view').forEach(v => v.classList.remove('active'));
                        const targetView = document.getElementById(targetId);
                        if (targetView) targetView.classList.add('active');
                        if (sidePanelSlot) sidePanelSlot.classList.remove('hidden');
                    }
                }
            }
        }

        const advSearchToggle'''
    content = content.replace(old_logic, new_logic)
    print("Replaced iconBtn logic")

with open('Concepts/PuppetMasterDashComp.html', 'w', encoding='utf-8') as f:
    f.write(content)
