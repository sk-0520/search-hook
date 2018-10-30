#!/bin/bash -ue

echo "Release CI"

CURRENT_VERSION=$(git rev-parse HEAD)

echo $CURRENT_VERSION

git archive HEAD --worktree-attributes --output=./artifacts/source.zip
touch ./artifacts/$CURRENT_VERSION

