# Slide Scout — initial viewer plan

This is a deliberately thin synthetic planning fixture for a research-workflow evaluation, not a Puppet Master feature or a specification-completeness claim.

The desktop application opens a local OME-Zarr 0.5 fileset and lists the images it finds. Selecting an image opens a canvas with pan and zoom, channel visibility controls, time-point and plane selection where relevant, and optional overlays for associated label images. A details panel shows dimensions, units and coordinates. The viewer chooses an available pyramid level appropriate for the current view.

Large image reads run in the background so navigation remains responsive. Changing the selected view cancels work that is no longer needed. Opening failures explain which image or data could not be displayed and allow the user to choose another item.

The initial implementation should interoperate with filesets from real OME-Zarr 0.5 tools. Source files remain unchanged; display settings are local to the viewing session. Image editing, export, remote storage and automated scientific or clinical interpretation are outside this plan. Additional capability choices require explicit review.

Acceptance uses representative filesets to check image discovery, navigation, channel and plane controls, calibrated coordinate display and aligned label overlays. A large dataset must not freeze interaction. Malformed or unavailable input must produce understandable feedback rather than a crash.
