import { Server } from "socket.io";
import { AuthenticatedSocket } from "../../types/authSocketType";
import Game from "../../models/Game";
import mongoose from "mongoose";
import { sendGameStateToClients } from "../../utils/gameUtils";

const handleJoinGame = async(socket: AuthenticatedSocket, io: Server, gameId: string) => {
    try {
         const game = await Game.findById(gameId);
                if (!game) {
                  socket.emit("error", { message: "Game not found" });
                  return;
                }
                

                const userId = socket.user?.id;

                  const isAlreadyParticipant = game.participants.some(
          (participant) => participant.userId.toString() === userId
        );

        if (!isAlreadyParticipant) {
      if (game.participants.length >= game.maxPlayers) {
        socket.emit("error", { message: "Game is full" });
        return;
      }

      game.participants.push({
        userId: new mongoose.Types.ObjectId(userId),
        hasSubmitted: false,
        isCreator: false,
        text: "",
        votedFor: null,
      });
      await game.save();
    }

    socket.join(gameId);
    sendGameStateToClients(gameId, io);
    socket.emit("joined", {
      message: "Successfully joined/rejoined the game",
    });
    } catch (error) {
        socket.emit("error", { message: "Error joining game" });
    }
}

export default handleJoinGame;