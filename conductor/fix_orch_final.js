const fs = require('fs');

let content = fs.readFileSync('Concepts/PuppetMasterDashComp.html', 'utf8');

const startStr = '                    <span class="status-badge">Idle</span>';
const endStr = '              <div class="orch-tab-content" data-tab="tiers">';

const idx1 = content.indexOf(startStr);
const idx2 = content.indexOf(endStr);

if (idx1 !== -1 && idx2 !== -1 && idx1 < idx2) {
    const newContent = content.substring(0, idx1) + content.substring(idx2);
    fs.writeFileSync('Concepts/PuppetMasterDashComp.html', newContent, 'utf8');
    console.log("Garbage removed successfully.");
} else {
    console.log("Could not find bounds.");
}
