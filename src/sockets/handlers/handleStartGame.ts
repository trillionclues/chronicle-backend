import Game from "../../models/Game";
import { AuthenticatedSocket } from "../../types/authSocketType";
import { Server } from "socket.io";
import { sendGameStateToClients, startPhaseTimer } from "../../utils/gameUtils";

const handleStartGame = async (
  socket: AuthenticatedSocket,
  io: Server,
  gameId: string
) => {
  try {
    const game = await Game.findById(gameId);
    const userId = socket.user ? socket.user.id : null;
    if (!game) {
      socket.emit("error", { message: "Game not found" });
      return;
    }

    if (!userId) {
      socket.emit("error", { message: "User not authenticated" });
      return;
    }

    const creator = game.participants.find(
      (p) => p.isCreator && p.userId.toString() === userId
    );
    if (!creator) {
      return;
    }

    game.phase = "writing";
    game.currentRound = 1;
    game.remainingTime = game.roundTime;

    game.participants.forEach((participant) => {
      participant.hasSubmitted = false;
      participant.text = "";
    });

    await game.save();

    startPhaseTimer(gameId, io);
    sendGameStateToClients(gameId, io);
  } catch (error) {
    socket.emit("error", { message: "Error starting game" });
  }
};

export default handleStartGame;
