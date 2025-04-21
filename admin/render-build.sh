#!/bin/bash
cd admin
npm install --unsafe-perm
npm rebuild vite
chmod -R 755 node_modules/.bin
npm run build