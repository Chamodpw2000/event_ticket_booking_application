#!/bin/sh
set -e

if [ -f /app/.runtime-env ]; then
	. /app/.runtime-env
fi

echo "Running Prisma migrations..."
npx prisma migrate deploy
echo "Starting service..."
exec node index.js