import mongoose from "mongoose";

export interface VoteCount {
  [key: string]: number;
}

export interface GameQuery {
  participants?: any;
  phase?: { $nin?: string[]; $in?: string[] } | string;
  [key: string]: any;
}

export interface UserDocument {
  _id: mongoose.Types.ObjectId;
  firebaseId: string;
  name: string;
  photoUrl: string;
}

export interface ParticipantSchema {
  _id?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId | UserDocument;
  isCreator: boolean;
  text: string;
  votedFor: mongoose.Types.ObjectId | null;
  hasSubmitted: boolean;
}

export interface FragmentSchema {
  text: string;
  author: mongoose.Types.ObjectId | UserDocument;
  votes: number;
  roundNumber: number;
  isWinner: boolean;
}

export interface GameDocument {
  name: string;
  gameCode: string;
  roundTime: number;
  voteTime: number;
  maxRounds: number;
  maxPlayers: number;
  currentRound: number;
  phase: string;
  remainingTime: number;
  history: FragmentSchema[];
  participants: ParticipantSchema[];
}
