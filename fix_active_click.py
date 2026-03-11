with open('Concepts/PuppetMasterDashComp.html', 'r', encoding='utf-8') as f:
    content = f.read()

js_old = r'''        const iconBtn = e.target.closest('.activity-bar .icon');
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
        }'''

js_new = r'''        const iconBtn = e.target.closest('.activity-bar .icon');
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
        }'''

if js_old in content:
    content = content.replace(js_old, js_new)
else:
    print("JS logic not found for active click! Will insert inside body listener.")
    
# Wait, actually the previous replace deleted the global click listener logic by accident because it replaced it with "".
# Let's see if we need to put it inside the body.addEventListener('click')
