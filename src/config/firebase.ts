import admin from "firebase-admin";
// const serviceAccount = require("../chronicle-86dce-firebase-adminsdk-fbsvc-1155616c1c.json");
import config from "./config";

admin.initializeApp({
  credential: admin.credential.cert(
    config.FIREBASE_SERVICE_ACCOUNT as admin.ServiceAccount
  ),
});

export default admin;
