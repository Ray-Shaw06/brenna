Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Speech

$recognizerInfo = [System.Speech.Recognition.SpeechRecognitionEngine]::InstalledRecognizers() |
  Where-Object { $_.Culture.Name -eq "en-US" } |
  Select-Object -First 1

if (-not $recognizerInfo) {
  throw "No compatible speech recognizer was found. Install an English speech recognizer in Windows."
}

$engine = New-Object System.Speech.Recognition.SpeechRecognitionEngine($recognizerInfo)
$builder = New-Object System.Speech.Recognition.GrammarBuilder
$builder.Culture = $recognizerInfo.Culture
$builder.Append("I love you")
$grammar = New-Object System.Speech.Recognition.Grammar($builder)

$engine.LoadGrammar($grammar)
$engine.SetInputToDefaultAudioDevice()
$launcher = Join-Path $PSScriptRoot "launch-site.ps1"

Write-Host "Listening for the phrase: I love you"
Write-Host "Keep this window open. Press Ctrl+C to stop."

try {
  while ($true) {
    $result = $engine.Recognize()
    if ($null -eq $result) {
      continue
    }

    $heardText = $result.Text
    $confidence = [math]::Round($result.Confidence, 2)
    Write-Host ("Heard: '{0}' (confidence {1})" -f $heardText, $confidence)

    if ($heardText -eq "I love you") {
      & $launcher
      break
    }
  }
}
finally {
  $engine.Dispose()
}
