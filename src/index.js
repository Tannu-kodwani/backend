const app = require("./app");
const { initializeDatabase } = require("./db");
require("dotenv").config({
  path: "./.env",
});

const PORT = process.env.PORT || 3030;

// Initialize database and start server
const startServer = async () => {
  try {
    // Initialize Turso database
    await initializeDatabase();

    app.listen(PORT, () => {
      console.log(`Server starts serving on port http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
