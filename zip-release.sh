#!/bin/bash

# Check if version argument is provided
if [ -z "$1" ]; then
    echo "Error: Version number is required"
    echo "Usage: ./zip-release.sh <version>"
    echo "Example: ./zip-release.sh 0.0.221"
    exit 1
fi

VERSION=$1

# Check if we are on the develop branch
current_branch=$(git branch --show-current)
if [ "$current_branch" != "develop" ]; then
  echo "Error: You must be on the develop branch to release."
  exit 1
fi

# Check if the working directory is clean
# if [ -n "$(git status --porcelain)" ]; then
#   echo "Error: Your working directory is not clean. Please commit or stash your changes."
#   exit 1
# fi

# Update versions in package.json
sed -i.bak "s/\"version\": \".*\"/\"version\": \"$VERSION\"/" package.json && rm package.json.bak
sed -i.bak "s/\"iosVersion\": \".*\"/\"iosVersion\": \"$VERSION\"/" package.json && rm package.json.bak
sed -i.bak "s/\"androidVersion\": \".*\"/\"androidVersion\": \"$VERSION\"/" package.json && rm package.json.bak

# Uncomment the API_BASE_URL with https and comment the one with http
sed -i.bak 's/^\s*#\(.*https:\/\/.*\)/\1/' .env && rm .env.bak
sed -i.bak 's/^\s*\(API_BASE_URL=http:\/\/.*\)/#\1/' .env && rm .env.bak
sed -i.bak 's/^\s*SHOW_INSTALL_PROMPT=.*/SHOW_INSTALL_PROMPT=false/' .env && rm .env.bak
sed -i.bak 's/^\s*SHORTS_VISIBLE=.*/SHORTS_VISIBLE=false/' .env && rm .env.bak
# Disable ENABLE_ASTRO_APP
sed -i.bak 's/^\(ENABLE_ASTRO_APP=.*\)/ENABLE_ASTRO_APP=false/' .env && rm .env.bak

# Build the app for IOS
npx quasar build -m capacitor -T ios --ide
if [ $? -ne 0 ]; then
  echo "Error: Failed to build IOS app."
  exit 1
fi

# Generate zip bundle
cd src-capacitor
npx @capgo/cli bundle zip
if [ $? -ne 0 ]; then
  echo "Error: Failed to generate zip bundle."
  exit 1
fi
cd ..

# Revert the changes in .env
sed -i.bak 's/^\s*\(API_BASE_URL=https:\/\/.*\)/#\1/' .env && rm .env.bak
sed -i.bak 's/^\s*#\(API_BASE_URL=http:\/\/.*\)/\1/' .env && rm .env.bak
# Re-enable ENABLE_ASTRO_APP
sed -i.bak 's/^\(ENABLE_ASTRO_APP=.*\)/ENABLE_ASTRO_APP=true/' .env && rm .env.bak

echo "ZIP release successful! Version $VERSION has been built and bundled in src-capacitor/com.xavoc.shoutout_${VERSION}.zip"
