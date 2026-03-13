import re
import sys

def main():
    file_path = "Concepts/PuppetMasterDashComp.html"
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
    except FileNotFoundError:
        print(f"Error: {file_path} not found.")
        sys.exit(1)

    def get_inner(start_marker, end_marker):
        s = content.find(start_marker)
        if s == -1: return ""
        s_inner = content.find('>', s) + 1
        e = content.find(end_marker, s_inner)
        if e == -1: return ""
        inner = content[s_inner:e].strip()
        # Remove any leading junk like ' active">'
        inner = re.sub(r'^[^<]*>', '', inner).strip()
        # Remove trailing </div> tags that might be duplicates
        # We'll just take up to the last real component closure
        return inner

    # 1. Page Content Extraction
    # We must be extremely careful not to include the page wrapper tags
    pd_inner = get_inner('<div class="page page-dashboard', '<div class="page page-projects">')
    # Cleanup pd_inner: remove any stray closures
    pd_inner = pd_inner.split('</div> <!-- End page-dashboard -->')[0].split('</div> <!-- Fixed closure')[0].strip()
    
    pp_inner = get_inner('<div class="page page-projects">', '<div class="page page-wizard">')
    pw_inner = get_inner('<div class="page page-wizard">', '<div class="page page-orchestrator">')
    po_inner = get_inner('<div class="page page-orchestrator">', '<div class="page page-usage">')
    pus_inner = get_inner('<div class="page page-usage">', '<div class="page page-settings">')
    ps_inner = get_inner('<div class="page page-settings">', '</main>')

    # 2. Main Area Rebuild
    # Find start of main area
    main_area_start = content.find('<div class="main-area">')
    head_part = content[:main_area_start]
    
    # Extract left panel
    lp_start = content.find('<div class="left-panel">')
    lp_end = content.find('</aside>', lp_start) + 8
    lp_end = content.find('</div>', lp_end) + 6
    left_panel = content[lp_start:lp_end]
    
    # Extract chat and bottom
    cp_start = content.find('<aside class="chat-panel')
    cp_end = content.find('</aside>', cp_start) + 8
    chat_panel = content[cp_start:cp_end]
    
    bp_start = content.find('<div class="bottom-panel')
    sb_start = content.find('<footer class="status-bar">')
    bp_end = content.rfind('</div>', bp_start, sb_start) + 6
    bottom_panel = content[bp_start:bp_end]
    
    footer_part = content[sb_start:]

    # 3. Assemble correctly
    rebuilt = f"""{head_part}<div class="main-area">
      {left_panel}

      <div class="center-column">
        <div class="center-row">
          <div class="content-wrapper">
            <main class="primary-content">
              <div class="page page-dashboard active">
                {pd_inner}
              </div>
              <div class="page page-projects">
                {pp_inner}
              </div>
              <div class="page page-wizard">
                {pw_inner}
              </div>
              <div class="page page-orchestrator">
                {po_inner}
              </div>
              <div class="page page-usage">
                {pus_inner}
              </div>
              <div class="page page-settings">
                {ps_inner}
              </div>
            </main>
          </div>
          <div class="resizer-col hidden" id="chatResizer"></div>
          {chat_panel}
        </div>
        
        <div class="resizer-row" id="terminalResizer"></div>
        {bottom_panel}
      </div>
    </div>

    {footer_part}"""

    # Final sanity check: fix any remaining stray active"> or similar
    rebuilt = rebuilt.replace(' active">', '>', 1) 
    
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(rebuilt)
    print("Master structure reset complete.")

if __name__ == "__main__":
    main()
