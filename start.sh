#!/bin/bash
#./start.sh

# Navigate to the server directory and start the server
cd /Users/s2200692/React-web-apps/Talosave/ts-backend/
npm install
node server.js &

# Navigate to the client directory and start the client
cd /Users/s2200692/React-web-apps/Talosave/ts-frontend/
npm install
npm run dev &

# Wait for all background processes to finish
wait