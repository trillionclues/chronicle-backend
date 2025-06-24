import { Server } from "socket.io";
import Game from "../models/Game";
import {
  FragmentSchema,
  ParticipantSchema,
  VoteCount,
} from "../types/gameModelTypes";

const sendGameStateToClients = async (gameId: string, io: Server) => {
  try {
    const game = await Game.findById(gameId).populate("participants.userId");
    if (!game) {
      return;
    }

    const userMap = new Map(
      game.participants.map((participant) => {
        return [
          participant.userId._id.toString(),
          {
            id: participant.userId._id.toString(),
            name: (participant.userId as any).name,
            photoUrl: (participant.userId as any).photoUrl,
            text: participant.text,
            isCreator: participant.isCreator,
            hasSubmitted:
              game.phase === "writing"
                ? Boolean(participant.text)
                : Boolean(participant.votedFor),
          },
        ];
      })
    );

    const gameData = {
      id: game._id,
      name: game.name,
      gameCode: game.gameCode,
      phase: game.phase,
      currentRound: game.currentRound,
      maxRounds: game.maxRounds,
      roundTime: game.roundTime,
      voteTime: game.voteTime,
      maxPlayers: game.maxPlayers,
      history: game.history.map((fragment) => ({
        text: fragment.text,
        author: userMap.get(fragment.author.toString()),
        votes: fragment.votes,
        round: fragment.roundNumber,
        isWinner: fragment.isWinner,
      })),
      remainingTime: game.remainingTime,
      participants: Array.from(userMap.values()),
    };

    io.to(gameId).emit("gameStateUpdate", gameData);
  } catch (error) {
    console.error("Error sending game state to clients:", error);
  }
};

const gameTimers = {};

const startPhaseTimer = (gameId: string, io: Server) => {
  clearExistingTimer(gameId);

  (gameTimers as { [key: string]: NodeJS.Timeout })[gameId] = setInterval(
    async () => {
      try {
        const game = await Game.findById(gameId);
        if (!game || game.phase === "finished") {
          clearExistingTimer(gameId);
          return;
        }

        game.remainingTime -= 1;
        await game.save();

        if (game.remainingTime <= 0) {
          await handlePhaseEnd(gameId, io, game);
        } else {
          sendGameStateToClients(gameId, io);
        }
      } catch (error) {
        clearExistingTimer(gameId);
      }
    },
    1000
  );
};

const clearExistingTimer = (gameId: string) => {
  if (gameTimers && (gameTimers as Record<string, NodeJS.Timeout>)[gameId]) {
    clearInterval((gameTimers as Record<string, NodeJS.Timeout>)[gameId]);
    delete (gameTimers as Record<string, NodeJS.Timeout>)[gameId];
  }
};

const handlePhaseEnd = async (
  gameId: string,
  io: Server,
  game: { phase: string }
) => {
  if (game.phase === "writing") {
    await endWritingPhase(gameId, io);
  } else if (game.phase === "voting") {
    await endVotingPhase(gameId, io);
  }
};

const endWritingPhase = async (gameId: string, io: Server) => {
  const game = await Game.findById(gameId);
  if (!game || game.phase !== "writing") return;

  game.participants.forEach((participant) => {
    participant.hasSubmitted = false;
  });

  // Add all submitted texts to history before phase change
  game.participants.forEach((participant) => {
    if (participant.text) {
      game.history.push({
        text: participant.text,
        author: participant.userId,
        votes: 0,
        roundNumber: game.currentRound,
        isWinner: false,
      });
    }
  });

  game.phase = "voting";
  game.remainingTime = game.voteTime;
  await game.save();

  startPhaseTimer(gameId, io);
  sendGameStateToClients(gameId, io);
};

const endVotingPhase = async (gameId: string, io: Server) => {
  const game = await Game.findById(gameId);
  if (!game || game.phase !== "voting") return;

  // Mark the winning fragment
  const winningFragment = calculateWinningFragment(game.participants);
  if (winningFragment) {
    // Find and update the winning fragment in history
    const fragmentIndex = game.history.findIndex(
      (f) =>
        f.text === winningFragment.text &&
        f.author.toString() === winningFragment.author.toString() &&
        f.roundNumber === game.currentRound
    );

    if (fragmentIndex !== -1) {
      game.history[fragmentIndex].isWinner = true;
      game.history[fragmentIndex].votes = winningFragment.votes;
    }
  }

  if (game.currentRound >= game.maxRounds) {
    game.phase = "finished";
    // Compile final story from winning fragments
    const finalStory = game.history
      .filter((f) => f.isWinner)
      .sort((a, b) => a.roundNumber - b.roundNumber)
      .map((f) => f.text)
      .join(" ");
    //  game.finalStory = finalStory;
    // game.history.push({
    //   text: finalStory,
    //   author: game.participants.find(p => p.isCreator)?.userId as any,
    //   votes: 0,
    //   roundNumber: game.maxRounds,
    //   isWinner: true,
    // })
  } else {
    game.currentRound += 1;
    game.phase = "writing";
    game.remainingTime = game.roundTime;
    startPhaseTimer(gameId, io);
  }

  game.participants.forEach((participant) => {
    participant.hasSubmitted = false;
    participant.votedFor = null as any;
    participant.text = "";
  });

  await game.save();
  sendGameStateToClients(gameId, io);
};

const handleClientReconnect = async (gameId: string, io: Server) => {
  try {
    const game = await Game.findById(gameId);
    if (!game) {
      return;
    }

    sendGameStateToClients(gameId, io);

    if (game.phase !== "finished") {
      startPhaseTimer(gameId, io);
    }
  } catch (error) {}
};

const calculateWinningFragment = (
  participants: ParticipantSchema[]
): FragmentSchema | null => {
  const voteCounts: VoteCount = {};

  participants.forEach((participant) => {
    if (participant.votedFor) {
      voteCounts[participant.votedFor.toString()] =
        (voteCounts[participant.votedFor.toString()] || 0) + 1;
    }
  });
  let maxVotes = -1;
  let winner = null;

  participants.forEach((participant) => {
    const votes = voteCounts[participant.userId.toString()] || 0;
    if (participant.text && votes > maxVotes) {
      maxVotes = votes;
      winner = {
        text: participant.text,
        author: participant.userId,
        votes: votes,
      };
    }
  });

  return winner;
};

export {
  sendGameStateToClients,
  startPhaseTimer,
  endWritingPhase,
  endVotingPhase,
  calculateWinningFragment,
  handleClientReconnect,
};
