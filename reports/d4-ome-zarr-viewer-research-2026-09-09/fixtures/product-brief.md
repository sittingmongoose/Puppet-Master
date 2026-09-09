# Slide Scout product brief

Slide Scout is a small read-only desktop browser for local OME-Zarr 0.5 bioimaging filesets. Scientists should be able to find images within a fileset, inspect multiresolution images by channel, time point and plane, overlay associated label images, and read correctly calibrated coordinates. It should remain responsive while opening large saved datasets and clearly explain data it cannot display.

The current product boundary is local filesystem reading. Source files must remain unchanged. Image editing, export, remote services and clinical interpretation are outside this case. Research the format and actual reader implementations broadly enough to uncover compatibility, correctness, navigation and display requirements that a thin initial plan may miss. Distinguish established format obligations from optional capabilities and choices that need a product decision.
