import re
import sys

def main():
    file_path = "Concepts/PuppetMasterDashComp.html"
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
    except FileNotFoundError:
        sys.exit(1)

    # 1. Fix the double/broken tags at the start of Dashboard
    content = content.replace('<div class="page page-dashboard active">\n              <div class="page page-dashboard active">', '<div class="page page-dashboard active">')
    
    # 2. Re-balance the main content area
    # We want to find the primary-content block and ensure its children (pages) are siblings.
    
    pages = [
        ('page-dashboard', '<div class="page page-dashboard active">', '<div class="page page-projects">'),
        ('page-projects', '<div class="page page-projects">', '<div class="page page-wizard">'),
        ('page-wizard', '<div class="page page-wizard">', '<div class="page page-orchestrator">'),
        ('page-orchestrator', '<div class="page page-orchestrator">', '<div class="page page-usage">'),
        ('page-usage', '<div class="page page-usage">', '<div class="page page-settings">'),
        ('page-settings', '<div class="page page-settings">', '</main>')
    ]
    
    new_pages_html = ""
    for name, start_m, end_m in pages:
        s = content.find(start_m)
        if s == -1: continue
        e = content.find(end_m, s + len(start_m))
        if e == -1: continue
        
        inner = content[s + len(start_m):e].strip()
        # Clean inner: remove trailing </div> tags that might be closures of the page itself
        while inner.endswith('</div>'):
            # Count divs in inner
            if inner.count('<div') + inner.count('<nav') + inner.count('<aside') < inner.count('</div>'):
                inner = inner[:-6].strip()
            else:
                break
        
        # Add back the correct wrapper
        new_pages_html += f'\n              <div class="page {name} {"active" if name=="page-dashboard" else ""}">\n                {inner}\n              </div>\n'

    # Re-insert into primary-content
    pc_start_marker = '<main class="primary-content">'
    pc_end_marker = '</main>'
    
    pcs = content.find(pc_start_marker)
    pce = content.find(pc_end_marker, pcs)
    
    if pcs != -1 and pce != -1:
        content = content[:pcs + len(pc_start_marker)] + new_pages_html + content[pce:]

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Surgical structural re-balance complete.")

if __name__ == "__main__":
    main()
