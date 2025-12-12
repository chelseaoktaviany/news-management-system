#!/bin/sh
set -e

echo "Waiting for MySQL..."
until nc -z news_mysql_container 3306; do
  echo "MySQL is unavailable - sleeping"
  sleep 2
done

echo "MySQL is up!"

echo "Running migrations..."
npx sequelize-cli db:migrate --config src/config/config.json

echo "Seeding database..."
npx sequelize-cli db:seed:all --config src/config/config.json

echo "Starting application..."
npm run start