import { AuthenticatedSocket } from "../../types/authSocketType";
import { Server } from "socket.io";
import {
  endVotingPhase,
  endWritingPhase,
  sendGameStateToClients,
} from "../../utils/gameUtils";
import Game from "../../models/Game";

const handleManualNextPhase = async (
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

    const creator = game.participants.find(
      (p) => p.isCreator && p.userId.toString() === socket.user?.id
    );
    if (!creator) {
      socket.emit("error", {
        message: "Only the creator can advance the game phase",
      });
      return;
    }

    if (game.phase === "writing") {
      await endWritingPhase(gameId, io);
    } else if (game.phase === "voting") {
      await endVotingPhase(gameId, io);
    }

    await game.save();
    sendGameStateToClients(gameId, io);
  } catch (error) {
    socket.emit("error", { message: "Error advancing phase" });
  }
};

export default handleManualNextPhase;
