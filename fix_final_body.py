with open('Concepts/PuppetMasterDashComp.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Let's see what the body click listener actually looks like now
import re
match = re.search(r"document\.body\.addEventListener\('click', \(e\) => \{(.*?)\}\);", content, re.DOTALL)
if match:
    body_content = match.group(1)
    if "iconBtn" not in body_content:
        print("iconBtn logic is missing, appending it to body listener")
        new_body_content = body_content + r'''
        const iconBtn = e.target.closest('.activity-bar .icon');
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
                    // Close the panel
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
'''
        content = content.replace(match.group(0), f"document.body.addEventListener('click', (e) => {{{new_body_content}}});")
        with open('Concepts/PuppetMasterDashComp.html', 'w', encoding='utf-8') as f:
            f.write(content)
        print("Fixed body listener.")
    else:
        print("iconBtn logic is already there")
else:
    print("Could not find body listener.")
