import admin from "../config/firebase";
import User from "../models/User";
import { Request, Response } from "express";

const loginWithGoogle = async (req: Request, res: Response) => {
  const idToken = req.headers.authorization?.split("Bearer ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken!);
    const { uid, displayName, photoURL } = decodedToken;

    let user = await User.findOne({ firebaseId: uid });
    if (!user) {
      user = await User.create({
        firebaseId: uid,
        name: displayName,
        photoURL,
      });
    }

    res.json({ user });
  } catch (error) {
    res.status(401).json({ error: "Unauthorized" });
  }
};

export default loginWithGoogle;
