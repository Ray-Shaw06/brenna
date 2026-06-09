param(
  [string]$ProfileDirectory = "Default"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Get-ChromePath {
  $paths = @(
    (Join-Path $env:ProgramFiles "Google\\Chrome\\Application\\chrome.exe"),
    (Join-Path ${env:ProgramFiles(x86)} "Google\\Chrome\\Application\\chrome.exe"),
    (Join-Path $env:LOCALAPPDATA "Google\\Chrome\\Application\\chrome.exe")
  )

  $registryPath = Get-ItemProperty "HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\App Paths\\chrome.exe" -ErrorAction SilentlyContinue
  if ($null -ne $registryPath -and $registryPath.Path) {
    $paths = @((Join-Path $registryPath.Path "chrome.exe")) + $paths
  }

  foreach ($path in $paths | Select-Object -Unique) {
    if ($path -and (Test-Path $path)) {
      return $path
    }
  }

  throw "Chrome was not found. Install Chrome or update launch-site.ps1 with the correct path."
}

function Ensure-LocalServer {
  param(
    [int]$Port = 48765
  )

  $existingListener = Get-NetTCPConnection -LocalAddress "127.0.0.1" -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
  if (-not $existingListener) {
    $pythonPath = (Get-Command python -ErrorAction Stop).Source
    $arguments = @(
      "-m",
      "http.server",
      $Port,
      "--bind",
      "127.0.0.1",
      "--directory",
      $PSScriptRoot
    )

    Start-Process -FilePath $pythonPath -ArgumentList $arguments -WindowStyle Hidden

    $serverReady = $false
    for ($attempt = 0; $attempt -lt 24; $attempt += 1) {
      Start-Sleep -Milliseconds 250
      try {
        Invoke-WebRequest -UseBasicParsing "http://127.0.0.1:$Port/index.html" -TimeoutSec 2 | Out-Null
        $serverReady = $true
        break
      }
      catch {
      }
    }

    if (-not $serverReady) {
      throw "The local website server could not be started."
    }
  }

  $timestamp = [DateTimeOffset]::Now.ToUnixTimeMilliseconds()
  return "http://127.0.0.1:$Port/index.html?v=$timestamp"
}

$chromePath = Get-ChromePath
$sitePath = Join-Path $PSScriptRoot "index.html"
if (-not (Test-Path $sitePath)) {
  throw "Could not find index.html at $sitePath"
}

$siteUrl = Ensure-LocalServer
$arguments = @(
  "--profile-directory=$ProfileDirectory",
  "--new-window",
  "--kiosk",
  "--start-fullscreen",
  "--autoplay-policy=no-user-gesture-required",
  $siteUrl
)

$chromeProcess = Start-Process -FilePath $chromePath -ArgumentList $arguments -PassThru

Add-Type -AssemblyName Microsoft.VisualBasic
Add-Type -AssemblyName System.Windows.Forms

Start-Sleep -Milliseconds 2600
[Microsoft.VisualBasic.Interaction]::AppActivate($chromeProcess.Id) | Out-Null
Start-Sleep -Milliseconds 250
[System.Windows.Forms.SendKeys]::SendWait("{ENTER}")
