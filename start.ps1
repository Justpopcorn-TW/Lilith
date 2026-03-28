# ========================================================
#             ✨ Lilith OS Boot Sequence ✨
# ========================================================

Write-Host "========================================================" -ForegroundColor Magenta
Write-Host "                ✨ Lilith OS Boot Sequence ✨" -ForegroundColor Magenta
Write-Host "========================================================" -ForegroundColor Magenta
Write-Host ""

Write-Host "[System] 正在檢查環境依賴 (Checking environment dependencies)..." -ForegroundColor Cyan

# 檢查 Node.js 是否已安裝
try {
    $nodeVersion = node --version
    Write-Host "[System] ✅ 環境檢查通過：Node.js $nodeVersion 已就緒。" -ForegroundColor Green
}
catch {
    Write-Host "[Warning] 系統未偵測到 Node.js。" -ForegroundColor Yellow
    Write-Host "[System] 正在嘗試使用 winget 自動安裝 OpenJS.NodeJS..." -ForegroundColor Cyan
    Write-Host "[System] (若跳出管理員權限請求，請點選「是」)" -ForegroundColor Yellow

    try {
        winget install --id OpenJS.NodeJS -e --source winget --accept-source-agreements --accept-package-agreements
        
        if ($LASTEXITCODE -ne 0) {
            throw "安裝失敗"
        }

        Write-Host "[System] ✅ Node.js 安裝完成！" -ForegroundColor Green
        Write-Host "[System] ⚠️ 請關閉此視窗，並重新執行 start.ps1 以完成設定。" -ForegroundColor Yellow
        pause
        exit
    }
    catch {
        Write-Host "[Error] 自動安裝失敗，請手動前往 https://nodejs.org/ 安裝 Node.js 後再重試。" -ForegroundColor Red
        pause
        exit 1
    }
}

# ====================== 前端建置 ======================
Write-Host ""
Write-Host "[System] 1/4 正在下載套件並編譯前端 (Download & Build Frontend)..." -ForegroundColor Cyan

Set-Location -Path "frontend"
npm install
if ($LASTEXITCODE -ne 0) { 
    Write-Host "[Error] npm install 失敗" -ForegroundColor Red
    pause; exit 1 
}

npm run build
if ($LASTEXITCODE -ne 0) { 
    Write-Host "[Error] npm run build 失敗" -ForegroundColor Red
    pause; exit 1 
}
Set-Location -Path ".."

# ====================== 複製前端檔案 ======================
Write-Host ""
Write-Host "[System] 2/4 正在整合前端靜態檔案至後端 (Copy Static Files)..." -ForegroundColor Cyan

$publicPath = "backend\public"

if (Test-Path $publicPath) {
    Remove-Item -Path $publicPath -Recurse -Force -ErrorAction SilentlyContinue
}
New-Item -ItemType Directory -Path $publicPath -Force | Out-Null

Copy-Item -Path "frontend\dist\*" -Destination $publicPath -Recurse -Force

Write-Host "[System] ✅ 前端檔案複製完成。" -ForegroundColor Green

# ====================== 後端準備 ======================
Write-Host ""
Write-Host "[System] 3/4 正在準備後端與外掛套件 (Backend Setup)..." -ForegroundColor Cyan

Set-Location -Path "backend"
npm install
if ($LASTEXITCODE -ne 0) { 
    Write-Host "[Error] 後端 npm install 失敗" -ForegroundColor Red
    pause; exit 1 
}
Set-Location -Path ".."

# ====================== 啟動 Lilith ======================
Write-Host ""
Write-Host "[System] 4/4 正在啟動 Lilith..." -ForegroundColor Cyan

Set-Location -Path "backend"
node main.js