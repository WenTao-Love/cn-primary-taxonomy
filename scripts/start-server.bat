@echo off
chcp 65001 >nul
title 知识图谱本地服务器
echo ========================================
echo 知识图谱本地服务器
echo ========================================
echo.
echo 服务器地址: http://localhost:8080
echo 模拟器地址: http://10.0.2.2:8080
echo.
echo 按 Ctrl+C 停止服务器
echo.
python "%~dp0start-local-server.py"
pause
