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

    # Clean the file from any junk after </html> first
    if "</html>" in content:
        content = content[:content.find("</html>") + 7]

    # Extract Title Bar and Head
    tb_start = content.find('<header class="title-bar">')
    head_part = content[:tb_start]
    tb_end = content.find('</header>', tb_start) + 9
    title_bar = content[tb_start:tb_end]
    
    # Extract Left Panel
    lp_start = content.find('<div class="left-panel">')
    lp_aside_end = content.find('</aside>', lp_start) + 8
    lp_end = content.find('</div>', lp_aside_end) + 6
    left_panel = content[lp_start:lp_end]
    
    # Re-verify left_panel closures
    # We want exactly one <div class="left-panel"> and one closing </div>
    # and exactly one <aside class="side-panel-slot"> and one </aside>
    
    def extract_inner(start_marker, end_marker, start_search=0):
        s = content.find(start_marker, start_search)
        if s == -1: return "", start_search
        e = content.find(end_marker, s)
        if e == -1: return "", s
        inner = content[s + len(start_marker):e].strip()
        # Remove trailing </div> tags from inner content to avoid premature closure
        while inner.endswith('</div>'):
            inner = inner[:-6].strip()
        return inner, e + len(end_marker)

    # Extract Page Contents
    # We use very specific markers to find the real content
    pd_inner, next_pos = extract_inner('<div class="page page-dashboard active">', '<div class="page page-projects">')
    pp_inner, next_pos = extract_inner('<div class="page page-projects">', '<div class="page page-wizard">')
    pw_inner, next_pos = extract_inner('<div class="page page-wizard">', '<div class="page page-orchestrator">')
    po_inner, next_pos = extract_inner('<div class="page page-orchestrator">', '<div class="page page-usage">')
    pus_inner, next_pos = extract_inner('<div class="page page-usage">', '<div class="page page-settings">')
    ps_inner, next_pos = extract_inner('<div class="page page-settings">', '</main>')
    
    # Extract Chat Panel
    cp_start = content.find('<aside class="chat-panel')
    cp_end = content.find('</aside>', cp_start) + 8
    chat_panel = content[cp_start:cp_end]
    
    # Extract Bottom Panel
    bp_start = content.find('<div class="bottom-panel')
    sb_start = content.find('<footer class="status-bar">')
    bp_end = content.rfind('</div>', bp_start, sb_start) + 6
    bottom_panel = content[bp_start:bp_end]
    
    # Scripts part (from end of bottom panel to end of file)
    # We already have the footer_part from sb_start
    footer_part = content[sb_start:]
    
    # Fix the </body> error
    footer_part = footer_part.replace('Integration </body> Tests', 'Integration Tests')

    # Re-assemble using a RIGID structure
    rebuilt = f"""{head_part}{title_bar}

    <div class="main-area">
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

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(rebuilt)
    print("Dashboard structural repair (HARD RESET) complete.")

if __name__ == "__main__":
    main()
