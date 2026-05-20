@echo off
REM Organize downloaded books from Downloads folder to category folders
REM This script moves all book files downloaded by Claude to their correct category folders

setlocal enabledelayedexpansion
set DOWNLOADS=%USERPROFILE%\Downloads
set BOOKS=C:\Users\PC\Desktop\digital_library\books

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║   Organizing Downloaded Books into Category Folders        ║
echo ║   Moving files from Downloads to: %BOOKS%        ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Create all category directories if they don't exist
for %%C in (Agriculture Business Education Family Health Love Social) do (
    if not exist "%BOOKS%\%%C" mkdir "%BOOKS%\%%C"
    echo [+] Created folder: %%C
)

echo.
echo Moving books to category folders...
echo.

set moved=0
set skipped=0
set errors=0

REM Agriculture
if exist "%DOWNLOADS%\Principles_of_Agriculture_Bailey.txt" (
    move /Y "%DOWNLOADS%\Principles_of_Agriculture_Bailey.txt" "%BOOKS%\Agriculture\" >nul 2>&1 && (
        echo [+] Agriculture: Principles_of_Agriculture_Bailey.txt
        set /a moved+=1
    ) || (
        echo [-] Error moving: Principles_of_Agriculture_Bailey.txt
        set /a errors+=1
    )
)
if exist "%DOWNLOADS%\Farmers_Every_Day_Book_Stephens.txt" (
    move /Y "%DOWNLOADS%\Farmers_Every_Day_Book_Stephens.txt" "%BOOKS%\Agriculture\" >nul 2>&1 && (
        echo [+] Agriculture: Farmers_Every_Day_Book_Stephens.txt
        set /a moved+=1
    ) || (
        echo [-] Error
        set /a errors+=1
    )
)
if exist "%DOWNLOADS%\Modern_Farming_Andrews.txt" (
    move /Y "%DOWNLOADS%\Modern_Farming_Andrews.txt" "%BOOKS%\Agriculture\" >nul 2>&1 && (
        echo [+] Agriculture: Modern_Farming_Andrews.txt
        set /a moved+=1
    ) || (
        echo [-] Error
        set /a errors+=1
    )
)

REM Business
if exist "%DOWNLOADS%\Wealth_of_Nations_Smith.txt" (
    move /Y "%DOWNLOADS%\Wealth_of_Nations_Smith.txt" "%BOOKS%\Business\" >nul 2>&1 && (
        echo [+] Business: Wealth_of_Nations_Smith.txt
        set /a moved+=1
    ) || (set /a errors+=1)
)
if exist "%DOWNLOADS%\Benjamin_Franklin_Autobiography.txt" (
    move /Y "%DOWNLOADS%\Benjamin_Franklin_Autobiography.txt" "%BOOKS%\Business\" >nul 2>&1 && (
        echo [+] Business: Benjamin_Franklin_Autobiography.txt
        set /a moved+=1
    ) || (set /a errors+=1)
)
if exist "%DOWNLOADS%\The_Prince_Machiavelli.txt" (
    move /Y "%DOWNLOADS%\The_Prince_Machiavelli.txt" "%BOOKS%\Business\" >nul 2>&1 && (
        echo [+] Business: The_Prince_Machiavelli.txt
        set /a moved+=1
    ) || (set /a errors+=1)
)

REM Education
if exist "%DOWNLOADS%\Essays_on_Education_Milton.txt" (
    move /Y "%DOWNLOADS%\Essays_on_Education_Milton.txt" "%BOOKS%\Education\" >nul 2>&1 && (
        echo [+] Education: Essays_on_Education_Milton.txt
        set /a moved+=1
    ) || (set /a errors+=1)
)
if exist "%DOWNLOADS%\On_Education_Locke.txt" (
    move /Y "%DOWNLOADS%\On_Education_Locke.txt" "%BOOKS%\Education\" >nul 2>&1 && (
        echo [+] Education: On_Education_Locke.txt
        set /a moved+=1
    ) || (set /a errors+=1)
)

REM Family
if exist "%DOWNLOADS%\Little_Women_Alcott.txt" (
    move /Y "%DOWNLOADS%\Little_Women_Alcott.txt" "%BOOKS%\Family\" >nul 2>&1 && (
        echo [+] Family: Little_Women_Alcott.txt
        set /a moved+=1
    ) || (set /a errors+=1)
)
if exist "%DOWNLOADS%\David_Copperfield_Dickens.txt" (
    move /Y "%DOWNLOADS%\David_Copperfield_Dickens.txt" "%BOOKS%\Family\" >nul 2>&1 && (
        echo [+] Family: David_Copperfield_Dickens.txt
        set /a moved+=1
    ) || (set /a errors+=1)
)
if exist "%DOWNLOADS%\Jane_Eyre_Bronte.txt" (
    move /Y "%DOWNLOADS%\Jane_Eyre_Bronte.txt" "%BOOKS%\Family\" >nul 2>&1 && (
        echo [+] Family: Jane_Eyre_Bronte.txt (to Family)
        set /a moved+=1
    ) || (set /a errors+=1)
)

REM Health
if exist "%DOWNLOADS%\Care_Feeding_Children_Holt.txt" (
    move /Y "%DOWNLOADS%\Care_Feeding_Children_Holt.txt" "%BOOKS%\Health\" >nul 2>&1 && (
        echo [+] Health: Care_Feeding_Children_Holt.txt
        set /a moved+=1
    ) || (set /a errors+=1)
)
if exist "%DOWNLOADS%\Practice_of_Medicine_Flint.txt" (
    move /Y "%DOWNLOADS%\Practice_of_Medicine_Flint.txt" "%BOOKS%\Health\" >nul 2>&1 && (
        echo [+] Health: Practice_of_Medicine_Flint.txt
        set /a moved+=1
    ) || (set /a errors+=1)
)
if exist "%DOWNLOADS%\Art_of_Healing_Hippocrates.txt" (
    move /Y "%DOWNLOADS%\Art_of_Healing_Hippocrates.txt" "%BOOKS%\Health\" >nul 2>&1 && (
        echo [+] Health: Art_of_Healing_Hippocrates.txt
        set /a moved+=1
    ) || (set /a errors+=1)
)

REM Love
if exist "%DOWNLOADS%\Pride_and_Prejudice_Austen.txt" (
    move /Y "%DOWNLOADS%\Pride_and_Prejudice_Austen.txt" "%BOOKS%\Love\" >nul 2>&1 && (
        echo [+] Love: Pride_and_Prejudice_Austen.txt
        set /a moved+=1
    ) || (set /a errors+=1)
)
if exist "%DOWNLOADS%\Wuthering_Heights_Bronte.txt" (
    move /Y "%DOWNLOADS%\Wuthering_Heights_Bronte.txt" "%BOOKS%\Love\" >nul 2>&1 && (
        echo [+] Love: Wuthering_Heights_Bronte.txt
        set /a moved+=1
    ) || (set /a errors+=1)
)

REM Social
if exist "%DOWNLOADS%\Origin_of_Species_Darwin.txt" (
    move /Y "%DOWNLOADS%\Origin_of_Species_Darwin.txt" "%BOOKS%\Social\" >nul 2>&1 && (
        echo [+] Social: Origin_of_Species_Darwin.txt
        set /a moved+=1
    ) || (set /a errors+=1)
)
if exist "%DOWNLOADS%\Social_Contract_Rousseau.txt" (
    move /Y "%DOWNLOADS%\Social_Contract_Rousseau.txt" "%BOOKS%\Social\" >nul 2>&1 && (
        echo [+] Social: Social_Contract_Rousseau.txt
        set /a moved+=1
    ) || (set /a errors+=1)
)
if exist "%DOWNLOADS%\Tale_of_Two_Cities_Dickens.txt" (
    move /Y "%DOWNLOADS%\Tale_of_Two_Cities_Dickens.txt" "%BOOKS%\Social\" >nul 2>&1 && (
        echo [+] Social: Tale_of_Two_Cities_Dickens.txt
        set /a moved+=1
    ) || (set /a errors+=1)
)

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║   Organization Complete!                                   ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo Books moved: %moved%
echo Errors: %errors%
echo.
echo ✓ Your Digital Library is ready to use!
echo.
echo Books are organized in:
echo C:\Users\PC\Desktop\digital_library\books\
echo.
pause
