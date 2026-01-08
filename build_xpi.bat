@echo off
rem Build an .xpi (zip) for this extension folder.
setlocal
set SRC=%~dp0
rem Remove trailing backslash from SRC if present
if "%SRC:~-1%"=="\" set SRC=%SRC:~0,-1%

rem If first argument starts with # (user added inline comment), ignore it
set ARG=%~1
if defined ARG (
	if "%ARG:~0,1%"=="#" (
		set ARG=
	)
)

set OUT=%SRC%\extension.xpi
if not "%ARG%"=="" set OUT=%~1
echo Creating XPI: %OUT%
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0build_xpi.ps1" "%SRC%" "%OUT%"
echo Done.
endlocal
pause
