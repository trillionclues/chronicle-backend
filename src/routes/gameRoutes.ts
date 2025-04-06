import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import {
  checkGameByCode,
  createGame,
  getGame,
  getUserGames,
  joinGame,
} from "../controllers/gameController";

const router = Router();

router.post("/create", authMiddleware, createGame);
router.get("/user-games", authMiddleware, getUserGames);
router.post("/:gameId/join", authMiddleware, joinGame);
router.get("/:gameId", authMiddleware, getGame);
router.get("/check/:gameCode", authMiddleware, checkGameByCode);

export default router;
