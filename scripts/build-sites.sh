#!/usr/bin/env sh
set -eu

project_dir=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
build_dir="$project_dir/dist"

rm -rf "$build_dir"
mkdir -p "$build_dir/client" "$build_dir/server"

cp "$project_dir"/*.html "$build_dir/client/"
cp "$project_dir/robots.txt" "$project_dir/sitemap.xml" "$build_dir/client/"
cp -R "$project_dir/assets" "$project_dir/img" "$project_dir/solutions" "$build_dir/client/"
cp "$project_dir/sites-worker.js" "$build_dir/server/index.js"

find "$build_dir" -name ".DS_Store" -delete
