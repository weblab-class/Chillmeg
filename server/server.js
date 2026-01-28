const validator = require("./validator");
validator.checkSetup();

require("dotenv").config();

const http = require("http");
const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const path = require("path");

const api = require("./api");
const auth = require("./auth");

const splatsRouter = require("./routes/splats");
const meRouter = require("./routes/me");

const mongoConnectionURL = process.env.MONGO_SRV;
const databaseName = "PlaybackXR";

mongoose.set("strictQuery", false);

const app = express();
app.set("trust proxy", true);

app.use(validator.checkRoutes);
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(auth.populateCurrentUser);

app.use("/api/splats", splatsRouter);
app.use("/api/me", meRouter);

// keep the skeleton API last so /api/login still works
app.use("/api", api);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

if (process.env.NODE_ENV === "production") {
  const reactPath = path.resolve(__dirname, "..", "client", "dist");
  app.use(express.static(reactPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(reactPath, "index.html"));
  });
}

app.use((err, req, res, next) => {
  const status = err.status || 500;
  if (status === 500) console.log(err);
  res.status(status).send({ status, message: err.message });
});

const port = process.env.PORT || 3000;
const server = http.Server(app);

(async () => {
  try {
    await mongoose.connect(mongoConnectionURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: databaseName,
    });
    console.log("Connected to MongoDB");

    server.listen(port, () => {
      console.log(`Server running on port: ${port}`);
    });
  } catch (err) {
    console.log(`Error connecting to MongoDB: ${err}`);
  }
})();
