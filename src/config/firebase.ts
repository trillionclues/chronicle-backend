import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import config from "./config";

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  } catch (error) {
    console.error("Error parsing FIREBASE_SERVICE_ACCOUNT_JSON:", error);
    process.exit(1);
  }
} else if (config.FIREBASE_SERVICE_ACCOUNT_PATH) {
  try {
    const filePath = path.resolve(config.FIREBASE_SERVICE_ACCOUNT_PATH);
    if (fs.existsSync(filePath)) {
      serviceAccount = JSON.parse(fs.readFileSync(filePath, "utf8"));
    } else {
      console.error(`Service account file not found at: ${filePath}`);
      process.exit(1);
    }
  } catch (error) {
    console.error("Error loading service account file:", error);
    process.exit(1);
  }
} else {
  console.error("No Firebase service account configuration found");
  process.exit(1);
}

// console.log("config", serviceAccount);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

export default admin;
