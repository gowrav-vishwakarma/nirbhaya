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
sed -i.bak 's/^#\(.*https:\/\/.*\)/\1/' .env && rm .env.bak
sed -i.bak 's/^\(API_BASE_URL=http:\/\/.*\)/#\1/' .env && rm .env.bak

# Checkout to master and merge develop
git checkout master
if [ $? -ne 0 ]; then
  echo "Error: Failed to checkout to master."
  exit 1
fi

git merge develop
if [ $? -ne 0 ]; then
  echo "Error: Failed to merge develop into master."
  exit 1
fi

# Remove dist folder
rm -rf dist

# Build PWA
npx quasar build -m pwa
if [ $? -ne 0 ]; then
  echo "Error: Failed to build PWA."
  exit 1
fi

# Initialize a new git repository in the dist folder
cd dist/pwa
git init
git remote add origin git@github.com:gowrav-vishwakarma/nirbhaya-pwa.git

# Add and commit the build
git add .
git commit -m "Release new PWA build"

# Force push to the repository
git push -f origin master
if [ $? -ne 0 ]; then
  echo "Error: Failed to push to the repository."
  exit 1
fi

cd ../..

# Checkout back to develop branch
git checkout develop

# Revert the changes in .env
sed -i.bak 's/^\(API_BASE_URL=https:\/\/.*\)/#\1/' .env && rm .env.bak
sed -i.bak 's/^#\(API_BASE_URL=http:\/\/.*\)/\1/' .env && rm .env.bak

echo "Release successful!"
