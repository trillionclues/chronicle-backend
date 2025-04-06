import { Router } from "express";
import loginWithGoogle from "../controllers/authController";

const router = Router();

router.post("/login", loginWithGoogle);

export default router;
