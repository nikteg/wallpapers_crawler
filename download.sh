#!/usr/bin/env bash

FILE="links.txt"
DIR="downloads"

#if [ ! -f "$FILE" ]; then
#  node index.js > "$FILE"
#fi

mkdir -p "$DIR"

cd "$DIR" && { xargs < "../$FILE" curl -v --show-error --fail-early --retry 10 --retry-connrefused -L -J -O && cd -; }