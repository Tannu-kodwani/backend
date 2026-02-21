const { drizzle } = require("drizzle-orm/libsql");
const tursoClient = require("./config");
const { blogs } = require("./schema");

const db = drizzle(tursoClient, { schema: { blogs } });

// Function to initialize database (create table if not exists)
const initializeDatabase = async () => {
  try {
    await tursoClient.execute(`
      CREATE TABLE IF NOT EXISTS blogs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        small_description TEXT NOT NULL,
        main_description TEXT NOT NULL,
        author_name TEXT NOT NULL,
        estimate_read_time INTEGER NOT NULL,
        category TEXT NOT NULL,
        tags TEXT NOT NULL,
        blog_image TEXT NOT NULL,
        blog_image_file_id TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Database initialization failed:", error.message);
    throw error;
  }
};

module.exports = { db, initializeDatabase };
