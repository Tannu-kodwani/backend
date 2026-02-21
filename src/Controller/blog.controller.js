const { db } = require("../db");
const { blogs } = require("../db/schema");
const { eq } = require("drizzle-orm");
const { uploadImage, deleteImage } = require("../utils/imagekit.util");

// Valid categories
const VALID_CATEGORIES = [
  "nutrition",
  "yoga",
  "meditation",
  "life coaching",
  "wellness",
  "lifestyle",
];

const blogsCrudController = {
  createBlog: async (req, res) => {
    try {
      const {
        title,
        smallDescription,
        mainDescription,
        authorName,
        estimateReadTime,
        category,
        tags,
      } = req.body;

      // Validation
      if (
        !title ||
        !smallDescription ||
        !mainDescription ||
        !authorName ||
        !estimateReadTime ||
        !category
      ) {
        return res.status(400).json({
          success: false,
          message: "All fields are required",
        });
      }

      // Validate category
      if (!VALID_CATEGORIES.includes(category.toLowerCase())) {
        return res.status(400).json({
          success: false,
          message: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(
            ", "
          )}`,
        });
      }

      // Check if image is uploaded
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Blog image is required",
        });
      }

      // Parse tags (should be array or JSON string)
      let parsedTags = [];
      if (tags) {
        try {
          parsedTags = typeof tags === "string" ? JSON.parse(tags) : tags;
          if (!Array.isArray(parsedTags)) {
            throw new Error("Tags must be an array");
          }
        } catch (error) {
          return res.status(400).json({
            success: false,
            message: "Invalid tags format. Must be an array of strings",
          });
        }
      }

      // Upload image to ImageKit
      const imageResult = await uploadImage(
        req.file.buffer,
        `blog_${Date.now()}_${req.file.originalname}`
      );

      console.log("Uploaded image to ImageKit:", imageResult);

      // Insert blog into database
      const result = await db.insert(blogs).values({
        title,
        smallDescription,
        mainDescription, // Rich text HTML content
        authorName,
        estimateReadTime: parseInt(estimateReadTime),
        category: category.toLowerCase(),
        tags: JSON.stringify(parsedTags),
        blogImage: imageResult.url,
        blogImageFileId: imageResult.fileId,
        createdAt: new Date().toISOString(),
      });

      // Fetch the created blog
      const createdBlog = await db
        .select()
        .from(blogs)
        .where(eq(blogs.id, result.lastInsertRowid))
        .limit(1);

      const blogData = {
        ...createdBlog[0],
        tags: JSON.parse(createdBlog[0].tags),
      };

      res.status(201).json({
        success: true,
        message: "Blog created successfully",
        data: blogData,
      });
    } catch (error) {
      console.error("Create blog error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create blog",
        error: error.message,
      });
    }
  },

  updateBlog: async (req, res) => {
    try {
      const { id } = req.params;

      // Check if blog exists
      const existingBlog = await db
        .select()
        .from(blogs)
        .where(eq(blogs.id, parseInt(id)))
        .limit(1);

      if (existingBlog.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Blog not found",
        });
      }

      const currentBlog = existingBlog[0];
      const updateData = {};

      // Build update object with only provided fields
      if (req.body.title) updateData.title = req.body.title;
      if (req.body.smallDescription)
        updateData.smallDescription = req.body.smallDescription;
      if (req.body.mainDescription)
        updateData.mainDescription = req.body.mainDescription;
      if (req.body.authorName) updateData.authorName = req.body.authorName;
      if (req.body.estimateReadTime)
        updateData.estimateReadTime = parseInt(req.body.estimateReadTime);

      if (req.body.category) {
        if (!VALID_CATEGORIES.includes(req.body.category.toLowerCase())) {
          return res.status(400).json({
            success: false,
            message: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(
              ", "
            )}`,
          });
        }
        updateData.category = req.body.category.toLowerCase();
      }

      if (req.body.tags) {
        try {
          const parsedTags =
            typeof req.body.tags === "string"
              ? JSON.parse(req.body.tags)
              : req.body.tags;
          if (!Array.isArray(parsedTags)) {
            throw new Error("Tags must be an array");
          }
          updateData.tags = JSON.stringify(parsedTags);
        } catch (error) {
          return res.status(400).json({
            success: false,
            message: "Invalid tags format. Must be an array of strings",
          });
        }
      }

      // Handle image update
      if (req.file) {
        // DELETE OLD CODE - Remove the extractFileIdFromUrl section

        // NEW CODE - Use stored fileId
        if (currentBlog.blogImageFileId) {
          console.log("Deleting old image:", currentBlog.blogImageFileId);
          await deleteImage(currentBlog.blogImageFileId);
        }

        // Upload new image
        const imageResult = await uploadImage(
          req.file.buffer,
          `blog_${Date.now()}_${req.file.originalname}`
        );
        updateData.blogImage = imageResult.url;
        updateData.blogImageFileId = imageResult.fileId; // ADD THIS LINE
      }

      // Check if there's anything to update
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          message: "No fields to update",
        });
      }

      // Update blog
      await db
        .update(blogs)
        .set(updateData)
        .where(eq(blogs.id, parseInt(id)));

      // Fetch updated blog
      const updatedBlog = await db
        .select()
        .from(blogs)
        .where(eq(blogs.id, parseInt(id)))
        .limit(1);

      const blogData = {
        ...updatedBlog[0],
        tags: JSON.parse(updatedBlog[0].tags),
      };

      res.status(200).json({
        success: true,
        message: "Blog updated successfully",
        data: blogData,
      });
    } catch (error) {
      console.error("Update blog error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update blog",
        error: error.message,
      });
    }
  },

  deleteBlog: async (req, res) => {
    try {
      const { id } = req.params;

      // Check if blog exists
      const existingBlog = await db
        .select()
        .from(blogs)
        .where(eq(blogs.id, parseInt(id)))
        .limit(1);

      if (existingBlog.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Blog not found",
        });
      }

      const blog = existingBlog[0];

      // Delete blog from database
      if (blog.blogImageFileId) {
        console.log("Deleting image from ImageKit:", blog.blogImageFileId);
        await deleteImage(blog.blogImageFileId);
      }

      await db.delete(blogs).where(eq(blogs.id, parseInt(id)));

      res.status(200).json({
        success: true,
        message: "Blog deleted successfully",
      });
    } catch (error) {
      console.error("Delete blog error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete blog",
        error: error.message,
      });
    }
  },

  getAllBlogs: async (req, res) => {
    try {
      const { category } = req.query;

      let allBlogs;

      if (category && category !== "all") {
        // Validate category
        if (!VALID_CATEGORIES.includes(category.toLowerCase())) {
          return res.status(400).json({
            success: false,
            message: `Invalid category. Must be one of: all, ${VALID_CATEGORIES.join(
              ", "
            )}`,
          });
        }

        // Fetch blogs by category
        allBlogs = await db
          .select()
          .from(blogs)
          .where(eq(blogs.category, category.toLowerCase()));
      } else {
        // Fetch all blogs
        allBlogs = await db.select().from(blogs);
      }

      // Parse tags for each blog
      const blogsData = allBlogs.map((blog) => ({
        ...blog,
        tags: JSON.parse(blog.tags),
      }));

      res.status(200).json({
        success: true,
        message: "Blogs retrieved successfully",
        count: blogsData.length,
        data: blogsData,
      });
    } catch (error) {
      console.error("Get all blogs error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve blogs",
        error: error.message,
      });
    }
  },

  getBlogById: async (req, res) => {
    try {
      const { id } = req.params;

      const blog = await db
        .select()
        .from(blogs)
        .where(eq(blogs.id, parseInt(id)))
        .limit(1);

      if (blog.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Blog not found",
        });
      }

      const blogData = {
        ...blog[0],
        tags: JSON.parse(blog[0].tags),
      };

      res.status(200).json({
        success: true,
        message: "Blog retrieved successfully",
        data: blogData,
      });
    } catch (error) {
      console.error("Get blog by ID error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve blog",
        error: error.message,
      });
    }
  },
};

module.exports = blogsCrudController;
