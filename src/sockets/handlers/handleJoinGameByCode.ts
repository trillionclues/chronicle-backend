import mongoose from "mongoose";
import Game from "../../models/Game";
import { AuthenticatedSocket } from "../../types/authSocketType";
import { Server } from "socket.io";
import {
  handleClientReconnect,
  sendGameStateToClients,
} from "../../utils/gameUtils";

const handleJoinGameByCode = async (
  socket: AuthenticatedSocket,
  io: Server,
  gameCode: string
) => {
  try {
    const game = await Game.findOne({ gameCode });
    const userId = socket.user?.id;
    if (!game) {
      socket.emit("error", { message: "Game not found" });
      return;
    }

    const isAlreadyParticipant = game.participants.some(
      (participant) => participant.userId.toString() === userId
    );

    if (isAlreadyParticipant) {
      socket.join(game._id.toString());
      handleClientReconnect(game._id.toString(), io);
    } else {
      if (game.participants.length >= game.maxPlayers) {
        socket.emit("error", { message: "Game is full" });
        return;
      }

      game.participants.push({
        userId: new mongoose.Types.ObjectId(socket.user?.id),
        hasSubmitted: false,
        isCreator: false,
        text: "",
        votedFor: null,
      });
      await game.save();
      socket.join(game._id.toString());
    }

    sendGameStateToClients(game._id.toString(), io);
    socket.emit("joined", {
      message: "Successfully joined the game",
      gameId: game._id,
    });
  } catch (error) {
    socket.emit("error", { message: "Error joining game" });
  }
};

export default handleJoinGameByCode;
