import admin from "../config/firebase"
import User from "../models/User"

const authMiddleware = async (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split("Bearer ")[1]
  if (!token) return res.status(403).json({ error: "No token provided" })

  try {
    const decodedToken = await admin.auth().verifyIdToken(token)
    const user = await User.findOne({ firebaseId: decodedToken.uid })

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    req.user = {
      id: user._id,
      email: decodedToken.email,
      name: user.name,
    }
    next()
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized" })
  }
}

const authenticateFirebaseToken = async (token: string) => {
  if (!token) {
    throw new Error("No token provided")
  }

  try {
    console.log("🔍 Verifying Firebase token...")
    const decodedToken = await admin.auth().verifyIdToken(token)
    console.log("✅ Token verified successfully for user:", decodedToken.uid)

    console.log("🔍 Looking up user in database...")
    const user = await User.findOne({ firebaseId: decodedToken.uid })

    if (!user) {
      console.log("❌ User not found in database for firebaseId:", decodedToken.uid)
      console.log("🔧 Creating user automatically...")

      // Auto-create user if they don't exist
      const newUser = await User.create({
        firebaseId: decodedToken.uid,
        name: decodedToken.name || decodedToken.email || "Unknown User",
        photoUrl: decodedToken.picture || "",
      })

      console.log("✅ User created successfully:", newUser._id)
      return newUser
    }

    console.log("✅ User found in database:", user._id)
    return user
  } catch (error) {
    console.error("❌ Authentication error details:", error)

    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("Firebase ID token has expired")) {
        throw new Error("Token expired")
      } else if (error.message.includes("Firebase ID token has invalid signature")) {
        throw new Error("Invalid token signature")
      } else if (error.message.includes("Firebase ID token has been revoked")) {
        throw new Error("Token revoked")
      } else {
        throw new Error(`Authentication failed: ${error.message}`)
      }
    }

    throw new Error("Unauthorized")
  }
}

export { authMiddleware, authenticateFirebaseToken }
