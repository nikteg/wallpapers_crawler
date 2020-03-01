#!/usr/bin/env bash

# node index.js > links.txt

wget \
  --tries=0 \
  --retry-connrefused \
  --continue \
  --progress=bar \
  --show-progress \
  --random-wait \
  --background \
  -i links.txt