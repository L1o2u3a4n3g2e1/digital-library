# PowerShell Script to Organize Downloaded Books
# Run this after the browser downloads all 21 books

$DownloadsPath = [System.IO.Path]::Combine($env:USERPROFILE, "Downloads")
$BooksPath = "C:\Users\PC\Desktop\digital_library\books"

# Define book-to-category mappings
$BookMappings = @{
    # Agriculture
    "Principles_of_Agriculture_Bailey.txt" = "Agriculture"
    "Farmers_Every_Day_Book_Stephens.txt" = "Agriculture"
    "Modern_Farming_Andrews.txt" = "Agriculture"

    # Business
    "Wealth_of_Nations_Smith.txt" = "Business"
    "Benjamin_Franklin_Autobiography.txt" = "Business"
    "The_Prince_Machiavelli.txt" = "Business"

    # Education
    "Essays_on_Education_Milton.txt" = "Education"
    "On_Education_Locke.txt" = "Education"
    "Franklin_Autobiography_Education.txt" = "Education"

    # Family
    "Little_Women_Alcott.txt" = "Family"
    "David_Copperfield_Dickens.txt" = "Family"
    "Jane_Eyre_Bronte.txt" = "Family"

    # Health
    "Care_Feeding_Children_Holt.txt" = "Health"
    "Practice_of_Medicine_Flint.txt" = "Health"
    "Art_of_Healing_Hippocrates.txt" = "Health"

    # Love
    "Pride_and_Prejudice_Austen.txt" = "Love"
    "Wuthering_Heights_Bronte.txt" = "Love"
    "Jane_Eyre_Bronte.txt" = "Love"

    # Social
    "Origin_of_Species_Darwin.txt" = "Social"
    "Social_Contract_Rousseau.txt" = "Social"
    "Tale_of_Two_Cities_Dickens.txt" = "Social"
}

Write-Host "=========================================="
Write-Host "Book Organization Script"
Write-Host "=========================================="
Write-Host "Downloads folder: $DownloadsPath"
Write-Host "Books folder: $BooksPath"
Write-Host ""

$movedCount = 0
$failedCount = 0
$skippedCount = 0

foreach ($book in $BookMappings.GetEnumerator()) {
    $filename = $book.Key
    $category = $book.Value

    $sourcePath = Join-Path $DownloadsPath $filename
    $destDir = Join-Path $BooksPath $category
    $destPath = Join-Path $destDir $filename

    if (Test-Path $sourcePath) {
        try {
            # Ensure destination directory exists
            if (-not (Test-Path $destDir)) {
                New-Item -ItemType Directory -Path $destDir -Force | Out-Null
            }

            # Move file
            Move-Item -Path $sourcePath -Destination $destPath -Force
            Write-Host "✓ Moved: $filename → $category\"
            $movedCount++
        }
        catch {
            Write-Host "✗ Error moving $filename : $_"
            $failedCount++
        }
    }
    else {
        Write-Host "⊘ Not found: $filename (still downloading?)"
        $skippedCount++
    }
}

Write-Host ""
Write-Host "=========================================="
Write-Host "Organization Complete!"
Write-Host "=========================================="
Write-Host "Moved: $movedCount books"
Write-Host "Skipped: $skippedCount books (not yet downloaded)"
Write-Host "Errors: $failedCount books"
Write-Host ""

# Verify organization
Write-Host "Books by Category:"
$categories = @("Agriculture", "Business", "Education", "Family", "Health", "Love", "Social")
foreach ($category in $categories) {
    $categoryPath = Join-Path $BooksPath $category
    if (Test-Path $categoryPath) {
        $count = (Get-ChildItem -Path $categoryPath -Filter "*.txt" | Measure-Object).Count
        Write-Host "  $category: $count books"
    }
}

Write-Host ""
Write-Host "Press any key to close this window..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
