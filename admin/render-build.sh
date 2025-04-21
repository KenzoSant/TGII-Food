#!/bin/bash
cd admin
npm install --force
chmod -R 755 node_modules/.bin
npm run build