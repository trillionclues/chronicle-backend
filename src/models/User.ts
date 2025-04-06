import mongoose from "mongoose";
import { UserSchema } from "../types/userSchemaType";

const userSchema = new mongoose.Schema<UserSchema>({
  firebaseId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    default: "Anonymous",
  },
  photoUrl: {
    type: String,
    default: "",
  },
});

export default mongoose.model("User", userSchema);
