@echo off
rem Initialize a new git repository and make initial commit.
rem Run this in: g:\Cursor_Folder\waterfox-title-extension
setlocal
if not exist .git (
  git init
) else (
  echo .git already exists
)










pauseendlocalecho Repository initialized. Run "git status" to verify.)  echo Nothing to commit or commit failed.git add --all
ngit commit -m "Initial commit: recreate repository after .git loss" || (
nrem add files and commitgit branch -M main 2>nul || echo could not rename branchnrem set default branch to main