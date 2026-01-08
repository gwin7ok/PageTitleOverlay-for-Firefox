Param(
    [Parameter(Mandatory=$true)][string]$SourceDir,
    [Parameter(Mandatory=$true)][string]$OutPath
)

Set-Location -LiteralPath $SourceDir
$exclude = @('build_xpi.bat','build_xpi.ps1','.git','.gitignore')
$files = Get-ChildItem -Recurse -File -Force | Where-Object { -not ($exclude -contains $_.Name) } | Select-Object -ExpandProperty FullName
if ($files) {
    $outExt = [IO.Path]::GetExtension($OutPath)
    if ($outExt -ieq '.zip') {
        $zipPath = $OutPath
    } else {
        $zipPath = [IO.Path]::ChangeExtension($OutPath, '.zip')
    }
    # Remove previous output files to avoid embedding them
    try {
        if (Test-Path -LiteralPath $OutPath) { Remove-Item -LiteralPath $OutPath -Force }
        if (Test-Path -LiteralPath $zipPath) { Remove-Item -LiteralPath $zipPath -Force }
        # also remove stray files like '#.zip' created by prior mis-invocations
        $hashZip = Join-Path -Path $SourceDir -ChildPath '#.zip'
        if (Test-Path -LiteralPath $hashZip) { Remove-Item -LiteralPath $hashZip -Force }
        # remove temporary extracted folder if present to avoid including stale files
        $tempDir = Join-Path -Path $SourceDir -ChildPath 'xpi_contents'
        if (Test-Path -LiteralPath $tempDir) { Remove-Item -LiteralPath $tempDir -Recurse -Force }
    } catch {
        Write-Host "Warning: could not remove previous artifacts: $($_.Exception.Message)"
    }
    try {
        # Use Compress-Archive with relative paths from the source directory so entries are rooted correctly
        $cwd = (Get-Location).ProviderPath

        # Exclude the eventual output file(s) so we don't embed the generated archive inside itself
        $outName = [IO.Path]::GetFileName($OutPath)
        $zipName = [IO.Path]::GetFileName($zipPath)
        if (-not ($exclude -contains $outName)) { $exclude += $outName }
        if (-not ($exclude -contains $zipName)) { $exclude += $zipName }

        $relPaths = @()
        foreach ($it in (Get-ChildItem -Recurse -File -Force | Where-Object { -not ($exclude -contains $_.Name) -and ($_.FullName -notmatch '\\xpi_contents\\') })) {
            $rel = $it.FullName.Substring($cwd.Length + 1)
            $relPaths += $rel
        }
        if ($relPaths.Count -eq 0) { Write-Error "No files to compress."; exit 1 }
        Compress-Archive -Path $relPaths -DestinationPath $zipPath -Force
    } catch {
        Write-Error "Compress-Archive failed: $($_.Exception.Message)"
        exit 1
    }

    if ($zipPath -ne $OutPath) {
        try {
            Move-Item -LiteralPath $zipPath -Destination $OutPath -Force
        } catch {
            Write-Error ("Failed to rename {0} to {1}: {2}" -f $zipPath, $OutPath, $_.Exception.Message)
            exit 1
        }
    }

    Write-Host "Created $OutPath"

} else {
    Write-Error "No files to compress."
    exit 1
}
