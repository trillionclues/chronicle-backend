import mongoose from "mongoose";
import {
  FragmentSchema,
  GameDocument,
  ParticipantSchema,
} from "../types/gameModelTypes";

const Schema = mongoose.Schema;

const participantSchema = new Schema<ParticipantSchema>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  isCreator: { type: Boolean, default: false },
  text: { type: String },
  votedFor: { type: Schema.Types.ObjectId, ref: "User" },
  hasSubmitted: { type: Boolean, default: false },
});

const fragmentSchema = new Schema<FragmentSchema>({
  text: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  votes: { type: Number, default: 0 },
});

const gameSchema = new Schema<GameDocument>(
  {
    name: { type: String, required: true },
    gameCode: { type: String, required: true, unique: true },
    roundTime: { type: Number, required: true },
    voteTime: { type: Number, required: true },
    maxRounds: { type: Number, default: 5 },
    maxPlayers: { type: Number, default: 10 },
    currentRound: { type: Number, default: 1 },
    phase: {
      type: String,
      enum: ["waiting", "writing", "voting", "finished", "canceled"],
      default: "waiting",
    },
    remainingTime: { type: Number },
    history: [fragmentSchema],
    participants: [participantSchema],
  },
  { timestamps: true }
);

export default mongoose.model<GameDocument>("Game", gameSchema);
