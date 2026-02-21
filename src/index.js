const app = require("./app");
const { initializeDatabase } = require("./db");

let isInitialized = false;

module.exports = async (req, res) => {
  try {
    if (!isInitialized) {
      await initializeDatabase();
      isInitialized = true;
      console.log("Database initialized");
    }

    return app(req, res);
  } catch (error) {
    console.error("Error in serverless function:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};