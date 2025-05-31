import Game from "../../models/Game";
import { AuthenticatedSocket } from "../../types/authSocketType";
import { Server } from "socket.io";
import { sendGameStateToClients } from "../../utils/gameUtils";

const handleLeaveGame = async (
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

    const isParticipant = game.participants.some(
      (participant) => participant.userId.toString() === userId
    );
    if (!isParticipant) {
      socket.emit("error", {
        message: "User is not a participant of this game",
      });
      return;
    }

    game.participants = game.participants.filter(
      (participant) => participant.userId.toString() !== userId
    );
    await game.save();
    socket.leave(gameId);
    sendGameStateToClients(gameId, io);
    socket.emit("leftGame", {
      message: "You have successfully left the game",
      gameId,
    });

    if (game.participants.length === 0) {
      game.phase = "finished";
      await game.save();
      io.to(gameId).emit("gameEnded", {
        message: "Game has ended due to no participants",
      });
    }
  } catch (error) {
    socket.emit("error", { message: "Error leaving game" });
  }
};

export default handleLeaveGame;
