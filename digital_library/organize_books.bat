@echo off
REM Batch script to organize downloaded books

setlocal enabledelayedexpansion
set DOWNLOADS=%USERPROFILE%\Downloads
set BOOKS=C:\Users\PC\Desktop\digital_library\books

echo.
echo ==========================================
echo Book Organization Script (Batch Version)
echo ==========================================
echo Downloads folder: %DOWNLOADS%
echo Books folder: %BOOKS%
echo.

set moved=0
set skipped=0
set errors=0

REM Create directories if they don't exist
for %%C in (Agriculture Business Education Family Health Love Social) do (
    if not exist "%BOOKS%\%%C" mkdir "%BOOKS%\%%C"
)

REM Move Agriculture books
if exist "%DOWNLOADS%\Principles_of_Agriculture_Bailey.txt" (
    move "%DOWNLOADS%\Principles_of_Agriculture_Bailey.txt" "%BOOKS%\Agriculture\" >nul 2>&1
    if !errorlevel! equ 0 (
        echo [+] Moved: Principles_of_Agriculture_Bailey.txt
        set /a moved+=1
    ) else (
        echo [-] Error moving: Principles_of_Agriculture_Bailey.txt
        set /a errors+=1
    )
) else (
    echo [?] Not found: Principles_of_Agriculture_Bailey.txt
    set /a skipped+=1
)

if exist "%DOWNLOADS%\Farmers_Every_Day_Book_Stephens.txt" (
    move "%DOWNLOADS%\Farmers_Every_Day_Book_Stephens.txt" "%BOOKS%\Agriculture\" >nul 2>&1
    if !errorlevel! equ 0 (
        echo [+] Moved: Farmers_Every_Day_Book_Stephens.txt
        set /a moved+=1
    ) else (
        echo [-] Error moving: Farmers_Every_Day_Book_Stephens.txt
        set /a errors+=1
    )
) else (
    echo [?] Not found: Farmers_Every_Day_Book_Stephens.txt
    set /a skipped+=1
)

if exist "%DOWNLOADS%\Modern_Farming_Andrews.txt" (
    move "%DOWNLOADS%\Modern_Farming_Andrews.txt" "%BOOKS%\Agriculture\" >nul 2>&1
    if !errorlevel! equ 0 (
        echo [+] Moved: Modern_Farming_Andrews.txt
        set /a moved+=1
    ) else (
        echo [-] Error moving: Modern_Farming_Andrews.txt
        set /a errors+=1
    )
) else (
    echo [?] Not found: Modern_Farming_Andrews.txt
    set /a skipped+=1
)

REM Move Business books
if exist "%DOWNLOADS%\Wealth_of_Nations_Smith.txt" (
    move "%DOWNLOADS%\Wealth_of_Nations_Smith.txt" "%BOOKS%\Business\" >nul 2>&1
    if !errorlevel! equ 0 (
        echo [+] Moved: Wealth_of_Nations_Smith.txt
        set /a moved+=1
    ) else (
        echo [-] Error moving: Wealth_of_Nations_Smith.txt
        set /a errors+=1
    )
) else (
    echo [?] Not found: Wealth_of_Nations_Smith.txt
    set /a skipped+=1
)

if exist "%DOWNLOADS%\Benjamin_Franklin_Autobiography.txt" (
    move "%DOWNLOADS%\Benjamin_Franklin_Autobiography.txt" "%BOOKS%\Business\" >nul 2>&1
    if !errorlevel! equ 0 (
        echo [+] Moved: Benjamin_Franklin_Autobiography.txt
        set /a moved+=1
    ) else (
        echo [-] Error moving: Benjamin_Franklin_Autobiography.txt
        set /a errors+=1
    )
) else (
    echo [?] Not found: Benjamin_Franklin_Autobiography.txt
    set /a skipped+=1
)

if exist "%DOWNLOADS%\The_Prince_Machiavelli.txt" (
    move "%DOWNLOADS%\The_Prince_Machiavelli.txt" "%BOOKS%\Business\" >nul 2>&1
    if !errorlevel! equ 0 (
        echo [+] Moved: The_Prince_Machiavelli.txt
        set /a moved+=1
    ) else (
        echo [-] Error moving: The_Prince_Machiavelli.txt
        set /a errors+=1
    )
) else (
    echo [?] Not found: The_Prince_Machiavelli.txt
    set /a skipped+=1
)

REM Move Education books
if exist "%DOWNLOADS%\Essays_on_Education_Milton.txt" (
    move "%DOWNLOADS%\Essays_on_Education_Milton.txt" "%BOOKS%\Education\" >nul 2>&1
    if !errorlevel! equ 0 (
        echo [+] Moved: Essays_on_Education_Milton.txt
        set /a moved+=1
    ) else (
        echo [-] Error moving: Essays_on_Education_Milton.txt
        set /a errors+=1
    )
) else (
    echo [?] Not found: Essays_on_Education_Milton.txt
    set /a skipped+=1
)

if exist "%DOWNLOADS%\On_Education_Locke.txt" (
    move "%DOWNLOADS%\On_Education_Locke.txt" "%BOOKS%\Education\" >nul 2>&1
    if !errorlevel! equ 0 (
        echo [+] Moved: On_Education_Locke.txt
        set /a moved+=1
    ) else (
        echo [-] Error moving: On_Education_Locke.txt
        set /a errors+=1
    )
) else (
    echo [?] Not found: On_Education_Locke.txt
    set /a skipped+=1
)

if exist "%DOWNLOADS%\Franklin_Autobiography_Education.txt" (
    move "%DOWNLOADS%\Franklin_Autobiography_Education.txt" "%BOOKS%\Education\" >nul 2>&1
    if !errorlevel! equ 0 (
        echo [+] Moved: Franklin_Autobiography_Education.txt
        set /a moved+=1
    ) else (
        echo [-] Error moving: Franklin_Autobiography_Education.txt
        set /a errors+=1
    )
) else (
    echo [?] Not found: Franklin_Autobiography_Education.txt
    set /a skipped+=1
)

REM Move Family books
if exist "%DOWNLOADS%\Little_Women_Alcott.txt" (
    move "%DOWNLOADS%\Little_Women_Alcott.txt" "%BOOKS%\Family\" >nul 2>&1
    if !errorlevel! equ 0 (
        echo [+] Moved: Little_Women_Alcott.txt
        set /a moved+=1
    ) else (
        echo [-] Error moving: Little_Women_Alcott.txt
        set /a errors+=1
    )
) else (
    echo [?] Not found: Little_Women_Alcott.txt
    set /a skipped+=1
)

if exist "%DOWNLOADS%\David_Copperfield_Dickens.txt" (
    move "%DOWNLOADS%\David_Copperfield_Dickens.txt" "%BOOKS%\Family\" >nul 2>&1
    if !errorlevel! equ 0 (
        echo [+] Moved: David_Copperfield_Dickens.txt
        set /a moved+=1
    ) else (
        echo [-] Error moving: David_Copperfield_Dickens.txt
        set /a errors+=1
    )
) else (
    echo [?] Not found: David_Copperfield_Dickens.txt
    set /a skipped+=1
)

if exist "%DOWNLOADS%\Jane_Eyre_Bronte.txt" (
    move "%DOWNLOADS%\Jane_Eyre_Bronte.txt" "%BOOKS%\Family\" >nul 2>&1
    if !errorlevel! equ 0 (
        echo [+] Moved: Jane_Eyre_Bronte.txt
        set /a moved+=1
    ) else (
        echo [-] Error moving: Jane_Eyre_Bronte.txt
        set /a errors+=1
    )
) else (
    echo [?] Not found: Jane_Eyre_Bronte.txt
    set /a skipped+=1
)

REM Move Health books
if exist "%DOWNLOADS%\Care_Feeding_Children_Holt.txt" (
    move "%DOWNLOADS%\Care_Feeding_Children_Holt.txt" "%BOOKS%\Health\" >nul 2>&1
    if !errorlevel! equ 0 (
        echo [+] Moved: Care_Feeding_Children_Holt.txt
        set /a moved+=1
    ) else (
        echo [-] Error moving: Care_Feeding_Children_Holt.txt
        set /a errors+=1
    )
) else (
    echo [?] Not found: Care_Feeding_Children_Holt.txt
    set /a skipped+=1
)

if exist "%DOWNLOADS%\Practice_of_Medicine_Flint.txt" (
    move "%DOWNLOADS%\Practice_of_Medicine_Flint.txt" "%BOOKS%\Health\" >nul 2>&1
    if !errorlevel! equ 0 (
        echo [+] Moved: Practice_of_Medicine_Flint.txt
        set /a moved+=1
    ) else (
        echo [-] Error moving: Practice_of_Medicine_Flint.txt
        set /a errors+=1
    )
) else (
    echo [?] Not found: Practice_of_Medicine_Flint.txt
    set /a skipped+=1
)

if exist "%DOWNLOADS%\Art_of_Healing_Hippocrates.txt" (
    move "%DOWNLOADS%\Art_of_Healing_Hippocrates.txt" "%BOOKS%\Health\" >nul 2>&1
    if !errorlevel! equ 0 (
        echo [+] Moved: Art_of_Healing_Hippocrates.txt
        set /a moved+=1
    ) else (
        echo [-] Error moving: Art_of_Healing_Hippocrates.txt
        set /a errors+=1
    )
) else (
    echo [?] Not found: Art_of_Healing_Hippocrates.txt
    set /a skipped+=1
)

REM Move Love books
if exist "%DOWNLOADS%\Pride_and_Prejudice_Austen.txt" (
    move "%DOWNLOADS%\Pride_and_Prejudice_Austen.txt" "%BOOKS%\Love\" >nul 2>&1
    if !errorlevel! equ 0 (
        echo [+] Moved: Pride_and_Prejudice_Austen.txt
        set /a moved+=1
    ) else (
        echo [-] Error moving: Pride_and_Prejudice_Austen.txt
        set /a errors+=1
    )
) else (
    echo [?] Not found: Pride_and_Prejudice_Austen.txt
    set /a skipped+=1
)

if exist "%DOWNLOADS%\Wuthering_Heights_Bronte.txt" (
    move "%DOWNLOADS%\Wuthering_Heights_Bronte.txt" "%BOOKS%\Love\" >nul 2>&1
    if !errorlevel! equ 0 (
        echo [+] Moved: Wuthering_Heights_Bronte.txt
        set /a moved+=1
    ) else (
        echo [-] Error moving: Wuthering_Heights_Bronte.txt
        set /a errors+=1
    )
) else (
    echo [?] Not found: Wuthering_Heights_Bronte.txt
    set /a skipped+=1
)

REM Move Social books
if exist "%DOWNLOADS%\Origin_of_Species_Darwin.txt" (
    move "%DOWNLOADS%\Origin_of_Species_Darwin.txt" "%BOOKS%\Social\" >nul 2>&1
    if !errorlevel! equ 0 (
        echo [+] Moved: Origin_of_Species_Darwin.txt
        set /a moved+=1
    ) else (
        echo [-] Error moving: Origin_of_Species_Darwin.txt
        set /a errors+=1
    )
) else (
    echo [?] Not found: Origin_of_Species_Darwin.txt
    set /a skipped+=1
)

if exist "%DOWNLOADS%\Social_Contract_Rousseau.txt" (
    move "%DOWNLOADS%\Social_Contract_Rousseau.txt" "%BOOKS%\Social\" >nul 2>&1
    if !errorlevel! equ 0 (
        echo [+] Moved: Social_Contract_Rousseau.txt
        set /a moved+=1
    ) else (
        echo [-] Error moving: Social_Contract_Rousseau.txt
        set /a errors+=1
    )
) else (
    echo [?] Not found: Social_Contract_Rousseau.txt
    set /a skipped+=1
)

if exist "%DOWNLOADS%\Tale_of_Two_Cities_Dickens.txt" (
    move "%DOWNLOADS%\Tale_of_Two_Cities_Dickens.txt" "%BOOKS%\Social\" >nul 2>&1
    if !errorlevel! equ 0 (
        echo [+] Moved: Tale_of_Two_Cities_Dickens.txt
        set /a moved+=1
    ) else (
        echo [-] Error moving: Tale_of_Two_Cities_Dickens.txt
        set /a errors+=1
    )
) else (
    echo [?] Not found: Tale_of_Two_Cities_Dickens.txt
    set /a skipped+=1
)

echo.
echo ==========================================
echo Organization Complete!
echo ==========================================
echo Moved: %moved% books
echo Skipped: %skipped% books (not yet downloaded)
echo Errors: %errors% books
echo.
echo Press any key to exit...
pause >nul
