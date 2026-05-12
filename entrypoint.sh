#!/bin/sh

echo "Waiting for postgres..."

until nc -z kadastr-pgsql 5432; do
  sleep 2
done

echo "Postgres started"

echo "Running migrations..."
npm run migration:run

echo "Starting NestJS..."
node dist/main.js
