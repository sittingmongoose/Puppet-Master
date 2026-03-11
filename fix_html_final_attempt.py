with open('Concepts/PuppetMasterDashComp.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix hide dash button initial state
new_hide = r'''        const globalDashToggle = e.target.closest('#globalDashToggle');
        if (globalDashToggle) {
            const dash = document.getElementById('dashboardView');
            if (dash) {
                if (dash.style.display === 'none') {
                    dash.style.display = 'flex';
                    globalDashToggle.style.color = 'var(--text-secondary)';
                } else {
                    dash.style.display = 'none';
                    globalDashToggle.style.color = 'var(--accent-lime)';
                }
                const dashResizer = document.getElementById('editorDashResizer');
                if (dashResizer) dashResizer.style.display = dash.style.display;
            }
        }'''
import re
match = re.search(r"const globalDashToggle = e\.target\.closest\('#globalDashToggle'\);.*?\n\s*\}\n\s*\}", content, re.DOTALL)
if match:
    content = content.replace(match.group(0), new_hide)
    print("Fixed dash toggle colors")

with open('Concepts/PuppetMasterDashComp.html', 'w', encoding='utf-8') as f:
    f.write(content)
