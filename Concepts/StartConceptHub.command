#!/bin/zsh
set -u

concepts_dir=${0:A:h}
export PYTHONDONTWRITEBYTECODE=1
exec /usr/bin/python3 "$concepts_dir/ConceptHub/server.py"
