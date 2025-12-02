# Pastas SEDEMAT

Aplicacao desktop (Electron + React + Vite) para acesso organizado aos arquivos da pasta de rede `\\serv-arquivos\ARQUIVOS\MEIO AMBIENTE`, com controle de permissoes por usuario e departamento.

## Funcionalidades
- Login por CPF e senha (regra inicial: primeira letra do nome + 6 primeiros digitos do CPF).
- Perfis: `GESTOR_TI` (administra tudo) e `SERVIDOR` (ve apenas os departamentos liberados).
- Departamentos configuraveis com caminho real, ativo/inativo e flag de acesso padrao (ex.: GERAL SEDEMAT e SCAN).
- Gerenciamento de usuarios (criar, editar, ativar/inativar, redefinir senha).
- Matriz de acessos por usuario x departamento.
- Exploracao de arquivos por departamento com breadcrumb, busca, filtros e preview basico (imagem e PDF).
- Abrir arquivo no aplicativo padrao do Windows ou salvar copia local.

## Como rodar em desenvolvimento (desktop)
1. Instale as dependencias:
   ```bash
   npm install
   ```
2. Inicie o front + Electron (necessario Windows com acesso ao compartilhamento ou use os mocks):
   ```bash
   npm run desktop:dev
   ```
   - O Vite sobe em `http://localhost:5173` e o Electron abre a janela desktop apontando para o mesmo host.

## Como gerar instalador para Windows
1. Gere o build web:
   ```bash
   npm run build
   ```
2. Empacote o app desktop:
   ```bash
   npm run desktop:build
   ```
   - O instalador `.exe` e gerado em `release/`.

## Script de instalacao (Windows)
- Para instalar o app e registrar o caminho da pasta de rede nesta maquina:
  ```powershell
  powershell -ExecutionPolicy Bypass -File scripts/install.ps1 -BasePath "\\serv-arquivos\ARQUIVOS\MEIO AMBIENTE"
  ```
  - Ajuste `-BasePath` se o compartilhamento for diferente. O script seta a variavel `SEDEMAT_BASE_PATH` (nivel maquina), gera o instalador e executa em modo silencioso.
  - Depois basta abrir “Pastas SEDEMAT” pelo menu iniciar.

## Credenciais iniciais
- Gestor TI: CPF `12345678901` / senha `g123456`
- Servidor exemplo: CPF `98765432100` / senha `j987654`

## Observacoes
- O app armazena configuracoes e usuarios em `AppData/Roaming/<Pastas SEDEMAT>/sedemat-data.json`.
- Departamentos com `defaultAccess` (GERAL SEDEMAT e SCAN) sao liberados automaticamente para todos.
- Caso o compartilhamento de rede nao esteja acessivel, o modo de desenvolvimento usa dados mockados.

## Instalacao automatica (baixa do repo + instala)
- Um unico comando para baixar o repositorio, gerar o instalador e instalar:
  ```powershell
  powershell -ExecutionPolicy Bypass -Command "irm https://raw.githubusercontent.com/mmatteuus/sedemat/main/scripts/auto-install.ps1 | iex"
  ```
  - Para definir outro caminho base no mesmo fluxo:
    ```powershell
    powershell -ExecutionPolicy Bypass -Command "irm https://raw.githubusercontent.com/mmatteuus/sedemat/main/scripts/auto-install.ps1 -OutFile auto-install.ps1; ./auto-install.ps1 -BasePath \"\\\\servidor\\compartilhamento\\PASTA\" -SetBasePath"
    ```
  - Requisitos: Git, Node.js/npm e permissao para definir variaveis de ambiente em nivel de maquina (o caminho pode ser configurado depois pelo app, sem usar variavel).
