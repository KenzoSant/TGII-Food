#!/bin/bash
cd frontend
npm install --force
chmod -R 755 node_modules/.bin
npm run build