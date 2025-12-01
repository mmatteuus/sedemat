param(
  [string]$BasePath = "\\serv-arquivos\ARQUIVOS\MEIO AMBIENTE",
  [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"

Write-Host "Instalando Pastas SEDEMAT..." -ForegroundColor Cyan
Write-Host "BasePath: $BasePath"

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $repoRoot

# Instala dependencias e builda se nao for pulado
if (-not $SkipBuild) {
  Write-Host "Baixando dependencias (npm install)..." -ForegroundColor Yellow
  npm install

  Write-Host "Gerando instalador desktop (npm run desktop:build)..." -ForegroundColor Yellow
  npm run desktop:build
}

# Define variavel de ambiente para o caminho base (nivel maquina)
[Environment]::SetEnvironmentVariable("SEDEMAT_BASE_PATH", $BasePath, "Machine")
Write-Host "Variavel de ambiente SEDEMAT_BASE_PATH configurada." -ForegroundColor Green

# Localiza o instalador mais recente
$installer = Get-ChildItem -Path "$repoRoot\release" -Filter "Pastas-SEDEMAT-*-Setup.exe" -Recurse |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1

if (-not $installer) {
  throw "Instalador nao encontrado em release/. Execute npm run desktop:build antes."
}

Write-Host "Executando instalador: $($installer.FullName)" -ForegroundColor Yellow
& $installer.FullName /S | Out-Null

Write-Host "Instalacao concluida. Abra Pastas SEDEMAT pelo menu iniciar." -ForegroundColor Green
Write-Host "Se precisar alterar o caminho base depois, atualize SEDEMAT_BASE_PATH e reinstale/abra novamente."
