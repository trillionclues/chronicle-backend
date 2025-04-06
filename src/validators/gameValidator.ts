import Joi from "joi";
import { GameValidatorType } from "../types/gameValidatorType";

const gameSchema = Joi.object<GameValidatorType>({
  title: Joi.string().min(3).required(),
  rounds: Joi.number().integer().min(1).required(),
  textTime: Joi.number().integer().min(1).required(),
  voteTime: Joi.number().integer().min(1).required(),
  maxPlayers: Joi.number().integer().min(1).required(),
});

export const validateGame = (data: GameValidatorType) =>
  gameSchema.validate(data);

export default { validateGame };
