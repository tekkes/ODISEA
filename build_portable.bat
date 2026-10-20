@echo off
setlocal enabledelayedexpansion

echo =======================================================
echo  Preparando Odisea Portable para Windows 11
echo =======================================================
echo.

cd /d "%~dp0"

:: 1. Verificar si npm esta disponible para recompilar frontend
where npm >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo [1/3] Compilando Frontend con Node/Vite...
    call npm run build
    if !ERRORLEVEL! neq 0 (
        echo [ERROR] Fallo la compilacion del frontend.
        pause
        exit /b !ERRORLEVEL!
    )
) else (
    echo [1/3] 'npm' no esta en PATH.
    if exist "dist\index.html" (
        echo [OK] Se utilizara el bundle de frontend ya existente en 'dist\'.
    ) else (
        echo [ERROR] No existe 'dist\index.html' ni 'npm' para generarlo.
        pause
        exit /b 1
    )
)

:: 2. Verificar si cargo esta disponible para compilar backend Rust
where cargo >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo.
    echo [2/3] Compilando Binario Nativo Rust en Modo Release...
    cd src-tauri
    call cargo build --release
    if !ERRORLEVEL! neq 0 (
        echo [ERROR] Fallo la compilacion del backend Rust.
        pause
        exit /b !ERRORLEVEL!
    )
    cd ..
    if exist "src-tauri\target\release\odisea.exe" (
        copy /y "src-tauri\target\release\odisea.exe" "dist_portable\Odisea_Win11_Portable\odisea.exe" >nul 2>&1
    )
) else (
    echo.
    echo [2/3] 'cargo' no esta en PATH. Se mantiene el binario odisea.exe existente.
)

:: 3. Empaquetar y sincronizar frontend a www
echo.
echo [3/3] Sincronizando ficheros a dist_portable\Odisea_Win11_Portable...
if not exist "dist_portable\Odisea_Win11_Portable" mkdir "dist_portable\Odisea_Win11_Portable"
if not exist "dist_portable\Odisea_Win11_Portable\odisea_data" mkdir "dist_portable\Odisea_Win11_Portable\odisea_data"
if not exist "dist_portable\Odisea_Win11_Portable\www" mkdir "dist_portable\Odisea_Win11_Portable\www"

if exist "dist" (
    xcopy /E /I /Y "dist" "dist_portable\Odisea_Win11_Portable\www\" >nul 2>&1
)

echo.
echo =======================================================
echo  EXITO: Entorno portable listo en:
echo  dist_portable\Odisea_Win11_Portable\
echo.
echo  Puedes iniciar la aplicacion ejecutando:
echo  - dist_portable\Odisea_Win11_Portable\Iniciar_Odisea.vbs (Sin consola)
echo  - dist_portable\Odisea_Win11_Portable\Iniciar_Odisea.bat
echo =======================================================
pause
