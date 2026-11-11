// Check files in this folder run with the PuppetMaster browser-check kit's own config (how the page is opened, the
// looks, the widths), against the page this concept builds:
//   python3 tools/build_standalone.py <out>
//   browser-check run Concepts/settings-managers/fable-5.2/tools --set page=<out>/settings-managers-app.html
export { default, LOOKS, WIDTHS } from '../../../pm7-tools/browser-check/browser-check.config.mjs';
