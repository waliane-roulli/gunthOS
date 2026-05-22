const { migrate } = require("drizzle-orm/better-sqlite3/migrator");
const { drizzle } = require("drizzle-orm/better-sqlite3");
const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const sqlite = new Database(path.join(dataDir, "app.db"));
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

const db = drizzle(sqlite);
migrate(db, { migrationsFolder: path.join(__dirname, "drizzle") });

const adminUsername = process.env.ADMIN_USERNAME;
if (adminUsername) {
  const result = sqlite.prepare("UPDATE user SET role = 'admin' WHERE username = ? AND role != 'admin'").run(adminUsername);
  if (result.changes > 0) console.log(`admin: '${adminUsername}' promu admin`);
}

sqlite.close();

console.log("migrations done");
