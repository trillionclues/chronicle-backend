import { AuthenticatedSocket } from "../../types/authSocketType";
import { Server } from "socket.io";
import { endWritingPhase, sendGameStateToClients } from "../../utils/gameUtils";
import Game from "../../models/Game";

const handleSubmitText = async (
  socket: AuthenticatedSocket,
  io: Server,
  gameId: string,
  text: string
) => {
  try {
    const game = await Game.findById(gameId);
    const userId = socket.user?.id;

    if (!game) {
      socket.emit("error", { message: "Game not found" });
      return;
    }

    if (!userId) {
      socket.emit("error", { message: "User not authenticated" });
      return;
    }

    const participant = game.participants.find(
      (p) => p.userId.toString() === userId
    );

    if (participant && game.phase === "writing") {
      if (participant.text) {
        socket.emit("error", {
          message: "Text has already been submitted for this round",
        });
        return;
      }

      participant.text = text;
      participant.hasSubmitted = true;
      await game.save();

      const allSubmitted = game.participants.every((p) => p.text);
      if (allSubmitted) {
        await endWritingPhase(gameId, io);
      }

      sendGameStateToClients(gameId, io);
    }
  } catch (error) {
    socket.emit("error", { message: "Error submitting text" });
  }
};

export default handleSubmitText;
