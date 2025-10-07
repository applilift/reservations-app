const functions = require("firebase-functions");
const admin = require("firebase-admin");

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://lift-agenda-app-default-rtdb.europe-west1.firebasedatabase.app"
});

const db = admin.database();

// 🔔 Fonction déclenchée à chaque ajout dans __fcm_outbox
exports.sendPushOnOutbox = functions.database
  .ref("/__fcm_outbox/{pushId}")
  .onCreate(async (snapshot, context) => {
    const data = snapshot.val();
    if (!data || !data.title || !data.body) return null;

    // Récupérer tous les tokens enregistrés
    const tokensSnap = await db.ref("fcm_tokens").once("value");
    const tokens = [];
    tokensSnap.forEach(child => {
      const t = child.val()?.token;
      if (t) tokens.push(t);
    });

    if (tokens.length === 0) {
      console.log("Aucun token FCM enregistré");
      return null;
    }

    const payload = {
      notification: {
        title: data.title,
        body: data.body,
        tag: data.tag || "agenda",
      }
    };

    try {
      const response = await admin.messaging().sendEachForMulticast({
        tokens,
        notification: payload.notification,
      });
      console.log(`Notifications envoyées : ${response.successCount}/${tokens.length}`);
      await snapshot.ref.remove(); // Nettoyage
    } catch (error) {
      console.error("Erreur envoi FCM :", error);
    }

    return null;
  });
