import { AuthenticatedSocket } from "../../types/authSocketType";
import { Server } from "socket.io";
import Game from "../../models/Game";
import { sendGameStateToClients } from "../../utils/gameUtils";

const handleKickParticipant = async (
  socket: AuthenticatedSocket,
  io: Server,
  gameId: string,
  participantId: string
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
      (p) => p.isCreator && p.userId.toString() === userId
    );
    if (!creator) {
      socket.emit("error", {
        message: "Only the creator can kick participants",
      });
      return;
    }

    const participant = game.participants.find(
      (p) => p.userId.toString() === participantId
    );
    if (!participant) {
      socket.emit("error", { message: "Participant not found" });
      return;
    }

    game.participants = game.participants.filter(
      (p) => p.userId.toString() !== participantId
    );
    await game.save();
    sendGameStateToClients(gameId, io);

    const socketServer = io as unknown as {
      sockets: {
        sockets: Map<string, AuthenticatedSocket>;
      };
    };

    const participantSocket = Array.from(
      socketServer.sockets.sockets.values()
    ).find((s) => s.user?.id === participantId);
    if (participantSocket) {
      participantSocket.leave(gameId);
      participantSocket.emit("kicked", {
        message: "You have been kicked from the game",
        gameId,
      });
    }
  } catch (error) {
    socket.emit("error", { message: "Error kicking participant" });
  }
};

export default handleKickParticipant;
