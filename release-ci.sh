#!/bin/bash -ue

echo "Release CI"

git archive HEAD --worktree-attributes --output=./artifacts/source.zip



