Param()
$src = Get-Location
$dist = Join-Path $src 'dist'
if (-not (Test-Path $dist)) { New-Item -ItemType Directory -Path $dist | Out-Null }

$keep = @('build_xpi.bat', 'build_xpi.ps1', 'init_git.bat', 'init_git.ps1', '.git', '.gitignore', 'extension.xpi')
$move = @('manifest.json', 'content_script.js', 'style.css', 'icon48.png', 'icon.svg', 'options.html', 'options.js', 'options.css', 'background.js', 'README.md')

foreach ($f in $move) {
    $p = Join-Path $src $f
    if (Test-Path $p) {
        Move-Item -LiteralPath $p -Destination $dist -Force
        Write-Host "Moved $f -> dist"
    }
    else { Write-Host "Not found: $f" }
}

Write-Host 'Files moved to dist.'
