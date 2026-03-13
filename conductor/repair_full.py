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

    # 1. Extract pieces
    
    # Head and initial layout
    head_end_marker = '<div class="app-shell">'
    head_idx = content.find(head_end_marker)
    head_part = content[:head_idx + len(head_end_marker)]
    
    # Title bar
    title_bar_marker = '<header class="title-bar">'
    title_bar_end_marker = '</header>'
    tb_start = content.find(title_bar_marker)
    tb_end = content.find(title_bar_end_marker, tb_start) + len(title_bar_end_marker)
    title_bar_part = content[tb_start:tb_end]
    
    # Left Panel
    lp_start_marker = '<div class="left-panel">'
    lp_start = content.find(lp_start_marker)
    lp_end_marker = '</aside>'
    lp_aside_end = content.find(lp_end_marker, lp_start) + len(lp_end_marker)
    lp_end = content.find('</div>', lp_aside_end) + len('</div>')
    left_panel_part = content[lp_start:lp_end]
    
    # Page Dashboard Content
    pd_start_marker = '<div class="page page-dashboard active">'
    pd_start = content.find(pd_start_marker)
    pd_end_marker = '</div> <!-- End page-dashboard -->'
    pd_end = content.find(pd_end_marker, pd_start)
    page_dashboard_inner = content[pd_start + len(pd_start_marker):pd_end]
    
    # Page Projects
    pp_start_marker = '<div class="page page-projects">'
    pp_start = content.find(pp_start_marker)
    pp_end = content.find('<div class="page page-wizard">', pp_start)
    page_projects_part = content[pp_start:pp_end]
    
    # Page Wizard
    pw_start_marker = '<div class="page page-wizard">'
    pw_start = content.find(pw_start_marker)
    pw_end = content.find('<div class="page page-orchestrator">', pw_start)
    page_wizard_part = content[pw_start:pw_end]
    
    # Page Orchestrator
    po_start_marker = '<div class="page page-orchestrator">'
    po_start = content.find(po_start_marker)
    po_end = content.find('<div class="page page-usage">', po_start)
    page_orchestrator_part = content[po_start:po_end]
    
    # Page Usage
    pus_start_marker = '<div class="page page-usage">'
    pus_start = content.find(pus_start_marker)
    pus_end = content.find('<div class="page page-settings">', pus_start)
    page_usage_part = content[pus_start:pus_end]
    
    # Page Settings
    ps_start_marker = '<div class="page page-settings">'
    ps_start = content.find(ps_start_marker)
    ps_end = content.find('</main>', ps_start)
    page_settings_part = content[ps_start:ps_end]
    
    # Chat Panel
    cp_start_marker = '<aside class="chat-panel'
    cp_start = content.find(cp_start_marker)
    cp_end = content.find('</aside>', cp_start) + len('</aside>')
    chat_panel_part = content[cp_start:cp_end]
    
    # Bottom Panel
    bp_start_marker = '<div class="bottom-panel'
    bp_start = content.find(bp_start_marker)
    # The original closing marker for the bottom panel area was likely a sequence of </div>s
    # In my reconstructed version, I'll provide a clean BP and then let assembly handle parent closures.
    # We find where it ends by looking for the status-bar
    sb_marker = '<footer class="status-bar">'
    sb_start = content.find(sb_marker)
    # The bottom panel ends before the status bar
    bp_end = content.rfind('</div>', bp_start, sb_start) + len('</div>')
    bottom_panel_part = content[bp_start:bp_end]
    
    # Status bar and Scripts
    footer_scripts_part = content[sb_start:]
    
    # Fix the </body> error in footer_scripts_part
    footer_scripts_part = footer_scripts_part.replace('Integration </body> Tests', 'Integration Tests')

    # Rebuild correctly!
    rebuilt = f"""{head_part}
      {title_bar_part}

      <div class="main-area">
        {left_panel_part}

        <div class="center-column">
          <div class="center-row">
            <div class="content-wrapper">
              <main class="primary-content">
                <div class="page page-dashboard active">
                  {page_dashboard_inner}
                </div>
                {page_projects_part}
                {page_wizard_part}
                {page_orchestrator_part}
                {page_usage_part}
                {page_settings_part}
              </main>
            </div>
            {chat_panel_part}
          </div>
          
          <div class="resizer-row" id="terminalResizer"></div>
          {bottom_panel_part}
        </div>
      </div>

      {footer_scripts_part}
"""

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(rebuilt)
    print("Dashboard structural repair complete.")

if __name__ == "__main__":
    main()
