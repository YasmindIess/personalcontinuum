param([Parameter(Mandatory=$true)][string]$RepoPath)
$ErrorActionPreference="Stop"
$Source=(Resolve-Path "$PSScriptRoot\..").Path
$Dest=(Resolve-Path $RepoPath).Path
Write-Host "Copying foundation into $Dest"
Get-ChildItem $Source -Force | Where-Object { $_.Name -notin @('.git','node_modules') } | ForEach-Object {
  Copy-Item $_.FullName -Destination $Dest -Recurse -Force
}
Set-Location $Dest
git status --short
Write-Host "Review, then commit on your chosen branch."
