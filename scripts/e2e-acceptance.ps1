# Wave 4 E2E Acceptance Script — ExerciseRecord
$ErrorActionPreference = "Stop"
$Base = "http://127.0.0.1:8080"
$Results = @()

function Record($Flow, $Pass, $Detail) {
    $script:Results += [PSCustomObject]@{ Flow = $Flow; Pass = $Pass; Detail = $Detail }
    $icon = if ($Pass) { "PASS" } else { "FAIL" }
    Write-Host "[$icon] $Flow — $Detail"
}

function Invoke-Api {
    param(
        [Parameter(Mandatory)][ValidateSet("GET","POST","PUT","DELETE")]
        [string]$Method,
        [Parameter(Mandatory)][string]$Path,
        [hashtable]$Body,
        [string]$Token
    )
    $headers = @{ "Content-Type" = "application/json" }
    if ($Token) { $headers["Authorization"] = "Bearer $Token" }
    $uri = "$Base/api$Path"
    if ($Body) {
        $json = $Body | ConvertTo-Json -Compress
        return Invoke-RestMethod -Method $Method -Uri $uri -Headers $headers -Body $json
    }
    return Invoke-RestMethod -Method $Method -Uri $uri -Headers $headers
}

function Invoke-ApiRaw {
    param(
        [Parameter(Mandatory)][ValidateSet("GET","POST","PUT","DELETE")]
        [string]$Method,
        [Parameter(Mandatory)][string]$Path,
        [hashtable]$Body,
        [string]$Token
    )
    $headers = @{ "Content-Type" = "application/json" }
    if ($Token) { $headers["Authorization"] = "Bearer $Token" }
    $uri = "$Base/api$Path"
    try {
        if ($Body) {
            $json = $Body | ConvertTo-Json -Compress
            $resp = Invoke-WebRequest -Method $Method -Uri $uri -Headers $headers -Body $json -UseBasicParsing
        } else {
            $resp = Invoke-WebRequest -Method $Method -Uri $uri -Headers $headers -UseBasicParsing
        }
        return @{ Status = $resp.StatusCode; Body = ($resp.Content | ConvertFrom-Json) }
    } catch {
        $r = $_.Exception.Response
        if ($r) {
            $reader = New-Object System.IO.StreamReader($r.GetResponseStream())
            $content = $reader.ReadToEnd()
            return @{ Status = [int]$r.StatusCode; Body = ($content | ConvertFrom-Json) }
        }
        throw
    }
}

# Health check
$health = Invoke-RestMethod "$Base/health"
if ($health.status -ne "ok") { throw "Backend health check failed" }

$suffix = Get-Random -Maximum 99999
$userA = "e2e_a_$suffix"
$userB = "e2e_b_$suffix"
$pass = "Test123456"
$today = (Get-Date).ToString("yyyy-MM-dd")
$yesterday = (Get-Date).AddDays(-1).ToString("yyyy-MM-dd")
$checkin = $null
$tokenA = $null
$sports = $null

# --- Flow A ---
try {
    $regA = Invoke-Api -Method POST -Path "/auth/register" -Body @{ username = $userA; password = $pass; nickname = "E2E User A" }
    $loginA = Invoke-Api -Method POST -Path "/auth/login" -Body @{ username = $userA; password = $pass }
    $tokenA = $loginA.data.token
    $sports = Invoke-Api -Method GET -Path "/sport-types" -Token $tokenA
    $running = $sports.data | Where-Object { $_.code -eq "running" } | Select-Object -First 1
    $checkin = Invoke-Api -Method POST -Path "/checkin" -Body @{
        sport_type_id = [int]$running.id; check_date = $today; duration = 45
        distance = 5.2; calories = 300; remark = "E2E flow A"
    } -Token $tokenA
    $ok = ($regA.code -eq 0) -and ($loginA.code -eq 0) -and ($checkin.code -eq 0) -and ($checkin.data.duration -eq 45)
    Record "A 注册登录今日跑步打卡" $ok "user=$userA id=$($checkin.data.id)"
} catch { Record "A 注册登录今日跑步打卡" $false $_.Exception.Message }

# --- Flow B ---
try {
    $cycling = $sports.data | Where-Object { $_.code -eq "cycling" } | Select-Object -First 1
    $makeup = Invoke-Api -Method POST -Path "/checkin" -Body @{
        sport_type_id = [int]$cycling.id; check_date = $yesterday; duration = 30; distance = 10; remark = "E2E makeup"
    } -Token $tokenA
    $list = Invoke-Api -Method GET -Path "/checkin/list?start_date=$yesterday&end_date=$today" -Token $tokenA
    $makeupItem = $list.data.items | Where-Object { $_.check_date -eq $yesterday -and $_.is_makeup -eq 1 }
    $ok = ($makeup.code -eq 0) -and ($makeup.data.is_makeup -eq 1) -and ($null -ne $makeupItem)
    Record "B 补卡昨天骑行+列表标记" $ok "is_makeup=$($makeup.data.is_makeup)"
} catch { Record "B 补卡昨天骑行+列表标记" $false $_.Exception.Message }

# --- Flow C ---
try {
    $d = Get-Date; $diff = ([int]$d.DayOfWeek + 6) % 7
    $monday = $d.AddDays(-$diff).ToString("yyyy-MM-dd")
    $goal = Invoke-Api -Method POST -Path "/goal" -Body @{
        period_type = 1; period_start = $monday; target_type = 2; target_value = 300
    } -Token $tokenA
    $progress = Invoke-Api -Method GET -Path "/goal/progress" -Token $tokenA
    $weekGoal = $progress.data | Where-Object { $_.target_type -eq 2 } | Select-Object -First 1
    $ok = ($goal.code -eq 0) -and ($null -ne $weekGoal) -and ($weekGoal.actual -ge 75) -and ($weekGoal.progress_percent -gt 0)
    Record "C 周目标300分钟+进度更新" $ok "actual=$($weekGoal.actual) pct=$($weekGoal.progress_percent)"
} catch { Record "C 周目标300分钟+进度更新" $false $_.Exception.Message }

# --- Flow D ---
try {
    $stats = Invoke-Api -Method GET -Path "/stats/personal?period=month" -Token $tokenA
    $summary = $stats.data.summary
    $ok = ($stats.code -eq 0) -and ($summary.total_duration -eq 75) -and ($summary.total_count -eq 2)
    Record "D 统计页数据一致" $ok "duration=$($summary.total_duration) count=$($summary.total_count)"
} catch { Record "D 统计页数据一致" $false $_.Exception.Message }

# --- Flow E ---
try {
    $rank = Invoke-Api -Method GET -Path "/stats/ranking?dimension=duration&period=month" -Token $tokenA
    $ok = ($rank.code -eq 0) -and ($rank.data.rankings.Count -ge 1) -and ($rank.data.my_rank.rank -ge 1)
    Record "E 排行榜Top50+我的排名" $ok "count=$($rank.data.rankings.Count) my_rank=$($rank.data.my_rank.rank)"
} catch { Record "E 排行榜Top50+我的排名" $false $_.Exception.Message }

# --- Flow F ---
try {
    $year = (Get-Date).Year; $month = (Get-Date).Month
    $cal = Invoke-Api -Method GET -Path "/calendar?year=$year&month=$month" -Token $tokenA
    $todayDay = $cal.data.days | Where-Object { $_.date -eq $today }
    $yesterdayDay = $cal.data.days | Where-Object { $_.date -eq $yesterday }
    $ok = ($cal.code -eq 0) -and ($todayDay.checked) -and ($todayDay.heat_level -ge 1) -and ($yesterdayDay.checked) -and ($cal.data.streak -ge 1)
    Record "F 日历热力图+Streak" $ok "heat=$($todayDay.heat_level) streak=$($cal.data.streak)"
} catch { Record "F 日历热力图+Streak" $false $_.Exception.Message }

# --- Flow G ---
try {
    $put = Invoke-Api -Method PUT -Path "/reminder" -Body @{ is_enabled = 1; remind_time = "20:00" } -Token $tokenA
    $get = Invoke-Api -Method GET -Path "/reminder" -Token $tokenA
    $log = Invoke-Api -Method POST -Path "/reminder/logs" -Body @{ status = 1; remind_date = $today } -Token $tokenA
    $ok = ($put.code -eq 0) -and ($get.data.is_enabled -eq 1) -and ($get.data.remind_time -eq "20:00") -and ($log.code -eq 0)
    Record "G 提醒设置保存+日志写入" $ok "time=$($get.data.remind_time)"
} catch { Record "G 提醒设置保存+日志写入" $false $_.Exception.Message }

# --- Flow H ---
try {
    Invoke-Api -Method POST -Path "/reminder/logs" -Body @{ status = 2; remind_date = $yesterday } -Token $tokenA | Out-Null
    Invoke-Api -Method POST -Path "/reminder/logs" -Body @{ status = 0; remind_date = (Get-Date).AddDays(-2).ToString("yyyy-MM-dd") } -Token $tokenA | Out-Null
    $logs = Invoke-Api -Method GET -Path "/reminder/logs?page=1&page_size=20" -Token $tokenA
    $statuses = $logs.data.items | ForEach-Object { $_.status } | Sort-Object -Unique
    $ok = ($logs.code -eq 0) -and ($logs.data.items.Count -ge 3) -and ($statuses -contains 0) -and ($statuses -contains 1) -and ($statuses -contains 2)
    Record "H 提醒历史三种状态" $ok "items=$($logs.data.items.Count) statuses=$($statuses -join ',')"
} catch { Record "H 提醒历史三种状态" $false $_.Exception.Message }

# --- Flow I ---
try {
    Invoke-Api -Method POST -Path "/auth/register" -Body @{ username = $userB; password = $pass; nickname = "E2E User B" } | Out-Null
    $loginB = Invoke-Api -Method POST -Path "/auth/login" -Body @{ username = $userB; password = $pass }
    $tokenB = $loginB.data.token
    $raw = Invoke-ApiRaw -Method GET -Path "/checkin/$($checkin.data.id)" -Token $tokenB
    $ok = ($raw.Body.code -eq 40301)
    Record "I 越权访问返回403" $ok "code=$($raw.Body.code)"
} catch { Record "I 越权访问返回403" $false $_.Exception.Message }

Write-Host "`n========== E2E SUMMARY =========="
$passed = ($Results | Where-Object { $_.Pass }).Count
Write-Host "Passed: $passed / $($Results.Count)"
$Results | Format-Table -AutoSize
if ($passed -lt $Results.Count) { exit 1 }
