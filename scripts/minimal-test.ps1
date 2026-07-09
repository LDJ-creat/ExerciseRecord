$Base = "http://127.0.0.1:8080"
$uri = "$Base/api/auth/register"
$json = (@{ username = "script_test"; password = "123456" } | ConvertTo-Json -Compress)
Write-Host "Calling $uri"
$r = Invoke-RestMethod -Method POST -Uri $uri -Headers @{ "Content-Type" = "application/json" } -Body $json
$r | ConvertTo-Json
