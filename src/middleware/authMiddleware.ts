import { NextFunction } from "express";
import admin from "../config/firebase";
import User from "../models/User";

const authMiddleware = async (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split("Bearer ")[1];
  if (!token) return res.status(403).json({ error: "No token provided" });

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const user = await User.findOne({ firebaseId: decodedToken.uid });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    req.user = {
      id: user._id,
      email: decodedToken.email,
      name: user.name,
    };
    next();
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized" });
  }
};

const authenticateFirebaseToken = async (token: string) => {
  if (!token) {
    throw new Error("No token provided");
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const user = await User.findOne({ firebaseId: decodedToken.uid });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  } catch (error) {
    throw new Error("Unauthorized");
  }
};

export { authMiddleware, authenticateFirebaseToken };
