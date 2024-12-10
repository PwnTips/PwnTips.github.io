$ErrorActionPreference = "Stop"
$PSNativeCommandUseErrorActionPreference = $true
$env:JEKYLL_ENV='production'
bundle exec jekyll build
git checkout master
cp -r -Force _site/* .
rm -r -Force _site/
touch .nojekyll
git add .
git commit -m 'publish new post'
