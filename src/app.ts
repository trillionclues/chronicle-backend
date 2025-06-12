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
    console.log("Headers:", socket.handshake.headers);
    console.log("Query:", socket.handshake.query);

    let token = socket.handshake.headers.authorization || socket.handshake.query.token;

    if (!token) {
      return next(new Error("Authentication error: No authorization header or token"));
    }

    // Handle "Bearer token" and raw token formats
    if (token.startsWith("Bearer ")) {
      token = token.substring(7);
    }

    const user = await authenticateFirebaseToken(token);
    if (!user) {
      throw new Error("Invalid token");
    }

    (socket as any).user = {
      id: user._id.toString(),
      firebaseId: user.firebaseId,
      name: user.name,
      photoUrl: user.photoUrl,
    };

    next();
  } catch (error) {
    next(new Error("Authentication error"));
  }
});

// socket.io game setup
setupGameSockets(io);

// regular http routes
app.use("/api/games", gameRoutes);
app.use("/api/users", userRoutes);

server.listen(config.port, () => {
  console.log(`🚀 Server running on port ${config.port}`);
});
