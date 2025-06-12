import express, { json, urlencoded } from "express";
import cors from "cors";
import http from "http";
import mongoose from "mongoose";
import config from "./config/config";
import socketIo from "socket.io";
import gameRoutes from "./routes/gameRoutes";
import userRoutes from "./routes/userRoutes";
import { authenticateFirebaseToken } from "./middleware/authMiddleware";
import setupGameSockets from "./sockets";

const app = express();

app.use(cors());
app.use(urlencoded({ extended: false }));
app.use(json());

mongoose
  .connect(config.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// socket.io server
const server = http.createServer(app);
const io = new socketIo.Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// socket authentication middleware, attach user to socket
io.use(async (socket, next) => {
  try {
    console.log("=== SOCKET AUTHENTICATION DEBUG ===");
    console.log("Socket ID:", socket.id);
    console.log("Headers:", JSON.stringify(socket.handshake.headers, null, 2));
    console.log("Query:", JSON.stringify(socket.handshake.query, null, 2));
    console.log("Auth header:", socket.handshake.headers.authorization);
    console.log("Query token:", socket.handshake.query.token);

    // Get token from headers or query parameters
    let token: string | undefined

    // Try to get from authorization header first
    const authHeader = socket.handshake.headers.authorization
    if (authHeader && typeof authHeader === "string") {
      console.log("Found auth header:", authHeader.substring(0, 20) + "...");
      token = authHeader
    }

    // If no auth header, try query parameter
    if (!token) {
      const queryToken = socket.handshake.query.token
      if (queryToken) {
        // Handle both string and string[] cases
        token = Array.isArray(queryToken) ? queryToken[0] : queryToken
        console.log("Found query token:", typeof token, token ? token.substring(0, 20) + "..." : "null");
      }
    }

    if (!token) {
      console.log("❌ No token found in headers or query");
      return next(new Error("Authentication error: No authorization header or token"))
    }

    // Handle "Bearer token" format
    if (token.startsWith("Bearer ")) {
      token = token.substring(7)
      console.log("Extracted Bearer token:", token.substring(0, 20) + "...");
    }

    console.log("Attempting to authenticate token...");
    const user = await authenticateFirebaseToken(token)
    if (!user) {
      console.log("❌ Token authentication failed");
      throw new Error("Invalid token")
    }

    console.log("✅ User authenticated:", user.name, user.firebaseId);
    ;(socket as any).user = {
      id: user._id.toString(),
      firebaseId: user.firebaseId,
      name: user.name,
      photoUrl: user.photoUrl,
    }

    console.log("=== AUTHENTICATION SUCCESS ===");
    next()
  } catch (error) {
    console.error("❌ Socket authentication error:", error);
    next(new Error("Authentication error"))
  }
})

// socket.io game setup
setupGameSockets(io);

// regular http routes
app.use("/api/games", gameRoutes);
app.use("/api/users", userRoutes);

server.listen(config.port, () => {
  console.log(`🚀 Server running on port ${config.port}`);
});
