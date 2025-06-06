import dotenv from "dotenv";

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  MONGO_URI: string;
  FIREBASE_SERVICE_ACCOUNT_PATH: any;
}

const config: Config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  MONGO_URI: process.env.MONGO_URI || "",
  FIREBASE_SERVICE_ACCOUNT_PATH:
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH || "",
};

export default config;
