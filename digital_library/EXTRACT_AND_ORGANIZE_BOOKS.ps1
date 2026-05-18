# PowerShell Script to Extract and Organize Uploaded Books
# This script extracts zip files from uploads and places them in category folders

$ErrorActionPreference = "Stop"

# Define paths
$uploadsPath = "$env:APPDATA\Claude\local-agent-mode-sessions\c9ce00fe-c1cb-4b66-9b8c-0b6766114fda\c5dd3a71-fa04-4fba-81e1-f29d16db3b64\local_a8e86e27-a940-4171-aa12-27fb693dd5d4\uploads"
$booksPath = "C:\Users\PC\Desktop\digital_library\books"

# Book mappings: zip file -> (category, final filename)
$bookMappings = @{
    "pg22896-h.zip" = @("Agriculture", "Principles_of_Agriculture_Bailey.txt")
    "pg31262-h.zip" = @("Agriculture", "Farmers_Every_Day_Book_Stephens.txt")
    "pg34763-h.zip" = @("Agriculture", "Modern_Farming_Andrews.txt")
}

Write-Host "`n" -ForegroundColor Cyan
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Extracting and Organizing Project Gutenberg Books         ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host "`n"

Write-Host "📂 Checking paths..." -ForegroundColor Yellow
Write-Host "   Uploads: $uploadsPath"
Write-Host "   Books:   $booksPath`n"

# Create category directories if they don't exist
@("Agriculture", "Business", "Education", "Family", "Health", "Love", "Social") | ForEach-Object {
    $categoryPath = Join-Path $booksPath $_
    if (-not (Test-Path $categoryPath)) {
        New-Item -ItemType Directory -Path $categoryPath -Force | Out-Null
        Write-Host "   ✓ Created: $_" -ForegroundColor Green
    }
}

Write-Host "`n"

# Process each book
foreach ($zipFile in $bookMappings.Keys) {
    $zipPath = Join-Path $uploadsPath $zipFile

    if (-not (Test-Path $zipPath)) {
        Write-Host "❌ Not found: $zipFile" -ForegroundColor Red
        continue
    }

    Write-Host "📦 Processing: $zipFile" -ForegroundColor Cyan

    try {
        $category, $targetName = $bookMappings[$zipFile]

        # Create temp directory
        $tempDir = Join-Path $uploadsPath "temp_$($zipFile -replace '\.zip$', '')"
        if (Test-Path $tempDir) {
            Remove-Item -Path $tempDir -Recurse -Force
        }
        New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

        # Extract zip file
        Expand-Archive -Path $zipPath -DestinationPath $tempDir -Force
        Write-Host "   ✓ Extracted" -ForegroundColor Green

        # Find text file
        $textFiles = Get-ChildItem -Path $tempDir -Filter "*.txt" -Recurse

        if ($textFiles.Count -gt 0) {
            $sourceFile = $textFiles[0].FullName
            $destPath = Join-Path $booksPath $category $targetName

            # Copy to destination
            Copy-Item -Path $sourceFile -Destination $destPath -Force

            $fileSizeMB = "{0:F1}" -f ((Get-Item $destPath).Length / 1MB)
            Write-Host "   ✓ Saved to: $category\$targetName ($fileSizeMB MB)" -ForegroundColor Green
        } else {
            Write-Host "   ❌ No text file found in archive" -ForegroundColor Red
        }

        # Clean up
        Remove-Item -Path $tempDir -Recurse -Force

    } catch {
        Write-Host "   ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n"
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Verification                                              ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host "`n"

# Verify results
$agriculturePath = Join-Path $booksPath "Agriculture"
$agricultureBooks = @(Get-ChildItem -Path $agriculturePath -Filter "*.txt" -ErrorAction SilentlyContinue)

if ($agricultureBooks.Count -gt 0) {
    Write-Host "📚 Agriculture Books:" -ForegroundColor Green
    foreach ($book in $agricultureBooks) {
        $sizeMB = "{0:F1}" -f ($book.Length / 1MB)
        Write-Host "   ✓ $($book.Name) ($sizeMB MB)" -ForegroundColor Green
    }
    Write-Host "`n✨ Successfully organized $($agricultureBooks.Count) books!`n" -ForegroundColor Green
} else {
    Write-Host "❌ No books found in Agriculture folder`n" -ForegroundColor Red
}

Write-Host "═══════════════════════════════════════════════════════════════`n"
