@echo off
setlocal
cd /d "%~dp0"

:: 1. Liberar puerto 1420 si alguna sesion huerfana anterior lo mantuviera ocupado
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr :1420 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
)

:: 2. Compilar el ejecutable nativo Iniciar_Odisea.exe usando el compilador C# de Windows si no existe
if not exist "Iniciar_Odisea.exe" (
    echo Compilando lanzador nativo de Odisea...
    C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe /nologo /target:winexe /out:"Iniciar_Odisea.exe" "server.cs"
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] No se pudo compilar Iniciar_Odisea.exe
        pause
        exit /b %ERRORLEVEL%
    )
)

:: 3. Iniciar Odisea de forma nativa e invisible
start "" "%~dp0Iniciar_Odisea.exe"
exit /b 0
