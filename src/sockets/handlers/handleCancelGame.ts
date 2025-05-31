import Game from "../../models/Game";
import { AuthenticatedSocket } from "../../types/authSocketType";
import { Server } from "socket.io";
import { sendGameStateToClients } from "../../utils/gameUtils";

const handleCancelGame = async (
  socket: AuthenticatedSocket,
  io: Server,
  gameId: string
) => {
  try {
    const game = await Game.findById(gameId);
    const userId = socket.user?.id;

    if (!userId) {
      socket.emit("error", { message: "User not authenticated" });
      return;
    }

    if (!game) {
      socket.emit("error", { message: "Game not found" });
      return;
    }

    if (game.phase !== "waiting") {
      socket.emit("error", {
        message: "Game cannot be canceled after it has started",
      });
      return;
    }

    const creator = game.participants.find(
      (p) => p.isCreator && p.userId.toString() === userId
    );
    if (!creator) {
      socket.emit("error", {
        message: "Only the creator can cancel the game",
      });
      return;
    }

    game.phase = "canceled";
    await game.save();
    sendGameStateToClients(gameId, io);
  } catch (error) {
    socket.emit("error", { message: "Error canceling game" });
  }
};

export default handleCancelGame;
