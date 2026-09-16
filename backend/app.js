require('dotenv').config();
const connectDB = require("./config/db");
const express = require("express");

const app = express();
const cultureRouter = require("./routes/cultureRouter");
const { unknownEndpoint, errorHandler } = require("./middleware/customMiddleware");

connectDB();

const morgan = require("morgan");
app.use(morgan("dev"));

// Middleware

app.use(express.json());

app.get('/', (req, res) => {
  res.send('API is running');
});

// Use the cultureRouter for all "/api/cultures" routes
app.use("/api/cultures", cultureRouter);

app.get('/error', (req, res, next) => {
  const error = new Error("Network problem");
  next(error);
});

app.use(unknownEndpoint);
app.use(errorHandler);

const port = process.env.PORT || 4000;

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});