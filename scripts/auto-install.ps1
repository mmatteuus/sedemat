param(
  [string]$BasePath = "",
  [string]$RepoUrl = "https://github.com/mmatteuus/sedemat.git",
  [string]$Branch = "main",
  [switch]$SetBasePath
)

$ErrorActionPreference = "Stop"
$workDir = Join-Path $env:TEMP "sedemat-auto-install"

if (Test-Path $workDir) {
  Write-Host "Limpando pasta temporaria anterior..." -ForegroundColor Yellow
  Remove-Item $workDir -Recurse -Force
}

Write-Host "Baixando repositorio $RepoUrl (branch $Branch)..." -ForegroundColor Cyan
git clone --depth 1 --branch $Branch $RepoUrl $workDir

Push-Location $workDir

Write-Host "Instalando dependencias (npm install)..." -ForegroundColor Yellow
npm install

Write-Host "Gerando instalador desktop (npm run desktop:build)..." -ForegroundColor Yellow
npm run desktop:build

if ($SetBasePath -and $BasePath) {
  [Environment]::SetEnvironmentVariable("SEDEMAT_BASE_PATH", $BasePath, "Machine")
  Write-Host "Variavel SEDEMAT_BASE_PATH configurada: $BasePath" -ForegroundColor Green
} else {
  Write-Host "SEDEMAT_BASE_PATH NAO foi definida. Configure pelo app (Administrador > Caminho base) apos instalar." -ForegroundColor Yellow
}

$installer = Get-ChildItem -Path (Join-Path $workDir "release") -Filter "Pastas-SEDEMAT-*-Setup.exe" -Recurse |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1

if (-not $installer) {
  throw "Instalador nao encontrado em release/. Verifique se o build foi gerado."
}

Write-Host "Executando instalador em modo silencioso..." -ForegroundColor Yellow
& $installer.FullName /S | Out-Null

Pop-Location
Write-Host "Instalacao concluida. Abra Pastas SEDEMAT pelo menu iniciar." -ForegroundColor Green
