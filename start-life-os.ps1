# ============================================================
#  LIFE OS - local launcher
#  Serves the life-os folder on localhost, proxies the AI Chef
#  to the local FreeLLMAPI router, and opens an app window.
#
#  Usage:   .\start-life-os.ps1
#           .\start-life-os.ps1 -Port 4190 -NoBrowser
#           .\start-life-os.ps1 -Model claude-opus-4-5
# ============================================================
[CmdletBinding()]
param(
  [int]$Port = 4190,
  [switch]$NoBrowser,
  [string]$Model = "",
  [switch]$Lan
)

$ErrorActionPreference = 'Stop'
$Root = Join-Path $PSScriptRoot 'life-os'
if (-not (Test-Path (Join-Path $Root 'index.html'))) {
  throw "Could not find life-os\index.html next to this script. Keep start-life-os.ps1 in the project root."
}

$RouterBase = 'http://127.0.0.1:31415'
$RouterKey  = 'freellmapi-ccfa1895a34c03ddb479862dbc9a4fe545e8df598cd68844'
$ModelChain = if ($Model) { @($Model) } else { @('claude-haiku-4-5', 'claude-opus-4-5', 'nemotron-3-ultra-550b') }

$Mime = @{
  '.html' = 'text/html; charset=utf-8'
  '.css'  = 'text/css; charset=utf-8'
  '.js'   = 'application/javascript; charset=utf-8'
  '.json' = 'application/json; charset=utf-8'
  '.webmanifest' = 'application/manifest+json; charset=utf-8'
  '.svg'  = 'image/svg+xml'
  '.png'  = 'image/png'
  '.jpg'  = 'image/jpeg'
  '.jpeg' = 'image/jpeg'
  '.webp' = 'image/webp'
  '.ico'  = 'image/x-icon'
  '.woff' = 'font/woff'
  '.woff2'= 'font/woff2'
  '.txt'  = 'text/plain; charset=utf-8'
  '.map'  = 'application/json; charset=utf-8'
}

function Write-Banner([string]$url) {
  Write-Host ''
  Write-Host '  +--------------------------------------------------+' -ForegroundColor DarkGray
  Write-Host '  |  LIFE OS' -ForegroundColor Green -NoNewline
  Write-Host '  focus / fuel / train / study            |' -ForegroundColor DarkGray
  Write-Host '  +--------------------------------------------------+' -ForegroundColor DarkGray
  Write-Host ("  |  {0,-46}  |" -f $url) -ForegroundColor Cyan
  Write-Host  '  |  AI Chef -> local router (best model, failover)  |' -ForegroundColor DarkGray
  Write-Host  '  |  Ctrl+C to stop                                  |' -ForegroundColor DarkGray
  Write-Host '  +--------------------------------------------------+' -ForegroundColor DarkGray
  Write-Host ''
}

function Get-FreePort([int]$start) {
  for ($p = $start; $p -lt ($start + 80); $p++) {
    $busy = $false
    try {
      $l = New-Object System.Net.Sockets.TcpListener ([System.Net.IPAddress]::Loopback), $p
      $l.Start(); $l.Stop()
    } catch { $busy = $true }
    if (-not $busy) { return $p }
  }
  throw "No free port found between $start and $($start + 79)."
}

function Read-Request($stream) {
  $reader = New-Object System.IO.StreamReader($stream, [System.Text.Encoding]::UTF8, $false, 4096, $true)
  $requestLine = $reader.ReadLine()
  if ([string]::IsNullOrWhiteSpace($requestLine)) { return $null }
  $parts = $requestLine.Split(' ')
  if ($parts.Count -lt 2) { return $null }
  $headers = @{}
  while ($true) {
    $line = $reader.ReadLine()
    if ($null -eq $line -or $line -eq '') { break }
    $idx = $line.IndexOf(':')
    if ($idx -gt 0) { $headers[$line.Substring(0, $idx).Trim().ToLower()] = $line.Substring($idx + 1).Trim() }
  }
  $body = ''
  if ($headers.ContainsKey('content-length')) {
    $len = [int]$headers['content-length']
    if ($len -gt 0) {
      $buf = New-Object char[] $len
      $read = 0
      while ($read -lt $len) {
        $n = $reader.Read($buf, $read, $len - $read)
        if ($n -le 0) { break }
        $read += $n
      }
      $body = -join $buf[0..([Math]::Max(0, $read - 1))]
      if ($read -eq 0) { $body = '' }
    }
  }
  return [pscustomobject]@{ Method = $parts[0]; Target = $parts[1]; Headers = $headers; Body = $body }
}

function Send-Response($stream, [int]$status, [string]$reason, [string]$type, [byte[]]$bytes, [hashtable]$extra) {
  $head = "HTTP/1.1 $status $reason`r`nContent-Type: $type`r`nContent-Length: $($bytes.Length)`r`nCache-Control: no-store`r`nConnection: close`r`nX-Content-Type-Options: nosniff`r`n"
  if ($extra) { foreach ($k in $extra.Keys) { $head += "$k`: $($extra[$k])`r`n" } }
  $head += "`r`n"
  $hb = [System.Text.Encoding]::ASCII.GetBytes($head)
  $stream.Write($hb, 0, $hb.Length)
  if ($bytes.Length -gt 0) { $stream.Write($bytes, 0, $bytes.Length) }
  $stream.Flush()
}

function Send-Text($stream, [int]$status, [string]$reason, [string]$text, [string]$type = 'text/plain; charset=utf-8') {
  Send-Response $stream $status $reason $type ([System.Text.Encoding]::UTF8.GetBytes($text)) $null
}

# ------------------------------------------------------------
#  AI Chef
# ------------------------------------------------------------
function Get-ChefPayload($request) {
  try { return $request.Body | ConvertFrom-Json } catch { return $null }
}

function Invoke-ChefModel([string]$alias, [string]$prompt) {
  $body = @{
    model = $alias
    messages = @(
      @{ role = 'system'; content = 'You are the AI Chef inside Life OS, a nutrition app. You answer with strict JSON and nothing else.' },
      @{ role = 'user'; content = $prompt }
    )
    temperature = 0.2
    max_tokens = 8000
  } | ConvertTo-Json -Depth 6 -Compress

  $headers = @{ Authorization = "Bearer $RouterKey"; 'Content-Type' = 'application/json' }
  Write-Host ("  chef: calling {0}..." -f $alias) -ForegroundColor DarkCyan
  $sw = [Diagnostics.Stopwatch]::StartNew()
  try {
    $res = Invoke-RestMethod -Uri "$RouterBase/v1/chat/completions" -Method Post -Headers $headers -Body $body -TimeoutSec 60 -ErrorAction Stop
  } finally {
    $sw.Stop()
    Write-Host ("  chef: {0} returned after {1:N1}s" -f $alias, $sw.Elapsed.TotalSeconds) -ForegroundColor DarkCyan
  }
  return [string]$res.choices[0].message.content
}

function Convert-ChefJson([string]$text) {
  if ([string]::IsNullOrWhiteSpace($text)) { return $null }
  $clean = $text.Trim()
  $clean = [regex]::Replace($clean, '^```[a-zA-Z]*\s*', '')
  $clean = [regex]::Replace($clean, '\s*```$', '')
  $start = $clean.IndexOf('{')
  $end = $clean.LastIndexOf('}')
  if ($start -ge 0 -and $end -gt $start) { $clean = $clean.Substring($start, $end - $start + 1) }
  try {
    $obj = $clean | ConvertFrom-Json
    $items = @()
    if ($obj.suggestions) { $items = @($obj.suggestions) }
    elseif ($obj.meals) { $items = @($obj.meals) }
    elseif ($obj -is [array]) { $items = @($obj) }
    $out = @()
    foreach ($s in $items) {
      if (-not $s) { continue }
      $name = ([string]$s.name).Trim()
      $why = ([string]$s.why).Trim()
      if ([string]::IsNullOrWhiteSpace($name) -or $name.Length -lt 3) { continue }
      if ($name -match '^(\.+|name|meal|suggestion)$' -or $name -match '\.\.\.') { continue }
      if ([string]::IsNullOrWhiteSpace($why) -or $why -match 'one short sentence|short sentence tying|example') { continue }
      if ([int]$s.kcal -lt 120) { continue }
      $ings = @()
      if ($s.ingredients) { $ings = @($s.ingredients) }
      $ingOut = @()
      foreach ($i in $ings) {
        if (-not $i) { continue }
        $nm = [string]$i.name
        if ([string]::IsNullOrWhiteSpace($nm)) { continue }
        $ingOut += [pscustomobject]@{ name = $nm; grams = [int]([double]($i.grams)) }
      }
      $out += [pscustomobject]@{
        name = $name
        kcal = [int]([double]($s.kcal) )
        p = [int]([double]($s.p))
        c = [int]([double]($s.c))
        f = [int]([double]($s.f))
        fib = [int]([double]($s.fib))
        why = [string]$s.why
        ingredients = @($ingOut)
      }
      if ($out.Count -ge 3) { break }
    }
    if ($out.Count -eq 0) { return $null }
    return $out
  } catch { return $null }
}

function Invoke-Chef($request) {
  $data = Get-ChefPayload $request
  if (-not $data) { return $null }

  $rem = $data.remaining
  $goals = $data.goals
  $profile = $data.profile
  $chef = $data.chef
  $perMeal = $data.perMeal
  $recent = @()
  if ($data.recent) { $recent = @($data.recent) }

  $diet = if ($chef -and $chef.diet) { [string]$chef.diet } elseif ($profile.diet) { [string]$profile.diet } else { 'omnivore' }
  $cuisine = if ($chef -and $chef.cuisine) { [string]$chef.cuisine } elseif ($profile.cuisine) { [string]$profile.cuisine } else { 'any' }
  $pantry = if ($chef -and $chef.pantry) { ([string]$chef.pantry).Trim().Substring(0, [Math]::Min(160, ([string]$chef.pantry).Trim().Length)) } else { '' }
  $dislikes = if ($chef -and $chef.dislikes) { ([string]$chef.dislikes).Trim().Substring(0, [Math]::Min(120, ([string]$chef.dislikes).Trim().Length)) } else { '' }

  $dietRule = switch ($diet) {
    'vegan'       { 'STRICTLY VEGAN: no meat, fish, eggs, dairy, honey or ghee.' }
    'vegetarian'  { 'VEGETARIAN: no meat, fish or eggs. Dairy is allowed.' }
    'eggetarian'  { 'VEGETARIAN PLUS EGGS: no meat or fish. Eggs and dairy are allowed.' }
    'pescatarian' { 'PESCATARIAN: no meat. Fish and seafood are allowed.' }
    default       { 'OMNIVORE: any protein is fine.' }
  }
  $cuisineRule = if ($cuisine -and $cuisine -ne 'any') { "Cuisine: $cuisine — every suggestion should fit this style." } else { 'Cuisine: any style the person can cook.' }
  $pantryRule = if ($pantry) { "Ingredients they actually have: $pantry. Build the meals mostly from these and common staples (rice, oil, onion, tomato, salt, spices)." } else { 'No pantry list given, so use common student staples.' }
  $avoidRule = if ($dislikes) { "Never use these: $dislikes." } else { 'No ingredients to avoid.' }
  $perMealKcal = if ($perMeal -and $perMeal.kcal) { [int]$perMeal.kcal } else { 500 }

  $prompt = @"
Suggest exactly 3 real meals for this person today. Each meal should be roughly $perMealKcal kcal (their per-meal target) and cookable with what they have. For EACH meal, list the ingredients with gram amounts so the macros can be verified, and make the macros consistent with those grams (use standard per-100g values).

Person: age $($profile.age), $($profile.sex), $($profile.height) cm, $($profile.weight) kg, goal $($profile.goal).
Diet: $dietRule
$cuisineRule
$pantryRule
$avoidRule
Remaining today: $([int]$rem.kcal) kcal, $([int]$rem.p) g protein, $([int]$rem.c) g carbs, $([int]$rem.f) g fat, $([int]$rem.fib) g fibre.
Already eaten: $(if ($recent.Count) { $recent -join ', ' } else { 'nothing yet' }).

Rules: real, specific food names, never placeholders or dots; no supplements as meals; 200-700 kcal each; macros consistent (p*4 + c*4 + f*9 within 12 percent of kcal); each why is one concrete sentence about the remaining protein, carbs or calories AND mentions the diet fit.

Each suggestion MUST include an "ingredients" array of objects {"name":"...","grams":120}. Use the pantry items where possible and realistic gram amounts.

Finish your reply with the JSON object {"suggestions":[{"name":"Grilled chicken rice bowl","kcal":520,"p":45,"c":55,"f":12,"fib":5,"why":"Covers 45 g of your 111 g protein gap with room for dinner.","ingredients":[{"name":"chicken breast","grams":150},{"name":"cooked rice","grams":180},{"name":"yoghurt","grams":80}]}}]} and nothing after it.
"@

  $attempt = 0
  foreach ($alias in $ModelChain) {
    $attempt++
    if ($attempt -gt 2) { break }
    try {
      $text = Invoke-ChefModel $alias $prompt
      $parsed = Convert-ChefJson $text
      if ($parsed) {
        return [pscustomobject]@{ suggestions = @($parsed); model = $alias; source = 'router' }
      }
    } catch {
      Write-Host ("  chef: {0} unavailable ({1})" -f $alias, $_.Exception.Message) -ForegroundColor DarkYellow
    }
  }
  return $null
}

# ------------------------------------------------------------
#  Static files
# ------------------------------------------------------------
function Resolve-File([string]$target) {
  $path = $target.Split('?')[0]
  try { $path = [System.Uri]::UnescapeDataString($path) } catch { }
  if ($path -eq '/' -or $path -eq '') { $path = '/index.html' }
  $rel = $path.TrimStart('/').Replace('/', [System.IO.Path]::DirectorySeparatorChar)
  $full = [System.IO.Path]::GetFullPath((Join-Path $Root $rel))
  $rootFull = [System.IO.Path]::GetFullPath($Root)
  if (-not $full.StartsWith($rootFull, [System.StringComparison]::OrdinalIgnoreCase)) { return $null }
  if (Test-Path $full -PathType Container) { $full = Join-Path $full 'index.html' }
  if (-not (Test-Path $full -PathType Leaf)) {
    if ([System.IO.Path]::GetExtension($full) -eq '') { $full = Join-Path $Root 'index.html' }
  }
  if (Test-Path $full -PathType Leaf) { return $full }
  return $null
}

function Handle-Client($client) {
  try { $client.ReceiveTimeout = 5000; $client.SendTimeout = 90000 } catch { }
  $stream = $client.GetStream()
  try {
    $req = $null
    try { $req = Read-Request $stream } catch { $req = $null }
    if (-not $req) { return }
    $target = $req.Target

    if ($req.Method -eq 'OPTIONS') {
      Send-Response $stream 204 'No Content' 'text/plain' ([byte[]]@()) @{ 'Access-Control-Allow-Origin' = '*' }
      return
    }

    if ($req.Method -eq 'POST' -and $target -like '/api/chef*') {
      Write-Host '  chef: ranking meals...' -ForegroundColor DarkCyan
      $result = Invoke-Chef $req
      if (-not $result) {
        Send-Text $stream 503 'Service Unavailable' '{"error":"chef offline","suggestions":[]}' 'application/json; charset=utf-8'
        return
      }
      $json = $result | ConvertTo-Json -Depth 5 -Compress
      Write-Host ("  chef: {0} suggestions via {1}" -f $result.suggestions.Count, $result.model) -ForegroundColor Green
      Send-Text $stream 200 'OK' $json 'application/json; charset=utf-8'
      return
    }

    if ($target -like '/api/health*') {
      Send-Text $stream 200 'OK' ('{"ok":true,"models":["' + ($ModelChain -join '","') + '"]}') 'application/json; charset=utf-8'
      return
    }

    if ($req.Method -ne 'GET' -and $req.Method -ne 'HEAD') {
      Send-Text $stream 405 'Method Not Allowed' 'Method not allowed'
      return
    }

    $file = Resolve-File $target
    if (-not $file) {
      Send-Text $stream 404 'Not Found' 'Not found'
      return
    }

    $ext = [System.IO.Path]::GetExtension($file).ToLowerInvariant()
    $type = if ($Mime.ContainsKey($ext)) { $Mime[$ext] } else { 'application/octet-stream' }
    $bytes = [System.IO.File]::ReadAllBytes($file)
    Send-Response $stream 200 'OK' $type $bytes $null
  } catch {
    try { Send-Text $stream 500 'Internal Server Error' 'Server error' } catch { }
  } finally {
    try { $stream.Dispose() } catch { }
    try { $client.Close() } catch { }
  }
}

# ------------------------------------------------------------
#  Launch
# ------------------------------------------------------------
function Start-Browser([string]$url) {
  $candidates = @(
    (Join-Path ${env:ProgramFiles(x86)} 'Microsoft\Edge\Application\msedge.exe'),
    (Join-Path $env:ProgramFiles 'Microsoft\Edge\Application\msedge.exe'),
    (Join-Path ${env:ProgramFiles(x86)} 'Google\Chrome\Application\chrome.exe'),
    (Join-Path $env:ProgramFiles 'Google\Chrome\Application\chrome.exe')
  )
  $browser = $candidates | Where-Object { $_ -and (Test-Path $_) } | Select-Object -First 1
  if ($browser) {
    Start-Process -FilePath $browser -ArgumentList @(
      "--app=$url",
      '--window-size=1440,920',
      '--user-data-dir=' + (Join-Path $env:LOCALAPPDATA 'LifeOS\app-window'),
      '--no-first-run',
      '--no-default-browser-check'
    ) | Out-Null
  } else {
    Start-Process $url | Out-Null
  }
}

# ------------------------------------------------------------
#  Main
# ------------------------------------------------------------
$Port = Get-FreePort $Port
$bindIp = if ($Lan) { [System.Net.IPAddress]::Any } else { [System.Net.IPAddress]::Loopback }
$listener = New-Object System.Net.Sockets.TcpListener $bindIp, $Port

try {
  $listener.Start()
} catch {
  throw "Could not start the server on port $Port. $($_.Exception.Message)"
}

$hostName = if ($Lan) { $env:COMPUTERNAME } else { '127.0.0.1' }
$url = "http://${hostName}:$Port/"
Write-Banner $url
Write-Host ("  serving: {0}" -f $Root) -ForegroundColor DarkGray
Write-Host ("  router:  {0}" -f $RouterBase) -ForegroundColor DarkGray
Write-Host ''

if (-not $NoBrowser) { Start-Browser $url }

try {
  while ($true) {
    $client = $listener.AcceptTcpClient()
    Handle-Client $client
  }
} finally {
  try { $listener.Stop() } catch { }
  Write-Host ''
  Write-Host '  Life OS stopped.' -ForegroundColor DarkGray
}


