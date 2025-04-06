import express, { json, urlencoded } from "express";
import cors from "cors";
import http from "http";
import mongoose from "mongoose";
import config from "./config/config";
import socketIo from "socket.io";
import gameRoutes from "./routes/gameRoutes";
import userRoutes from "./routes/userRoutes";
import setupGameSockets from "./sockets/gameSockets";
import { authenticateFirebaseToken } from "./middleware/authMiddleware";

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

const server = http.createServer(app);
const io = new socketIo.Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.headers.authorization;
    console.log(socket.handshake.headers);

    const user = await authenticateFirebaseToken(token!);
    if (!user) throw new Error("Invalid token");
    (socket as any) = user;
    next();
  } catch (error) {
    next(new Error("Authentication error"));
  }
});

setupGameSockets(io);

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use("/api/games", gameRoutes);
app.use("/api/users", userRoutes);

app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).send({ error: "Something went wrong!" });
  }
);

server.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
