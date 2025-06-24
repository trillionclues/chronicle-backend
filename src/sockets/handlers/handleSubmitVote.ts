import { AuthenticatedSocket } from "../../types/authSocketType";
import { Server } from "socket.io";
import { endVotingPhase, sendGameStateToClients } from "../../utils/gameUtils";
import Game from "../../models/Game";

const handleSubmitVote = async (
  socket: AuthenticatedSocket,
  io: Server,
  gameId: string,
  votedFor: string
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

    if (participant && game.phase === "voting") {
      if (participant.votedFor) {
        socket.emit("error", {
          message: "You have already submitted your vote",
        });
        return;
      }

      participant.votedFor = votedFor as any;
      participant.hasSubmitted = true;
      await game.save();

      const allVoted = game.participants.every((p) => p.votedFor);
      if (allVoted) {
        await endVotingPhase(gameId, io);
      }

      sendGameStateToClients(gameId, io);
    }
  } catch (error) {
    socket.emit("error", { message: "Error submitting vote" });
  }
};

export default handleSubmitVote;
