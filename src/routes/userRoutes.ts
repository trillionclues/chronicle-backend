import { Router } from "express";
import {
  getProfile,
  login,
  updateProfile,
} from "../controllers/userController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.post("/login", login);
router.get("/profile", authMiddleware, getProfile);
router.get("/profile", authMiddleware, updateProfile);

export default router;
