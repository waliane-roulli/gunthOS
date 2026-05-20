import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// Placeholder table — add real tables per feature as needed
export const appMeta = sqliteTable("app_meta", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const visitors = sqliteTable("visitors", {
  id: integer("id").primaryKey(),
  count: integer("count").notNull().default(0),
});
