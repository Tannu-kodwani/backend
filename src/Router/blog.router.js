const express = require("express");
const blogRouter = express.Router();
const handleFileUpload = require("../Middleware/multer.middleware");
const blogsCrudController = require("../Controller/blog.controller");

// Route to create a new blog
blogRouter.post(
  "/create-blog",
  handleFileUpload,
  blogsCrudController.createBlog
);

// Route to update an existing blog
blogRouter.put(
  "/update-blog/:id",
  handleFileUpload,
  blogsCrudController.updateBlog
);

// Route to delete a blog
blogRouter.delete("/delete-blog/:id", blogsCrudController.deleteBlog);

// Route to get all blogs
blogRouter.get("/get-blogs", blogsCrudController.getAllBlogs);

// Route to get a blog by ID
blogRouter.get("/get-blog/:id", blogsCrudController.getBlogById);

module.exports = blogRouter;
