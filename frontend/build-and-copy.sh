#!/bin/bash
# Build the frontend and copy output to Spring Boot static resources directory.
# Usage: ./build-and-copy.sh
cd "$(dirname "$0")"
npm run build
rm -rf ../src/main/resources/static
cp -r dist ../src/main/resources/static
