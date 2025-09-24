const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const routes = require("./routes");
const app = express();
const PORT = process.env.PORT || 3002;

// Global safeguards to prevent hard crashes on unexpected async errors
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Promise rejection:", reason && reason.stack ? reason.stack : reason);
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err && err.stack ? err.stack : err);
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static("client/build"));

mongoose.Promise = global.Promise;

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/nytreact";

// Expose a quick flag for connection status
function isDbConnected() {
  // 1 = connected
  return mongoose.connection && mongoose.connection.readyState === 1;
}

// If DB is not connected, short‑circuit API requests with a 503 instead of crashing later
// Lightweight healthcheck (always available, even if DB is down)
app.get("/api/health", (req, res) => {
  res.json({ dbConnected: isDbConnected() });
});

app.use("/api", (req, res, next) => {
  if (!isDbConnected()) {
    return res.status(503).json({
      error: "Database unavailable",
      message: "MongoDB is not connected. Start MongoDB or set MONGODB_URI to a reachable instance.",
    });
  }
  next();
});

// Handle initial connection errors gracefully to avoid crashing the app
mongoose.connection.on("error", err => {
  console.error("MongoDB connection error:", err && err.message ? err.message : err);
  console.error("Ensure MongoDB is running and MONGODB_URI is correct.");
});

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected. The app will continue running and will retry connection.");
});

mongoose.connection.once("open", () => {
  console.log("✅ MongoDB connected");
});

// Attempt a lightweight TCP reachability check for local Mongo before connecting
const url = require("url");
const net = require("net");
let shouldConnectToMongo = true;
try {
  const parsed = url.parse(MONGODB_URI);
  const host = (parsed.hostname || "").toLowerCase();
  const port = Number(parsed.port || 27017);
  const isLocal = host === "localhost" || host === "127.0.0.1";

  if (isLocal) {
    // For local dev, check if the port is accepting connections to avoid driver-level crashes
    const socket = new net.Socket();
    socket.setTimeout(300);
    shouldConnectToMongo = false;
    socket
      .once("connect", () => {
        shouldConnectToMongo = true;
        socket.destroy();
        startMongoose();
      })
      .once("timeout", () => {
        console.warn(`MongoDB not reachable at ${host}:${port}. Skipping DB connect; API will return 503 for DB routes.`);
        socket.destroy();
      })
      .once("error", () => {
        console.warn(`MongoDB not reachable at ${host}:${port}. Skipping DB connect; API will return 503 for DB routes.`);
      })
      .connect(port, host);
  } else {
    // Remote URI: try connecting immediately; network may be available
    startMongoose();
  }
} catch (e) {
  console.warn("Could not pre-check MongoDB reachability. Proceeding without DB connection:", e && e.message ? e.message : e);
}

function startMongoose() {
  // Initiate connection (Mongoose 7 returns a promise). Catch to avoid unhandled rejections.
  mongoose
    .connect(MONGODB_URI)
    .catch(err => {
      // Already handled by connection 'error' listener; this catch prevents unhandled rejection crashes
      console.error("Mongoose connect() failed:", err && err.message ? err.message : err);
    });
}

app.use(routes);

app.listen(PORT, function() {
  console.log(`🌎  ==> API Server now listening on PORT ${PORT}!`);
});