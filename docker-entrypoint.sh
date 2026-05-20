#!/bin/sh
set -e

echo "Running database migrations..."
node -e "
const { migrate } = require('drizzle-orm/better-sqlite3/migrator');
const Database = require('better-sqlite3');
const { drizzle } = require('drizzle-orm/better-sqlite3');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const sqlite = new Database(path.join(dataDir, 'app.db'));
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

const db = drizzle(sqlite);
migrate(db, { migrationsFolder: path.join(process.cwd(), 'drizzle') });
console.log('Migrations complete.');
sqlite.close();
"

echo "Starting Next.js..."
exec node server.js
