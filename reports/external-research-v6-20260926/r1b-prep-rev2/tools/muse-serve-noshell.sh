#!/bin/sh
# R1b: Muse MSP host with workspace shell execution disabled (available native restriction)
exec /home/sittingmongoose/.local/bin/muse-bin-1.4.0-R4161.1 "$@" --disable-shell
