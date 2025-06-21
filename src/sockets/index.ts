import { Server } from "socket.io";
import { AuthenticatedSocket } from "../types/authSocketType";
import handleJoinGameByCode from "./handlers/handleJoinGameByCode";
import handleJoinGame from "./handlers/joinGame";
import handleCancelGame from "./handlers/handleCancelGame";
import handleLeaveGame from "./handlers/handleLeaveGame";
import handleKickParticipant from "./handlers/handleKickParticipant";
import handleSubmitText from "./handlers/handleSubmitText";
import handleSubmitVote from "./handlers/handleSubmitVote";
import handleManualNextPhase from "./handlers/handleManualNextPhase";
import handleStartGame from "./handlers/handleStartGame";

const setupGameSockets = (io: Server) => {
  io.on("connection", (socket: AuthenticatedSocket) => {
    socket.on("joinGame", (gameId: string) =>
      handleJoinGame(socket, io, gameId)
    );
    socket.on("joinGameByCode", (gameCode: string) =>
      handleJoinGameByCode(socket, io, gameCode)
    );
    socket.on("cancelGame", (gameId: string) =>
      handleCancelGame(socket, io, gameId)
    );
    socket.on("leaveGame", (gameId: string) =>
      handleLeaveGame(socket, io, gameId)
    );
    socket.on("kickParticipant", (gameId: string, participantId: string) =>
      handleKickParticipant(socket, io, gameId, participantId)
    );
    socket.on("submitText", (data: { gameId: string; text: string }) =>
      handleSubmitText(socket, io, data.gameId, data.text)
    );
    socket.on("submitVote", (data: { gameId: string; votedFor: string }) =>
      handleSubmitVote(socket, io, data.gameId, data.votedFor)
    );
    socket.on("manualNextPhase", (gameId: string) =>
      handleManualNextPhase(socket, io, gameId)
    );
    socket.on("startGame", (gameId: string) =>
      handleStartGame(socket, io, gameId)
    );

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};

export default setupGameSockets;
