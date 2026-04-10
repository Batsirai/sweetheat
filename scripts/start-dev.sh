#!/bin/bash
export PATH="/Users/batsirai/.nvm/versions/node/v22.22.0/bin:$PATH"
export HOME="/Users/batsirai"
cd /Users/batsirai/SweetContent
exec node node_modules/.bin/vite dev --host
