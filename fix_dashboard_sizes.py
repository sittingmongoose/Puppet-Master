import re

with open('Concepts/PuppetMasterDashComp.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update CSS
css_old = r'''    .bento-widget.size-1x1 { width: calc(50% - (var(--lg) / 2)); min-height: 120px; }
    .bento-widget.size-2x1 { width: 100%; min-height: 120px; }
    .bento-widget.size-2x2 { width: 100%; min-height: 240px; }'''
    
css_new = r'''    .bento-widget.size-1x1 { width: 220px; height: 220px; }
    .bento-widget.size-2x1 { width: calc(440px + var(--lg)); height: 220px; }
    .bento-widget.size-2x2 { width: calc(440px + var(--lg)); height: calc(440px + var(--lg)); }'''
    
content = content.replace(css_old, css_new)

# 2. Remove inline styles from widgets
inline1 = r'''style="width: calc(100% - var(--lg)); min-width: 400px; max-width: 600px;"'''
inline2 = r'''style="width: calc(50% - var(--lg)); min-width: 200px; max-width: 290px;"'''

content = content.replace(inline1, "")
content = content.replace(inline2, "")

# 3. Add Dashboard Tabs JS logic
js_tabs = r'''
        // Dashboard tabs logic
        document.querySelectorAll('.dashboard-tabs').forEach(tabsContainer => {
            tabsContainer.addEventListener('click', e => {
                const tab = e.target.closest('.tab');
                if (tab) {
                    tabsContainer.querySelectorAll('.tab').forEach(t => {
                        t.classList.remove('active');
                        t.style.color = 'var(--text-secondary)';
                        t.style.background = 'transparent';
                        t.style.border = 'var(--border-width) solid transparent';
                    });
                    tab.classList.add('active');
                    tab.style.color = 'var(--text-primary)';
                    tab.style.background = 'var(--surface)';
                    tab.style.border = 'var(--border-width) solid var(--border)';
                    tab.style.borderBottom = 'none';
                    tab.style.borderRadius = 'var(--border-radius) var(--border-radius) 0 0';
                }
            });
        });
'''

content = content.replace("document.addEventListener('DOMContentLoaded', () => {", "document.addEventListener('DOMContentLoaded', () => {\n" + js_tabs)


with open('Concepts/PuppetMasterDashComp.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed widget sizes and tab logic")
