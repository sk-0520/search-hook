#!/bin/bash -ue

echo "Release CI"

API_FILE=https://api.bitbucket.org/2.0/repositories/sk_0520/search-hook/downloads
API_TAG=https://api.bitbucket.org/2.0/repositories/sk_0520/search-hook/refs/tags
ARTIFACTS_DIR=artifacts

CURRENT_REVISION=$(git rev-parse HEAD)
CURRENT_VERSION=$(grep '"version"' package.json | sed -r 's/\s*"version"\s*:\s*"(.*)".*/\1/')

echo "revision: $CURRENT_REVISION"
echo "version: $CURRENT_VERSION"

# 転送用ファイルを準備
ARCHIVE_FILE=search-hook_"$CURRENT_VERSION".zip
echo "output file: $ARCHIVE_FILE"

git archive HEAD --worktree-attributes --output="./$ARTIFACTS_DIR/source.zip"
touch "./$ARTIFACTS_DIR/$CURRENT_REVISION"
zip -r "$ARCHIVE_FILE" "$ARTIFACTS_DIR"

# 転送！
curl --user $REPOSITORY_USER:$REPOSITORY_PASSWORD -X POST $API_FILE -F files=@"$ARCHIVE_FILE"

# タグ付け
TAG_JSON="{ \"name\": \"$CURRENT_VERSION\", \"target\": { \"hash\": \"$CURRENT_REVISION\" } }"
curl --user $REPOSITORY_USER:$REPOSITORY_PASSWORD -H "Content-Type: application/json" -X POST $API_TAG -d "$TAG_JSON"

