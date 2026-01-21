/*
|--------------------------------------------------------------------------
| server.js
|--------------------------------------------------------------------------
| This is the entry point for your backend.
| It sets up Express, sessions, auth, API routes, static uploads, and starts the server.
|
| Key idea:
| 1) Configure middleware and routes
| 2) Connect to MongoDB
| 3) Seed default data
| 4) Start listening on port 3000
*/

const validator = require("./validator");
validator.checkSetup(); // staff provided checks, keep this

require("dotenv").config(); // loads .env into process.env

// Core libraries
const http = require("http");
const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const path = require("path");

// Your project modules
const api = require("./api"); // existing skeleton API routes
const auth = require("./auth"); // populateCurrentUser middleware
const socketManager = require("./server-socket"); // socket.io init

// Mongo config
const mongoConnectionURL = process.env.MONGO_SRV; // from your .env
const databaseName = "PlaybackXR"; // your db name

// Mongoose setting that avoids warnings
mongoose.set("strictQuery", false);

// Create the Express app
const app = express();
app.set("trust proxy", true);

// Staff validator that checks route setup
app.use(validator.checkRoutes);

// Parse JSON bodies for normal POST requests (not FormData)
app.use(express.json());

/*
|--------------------------------------------------------------------------
| Sessions
|--------------------------------------------------------------------------
| This stores a session cookie in the browser.
| When user logs in, their user id is saved in session.
| Every future request sends the cookie automatically (when credentials include is used).
*/
app.use(
  session({
    secret: process.env.SESSION_SECRET, // MUST exist in .env
    resave: false,
    saveUninitialized: false,
  })
);

/*
|--------------------------------------------------------------------------
| Auth middleware
|--------------------------------------------------------------------------
| This reads the session cookie and sets req.user if logged in.
| Many routes use requireUser which checks req.user exists.
*/
app.use(auth.populateCurrentUser);

/*
|--------------------------------------------------------------------------
| Route mounting
|--------------------------------------------------------------------------
| IMPORTANT:
| /api/maps/...  handled by mapsRouter
| /api/upload/... handled by uploadRouter
| /api/luma/... handled by lumaRouter
| /api/... handled by the original skeleton api.js
|
| This is why /api/luma/attach will work only if lumaRouter is mounted here.
*/
const mapsRouter = require("./routes/maps");
const uploadRouter = require("./routes/upload");
const lumaRouter = require("./routes/luma");
const splatsRouter = require("./routes/splats");

app.use("/api/maps", mapsRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/luma", lumaRouter);
app.use("/api/splats", splatsRouter);

app.use("/api", api); // keep the skeleton API last

/*
|--------------------------------------------------------------------------
| Static files for uploaded assets
|--------------------------------------------------------------------------
| Anything saved into server/uploads can be accessed at:
| http://localhost:3000/uploads/<filename>
| And through Vite proxy:
| http://localhost:5173/uploads/<filename>
*/
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/*
|--------------------------------------------------------------------------
| Production build serving
|--------------------------------------------------------------------------
| Only runs when NODE_ENV=production.
| In dev, Vite serves the React app at 5173, so you do not need this.
*/
if (process.env.NODE_ENV === "production") {
  const reactPath = path.resolve(__dirname, "..", "client", "dist");
  app.use(express.static(reactPath));

  // Any unknown route returns React index.html so React Router can handle it
  app.get("*", (req, res) => {
    res.sendFile(path.join(reactPath, "index.html"), (err) => {
      if (err) {
        console.log("Error sending client dist index.html:", err.status || 500);
        res.status(err.status || 500).send("Error sending client dist index.html");
      }
    });
  });
}

/*
|--------------------------------------------------------------------------
| Error handler
|--------------------------------------------------------------------------
| If any route throws an error, it lands here.
*/
app.use((err, req, res, next) => {
  const status = err.status || 500;

  if (status === 500) {
    console.log("The server errored when processing a request!");
    console.log(err);
  }

  res.status(status).send({ status, message: err.message });
});

/*
|--------------------------------------------------------------------------
| HTTP server + sockets
|--------------------------------------------------------------------------
| socketManager.init attaches socket.io to this server.
*/
const port = process.env.PORT || 3000;
const server = http.Server(app);
socketManager.init(server);

/*
| Connect to MongoDB ONCE, then seed, then listen
|--------------------------------------------------------------------------
| This is the part that fixes your earlier version.
| You had mongoose.connect twice. We only do it once here.
*/
(async () => {
  try {
    await mongoose.connect(mongoConnectionURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: databaseName,
    });
    console.log("Connected to MongoDB");

    // Seed the default map and cells (safe to run repeatedly if your seed is written that way)
    const { seedDefaultMap } = require("./seed");
    await seedDefaultMap();

    // Start the server
    server.listen(port, () => {
      console.log(`Server running on port: ${port}`);
    });
  } catch (err) {
    console.log(`Error connecting to MongoDB: ${err}`);
  }
})();
