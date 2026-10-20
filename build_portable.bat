@echo off
setlocal enabledelayedexpansion

echo =======================================================
echo  Compilando y Preparando Odisea Portable v1.0.2
echo =======================================================
echo.

cd /d "%~dp0"

:: 1. Compilar Frontend con Node/Vite
echo [1/3] Compilando Frontend con Node/Vite...
call npm run build
if !ERRORLEVEL! neq 0 (
    echo [ERROR] Fallo la compilacion del frontend.
    pause
    exit /b !ERRORLEVEL!
)

:: 2. Generar iconos de alta definicion (O azul con fondo blanco)
echo.
echo [2/3] Generando Iconos de Odisea...
call node make_icons.cjs

:: 3. Compilar Binario Nativo Rust con Frontend Incrustado (Tauri Production)
echo.
echo [3/3] Compilando Binario Nativo Release Incrustado...
call npx @tauri-apps/cli build --no-bundle
if !ERRORLEVEL! neq 0 (
    echo [ERROR] Fallo la compilacion del binario nativo de produccion.
    pause
    exit /b !ERRORLEVEL!
)

:: 4. Desplegar ejecutable a las carpetas portables
if exist "C:\Users\IsaNet\.cargo_target\odisea\release\Odisea.exe" (
    copy /y "C:\Users\IsaNet\.cargo_target\odisea\release\Odisea.exe" "dist_portable\Odisea_Win11_Portable\odisea.exe" >nul 2>&1
    copy /y "C:\Users\IsaNet\.cargo_target\odisea\release\Odisea.exe" "Directorio_Portable_Odisea\odisea.exe" >nul 2>&1
) else if exist "src-tauri\target\release\odisea.exe" (
    copy /y "src-tauri\target\release\odisea.exe" "dist_portable\Odisea_Win11_Portable\odisea.exe" >nul 2>&1
    copy /y "src-tauri\target\release\odisea.exe" "Directorio_Portable_Odisea\odisea.exe" >nul 2>&1
)

echo.
echo =======================================================
echo  EXITO: Odisea v1.0.2 Portable listo en:
echo  - dist_portable\Odisea_Win11_Portable\odisea.exe
echo  - Directorio_Portable_Odisea\odisea.exe
echo.
echo  Puedes iniciar la aplicacion ejecutando directamente:
echo  odisea.exe
echo =======================================================
pause
