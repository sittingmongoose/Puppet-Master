const fs = require('fs');

let html = fs.readFileSync('Concepts/PuppetMasterDashComp.html', 'utf8');

const chatPanelMarker = '<aside class="chat-panel hidden" id="chatPanel">';
let parts = html.split(chatPanelMarker);

if (parts.length > 2) {
    console.log(`Found ${parts.length - 1} chat panels, keeping the first... wait, is the first one correct?`);
    // I should probably find the </aside> for each and remove them.
}
