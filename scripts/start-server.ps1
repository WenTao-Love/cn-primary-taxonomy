# 知识图谱本地服务器 - PowerShell版本
# 持续运行，直到手动停止

$serverProcess = $null

function Start-Server {
    $scriptPath = Join-Path $PSScriptRoot "start-local-server.py"
    $serverProcess = Start-Process -FilePath "python" -ArgumentList $scriptPath -PassThru -WindowStyle Normal
    Write-Host "服务器已启动 (PID: $($serverProcess.Id))" -ForegroundColor Green
    Write-Host "服务器地址: http://localhost:8080" -ForegroundColor Cyan
    Write-Host "模拟器地址: http://10.0.2.2:8080" -ForegroundColor Cyan
}

function Stop-Server {
    if ($serverProcess -ne $null -and !$serverProcess.HasExited) {
        Stop-Process -Id $serverProcess.Id -Force
        Write-Host "服务器已停止" -ForegroundColor Yellow
    }
}

# 启动服务器
Start-Server

# 保持运行
Write-Host ""
Write-Host "按任意键停止服务器..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# 清理
Stop-Server
