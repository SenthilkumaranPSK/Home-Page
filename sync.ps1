# SK Home — keeps the Chrome extension and the service-worker cache name in
# sync with the root page. Run after editing any of the shell files below.
#
#   sync.bat          sync everything
#   sync.bat --check  report what's out of sync, change nothing (exit 1 if stale)

param([switch]$Check)

Set-Location -Path $PSScriptRoot
$stale = $false

$shellFiles = @("index.html", "styles.css", "config.js", "cosmos.js", "live.js", "app.js", "manifest.webmanifest")

# ---- 1. sw.js cache name, derived from the shell files' content ----------
# (replaces manually bumping CACHE — it's now impossible to forget)
# \r is stripped so CRLF vs LF checkouts (core.autocrlf) never change the hash
$sha256 = [System.Security.Cryptography.SHA256]::Create()
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$bytes = New-Object System.Collections.Generic.List[byte]
foreach ($f in $shellFiles) {
  $text = [System.IO.File]::ReadAllText($f) -replace "`r", ""
  $bytes.AddRange([byte[]]$utf8NoBom.GetBytes($text))
}
$hashHex = -join ($sha256.ComputeHash($bytes.ToArray()) | ForEach-Object { $_.ToString("x2") })
$wantCache = "sk-home-$($hashHex.Substring(0,10))"

$swContent = Get-Content sw.js -Raw
$haveCache = ""
if ($swContent -match 'const CACHE = "([^"]*)"') { $haveCache = $Matches[1] }

if ($wantCache -ne $haveCache) {
  if ($Check) {
    Write-Host "stale: sw.js CACHE is `"$haveCache`", should be `"$wantCache`""
    $stale = $true
  } else {
    $swContent = $swContent -replace 'const CACHE = "[^"]*"', "const CACHE = `"$wantCache`""
    Set-Content -Path sw.js -Value $swContent -Encoding UTF8 -NoNewline
    Write-Host "sw.js cache bumped -> $wantCache"
  }
}

# ---- 2. extension/ copy ---------------------------------------------------
# newtab.html = index.html without the PWA-only tags
#   (the web manifest and apple-touch-icon mean nothing inside an extension)
$expectedNewtab = (Get-Content 'index.html') |
  Where-Object { $_ -notmatch 'manifest\.webmanifest' -and $_ -notmatch 'apple-touch-icon' } |
  ForEach-Object { $_ -replace 'data-page="web"', 'data-page="ext"' }

if ($Check) {
  foreach ($f in @("styles.css", "app.js", "config.js", "cosmos.js", "live.js")) {
    $a = Get-Content $f -Raw -ErrorAction SilentlyContinue
    $b = Get-Content "extension\$f" -Raw -ErrorAction SilentlyContinue
    if ($a -ne $b) { Write-Host "stale: extension\$f differs from $f"; $stale = $true }
  }

  $favA = Get-Content 'assets\favicon.svg' -Raw -ErrorAction SilentlyContinue
  $favB = Get-Content 'extension\assets\favicon.svg' -Raw -ErrorAction SilentlyContinue
  if ($favA -ne $favB) { Write-Host "stale: extension\assets\favicon.svg differs from assets\favicon.svg"; $stale = $true }

  $newtabB = Get-Content 'extension\newtab.html' -ErrorAction SilentlyContinue
  if (($expectedNewtab -join "`n") -ne ($newtabB -join "`n")) {
    Write-Host "stale: extension\newtab.html is out of date with index.html"
    $stale = $true
  }

  if ($stale) { Write-Host "Run sync.bat to fix."; exit 1 }
  Write-Host "extension\ and sw.js are in sync."
  exit 0
}

New-Item -ItemType Directory -Force -Path extension\assets | Out-Null
Set-Content -Path 'extension\newtab.html' -Value $expectedNewtab -Encoding UTF8

Copy-Item styles.css, app.js, config.js, cosmos.js, live.js -Destination extension\ -Force
Copy-Item assets\favicon.svg -Destination extension\assets\ -Force

Write-Host "Synced -> extension\  (reload it at chrome://extensions)"
