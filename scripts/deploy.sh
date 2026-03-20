#!/bin/bash
set -e

# Must build from correct-case path to avoid React module duplication on Windows
cd /C/Code/marchmadness

echo "==> Cleaning previous build..."
rm -rf .next out

echo "==> Moving API routes out (incompatible with static export)..."
if [ -d src/app/api ]; then
  mv src/app/api src/app/_api_tmp
fi

echo "==> Building static site..."
STATIC_EXPORT=1 npx next build

echo "==> Restoring API routes..."
if [ -d src/app/_api_tmp ]; then
  mv src/app/_api_tmp src/app/api
fi

echo "==> Adding .nojekyll..."
touch out/.nojekyll

echo "==> Deploying to gh-pages..."
npx gh-pages -d out --dotfiles

echo "==> Done! Site will be live at https://dvarano.github.io/marchmadness/"
