@echo off
setlocal
echo [Markdown Reader] Dang cai dat Native Messaging Host...

set "MANIFEST_PATH=%~dp0com.markdown_reader.host.json"

:: Dang ky cho Google Chrome
REG ADD "HKCU\Software\Google\Chrome\NativeMessagingHosts\com.markdown_reader.host" /ve /t REG_SZ /d "%MANIFEST_PATH%" /f >nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Da dang ky cho Google Chrome!
) else (
    echo [LOI] Khong the dang ky cho Google Chrome.
)

:: Dang ky cho Microsoft Edge
REG ADD "HKCU\Software\Microsoft\Edge\NativeMessagingHosts\com.markdown_reader.host" /ve /t REG_SZ /d "%MANIFEST_PATH%" /f >nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Da dang ky cho Microsoft Edge!
) else (
    echo [LOI] Khong the dang ky cho Microsoft Edge.
)

echo.
echo [Markdown Reader] Hoan tat cai dat Native Host! Ban co the click folder de load ngay khong can popup.
