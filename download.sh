#!/usr/bin/env bash

FILE="links.txt"
DIR="downloads"

#if [ ! -f "$FILE" ]; then
#  node index.js > "$FILE"
#fi


./node_modules/.bin/semver -r '>7.69.0' $(curl --version) 2> /dev/null

if [ $? -ne 0 ]; then
	echo "curl version is not supported"
	exit 1
fi

mkdir -p "$DIR"

cd "$DIR" && { xargs < "../$FILE" curl --show-error --silent --remote-name-all --retry 1 -L -J && cd -; }
