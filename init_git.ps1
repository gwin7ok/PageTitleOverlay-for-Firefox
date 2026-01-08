# PowerShell: Initialize git repo and make initial commit
Param()
$cwd = Get-Location
if (-not (Test-Path -Path .git)) {
    git init | Out-Null
} else {
    Write-Host '.git already exists'
}

# ensure branch main
try { git branch -M main } catch {}

git add --all
try {
    git commit -m "Initial commit: recreate repository after .git loss"
} catch {
    Write-Host 'Nothing to commit or commit failed.'
}
Write-Host 'Repository initialized. Run "git status" to verify.'
Pause
