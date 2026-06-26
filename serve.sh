#!/usr/bin/env bash
# ============================================================
#  Quantum-Lab local dev server launcher (WSL/Linux)
# ============================================================
#  ES modules + importmap + jsDelivr CDN require http://
#  Browsers silently fail under file:// for that combo.
#
#  Usage:  ./serve.sh
#  Stop:   Ctrl-C
# ============================================================

ROOT="$(cd "$(dirname "$0")" && pwd)"
echo
echo "Starting local server for quantum-lab..."
echo "Root: $ROOT"
echo
echo "Open in browser:  http://127.0.0.1:8080/"
echo

if command -v python3 >/dev/null 2>&1; then
    cd "$ROOT" && python3 -m http.server 8080 --bind 127.0.0.1
elif command -v python >/dev/null 2>&1; then
    cd "$ROOT" && python -m http.server 8080 --bind 127.0.0.1
else
    echo "ERROR: no python found. Install python3 or run serve.bat from Windows."
    exit 1
fi
