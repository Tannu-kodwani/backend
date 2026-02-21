const { sql } = require("drizzle-orm");
const { integer, sqliteTable, text } = require("drizzle-orm/sqlite-core");

const blogs = sqliteTable("blogs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  smallDescription: text("small_description").notNull(),
  mainDescription: text("main_description").notNull(),
  authorName: text("author_name").notNull(),
  estimateReadTime: integer("estimate_read_time").notNull(),
  category: text("category").notNull(),
  tags: text("tags").notNull(),
  blogImage: text("blog_image").notNull(),
  blogImageFileId: text("blog_image_file_id").notNull(),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
});

module.exports = { blogs };
