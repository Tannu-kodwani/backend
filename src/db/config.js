const { createClient } = require("@libsql/client");
require("dotenv").config();

const tursoClient = createClient({
  url: process.env.TURSO_URL,
  authToken: process.env.TURSO_KEY,
});

module.exports = tursoClient;
