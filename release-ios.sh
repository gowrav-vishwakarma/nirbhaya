#!/bin/bash

# Check if we are on the develop branch
current_branch=$(git branch --show-current)
if [ "$current_branch" != "develop" ]; then
  echo "Error: You must be on the develop branch to release."
  exit 1
fi

# Check if the working directory is clean
if [ -n "$(git status --porcelain)" ]; then
  echo "Error: Your working directory is not clean. Please commit or stash your changes."
  exit 1
fi

# Uncomment the API_BASE_URL with https and comment the one with http
sed -i.bak 's/^\s*#\(.*https:\/\/.*\)/\1/' .env && rm .env.bak
sed -i.bak 's/^\s*\(API_BASE_URL=http:\/\/.*\)/#\1/' .env && rm .env.bak
sed -i.bak 's/^\s*SHOW_INSTALL_PROMPT=.*/SHOW_INSTALL_PROMPT=false/' .env && rm .env.bak


# Build the app for Android
# npx quasar build -m capacitor -T ios --ide
# if [ $? -ne 0 ]; then
#   echo "Error: Failed to build IOS app."
#   exit 1
# fi

# Revert the changes in .env
sed -i.bak 's/^\s*\(API_BASE_URL=https:\/\/.*\)/#\1/' .env && rm .env.bak
sed -i.bak 's/^\s*#\(API_BASE_URL=http:\/\/.*\)/\1/' .env && rm .env.bak

echo "IOS release successful!"
