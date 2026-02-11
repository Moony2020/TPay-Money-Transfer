$ports = 3000, 3001, 3002, 3003
$repoMarker = 'Projects-Codes\\tPay'

$connections = Get-NetTCPConnection -State Listen -LocalPort $ports -ErrorAction SilentlyContinue
if (-not $connections) {
  Write-Host 'No stale tPay dev processes found.'
  exit 0
}

$targetPids = New-Object System.Collections.Generic.HashSet[int]

foreach ($connection in $connections) {
  $proc = Get-CimInstance Win32_Process -Filter "ProcessId = $($connection.OwningProcess)" -ErrorAction SilentlyContinue
  if (-not $proc) {
    continue
  }

  $isNode = $proc.Name -ieq 'node.exe'
  $isTpayProcess = $proc.CommandLine -and $proc.CommandLine -match $repoMarker

  if ($isNode -and $isTpayProcess) {
    [void]$targetPids.Add([int]$connection.OwningProcess)
  }
}

if ($targetPids.Count -eq 0) {
  Write-Host 'No stale tPay dev processes found.'
  exit 0
}

foreach ($processId in $targetPids) {
  Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
}

Write-Host "Stopped $($targetPids.Count) stale tPay dev process(es)."
