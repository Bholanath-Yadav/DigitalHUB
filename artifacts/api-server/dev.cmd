@echo off
setlocal

set "NODE_EXE=%ProgramFiles%\nodejs\node.exe"
if not exist "%NODE_EXE%" (
  echo Node.js executable not found at "%NODE_EXE%".
  exit /b 1
)

"%NODE_EXE%" "%~dp0dev.mjs" %*