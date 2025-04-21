#!/bin/bash
# Acessa o diretório admin se existir, senão assume que já está nele
if [ -d "admin" ]; then
  cd admin
fi

# Instala dependências com permissões adequadas
npm install --unsafe-perm --legacy-peer-deps
npm install @vitejs/plugin-react --save-dev

# Configura permissões
chmod -R 755 node_modules/.bin

# Executa o build
npm run build