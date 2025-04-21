#!/bin/bash
cd admin
npm ci --unsafe-perm --legacy-peer-deps
chmod -R 755 node_modules/.bin
npm run build