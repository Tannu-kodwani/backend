const express = require("express");
const app = express();
const cors = require("cors");

//  CORS Handling:
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Important MiddleWare Configurations:
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Start creating the endpoints:

app.get("/", (req, res) => {
  return res.status(200).json({ message: "Server Starts Serving." });
});

const paymentRouter = require("./Router/payment.router");
const blogRouter = require("./Router/blog.router");

app.use("/api/v1", paymentRouter);
app.use("/api/v1", blogRouter);

module.exports = app;
