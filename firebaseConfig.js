import admin from 'firebase-admin';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const serviceAccount = require('./dmtool-cad62-firebase-adminsdk-srmch-6898f5bb0c.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://dmtool-cad62.firebaseio.com"
});

const db = admin.database();
export default db;
