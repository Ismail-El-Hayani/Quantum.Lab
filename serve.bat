@echo off
REM ============================================================
REM  Quantum-Lab local dev server launcher (Windows)
REM ============================================================
REM  ES modules + importmap + jsDelivr CDN require http://
REM  Browsers silently fail under file:// for that combo.
REM
REM  Usage:  double-click serve.bat
REM  Stop:   close the terminal window
REM ============================================================

setlocal
set "ROOT=%~dp0"
echo.
echo  Starting local server for quantum-lab...
echo  Root: %ROOT%
echo.

REM --- Try WSL first (best, no extra installs) ---
where wsl >nul 2>&1
if %errorlevel% equ 0 (
    echo  Using WSL python3.
    echo  Open in browser:  http://127.0.0.1:8080/
    echo.
    wsl -- bash -lc "cd ""$(wslpath '%ROOT%')"" && python3 -m http.server 8080 --bind 127.0.0.1"
    goto :eof
)

REM --- Fallback: native python ---
where python >nul 2>&1
if %errorlevel% equ 0 (
    echo  Using native python.
    echo  Open in browser:  http://127.0.0.1:8080/
    echo.
    cd /d "%ROOT%"
    python -m http.server 8080
    goto :eof
)

where py >nul 2>&1
if %errorlevel% equ 0 (
    echo  Using py launcher.
    echo  Open in browser:  http://127.0.0.1:8080/
    echo.
    cd /d "%ROOT%"
    py -3 -m http.server 8080
    goto :eof
)

echo  ERROR: No Python found.
echo  Install Python (https://python.org) or use WSL.
echo  Then run:  python -m http.server 8080
echo.
pause
