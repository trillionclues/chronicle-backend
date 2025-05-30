import express, { json, urlencoded } from "express"
import cors from "cors"
import http from "http"
import mongoose from "mongoose"
import config from "./config/config"
import socketIo from "socket.io"
import gameRoutes from "./routes/gameRoutes"
import userRoutes from "./routes/userRoutes"
import setupGameSockets from "./sockets/gameSockets"
import { authenticateFirebaseToken } from "./middleware/authMiddleware"

const app = express()

app.use(cors())
app.use(urlencoded({ extended: false }))
app.use(json())

mongoose
  .connect(config.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
  .then(() => {
    console.log("MongoDB connected")
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err)
  })

const server = http.createServer(app)
const io = new socketIo.Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
})

// Enhanced socket authentication middleware with better logging
io.use(async (socket, next) => {
  try {
    console.log("🔐 Socket auth middleware - checking headers...")
    console.log("Socket ID:", socket.id)
    console.log("Headers:", socket.handshake.headers)

    let token = socket.handshake.headers.authorization

    if (!token) {
      console.log("❌ No authorization header provided")
      return next(new Error("Authentication error: No authorization header"))
    }

    // Handle both "Bearer token" and raw token formats
    if (token.startsWith("Bearer ")) {
      token = token.substring(7)
    }

    console.log(`🔍 Extracted token: ${token.substring(0, 20)}...`)

    const user = await authenticateFirebaseToken(token)
    if (!user) {
      console.log("❌ User authentication failed")
      throw new Error("Invalid token")
    }

    console.log(`✅ User authenticated: ${user.name} (${user._id})`)

    // Properly attach user to socket
    ;(socket as any).user = {
      id: user._id.toString(),
      firebaseId: user.firebaseId,
      name: user.name,
    }

    next()
  } catch (error) {
    console.log("❌ Socket authentication error:", error)
    next(new Error("Authentication error"))
  }
})

setupGameSockets(io)

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`)
  next()
})

app.use("/api/games", gameRoutes)
app.use("/api/users", userRoutes)

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).send({ error: "Something went wrong!" })
})

server.listen(config.port, () => {
  console.log(`🚀 Server running on port ${config.port}`)
})
