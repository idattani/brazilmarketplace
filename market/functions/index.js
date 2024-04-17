const functions = require("firebase-functions");
const {initializeApp} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");
const FieldValue = require("firebase-admin/firestore").FieldValue;
const Typesense = require("typesense");

initializeApp();

const db = getFirestore();

const corsConfig = require("dotenv").config();

const isProduction = process.env.PRODUCTION;
const productionHost = process.env.PRODUCTION_HOST;

const cors = require("cors")({origin: (isProduction == "true") ? productionHost : true});

const typesenseEnv = require("dotenv");
typesenseEnv.config({path: "./typesense/typesense.env"});


// Environment variables for typesense configuration
const adminKey = process.env.TYPESENSE_API_KEY;
const port = process.env.TYPESENSE_PORT;
const host = process.env.TYPESENSE_HOST;
const protocol = process.env.TYPESENSE_PROTOCOL;

const client = new Typesense.Client({
  "nodes": [{
    "host": host,
    "port": port,
    "protocol": protocol,
  }],
  "apiKey": adminKey,
  "connectionTimeoutSeconds": 2,
});


async function createTypesenseCollection() {
  const supplierCollection = {
    "name": "supplierCollection",
    "fields": [
      {"name": "uid", "type": "string"},
      {"name": "address", "type": "string"},
      {"name": "company_name", "type": "string"},
      {"name": "brief_description", "type": "string"},
      {"name": "long_description", "type": "string"},
      {"name": "categories", "type": "string"},
      {"name": "certifications", "type": "string"},
    ],
  };

  await client.collections().create(supplierCollection);
}


exports.onUserCreate = functions.firestore.document("/users/{userId}").onCreate(async (snapshot, context) => {
  if (snapshot.data().isSupplier) {
    console.log("supplier creation detected");
    const certList = Object.keys(snapshot.data().certifications);

    client.collections("supplierCollection").retrieve().then((collection) => {
      console.log("collection exists");
      const {uid, address, company_name, brief_description, long_description, categories, image_file} = snapshot.data();
      document = {
        id: uid,
        uid: uid,
        address: `${address.building_name} ${address.city_name} ${address.post_code} ${address.country_name} ${address.street_name}`,
        company_name: company_name,
        brief_description: brief_description,
        long_description: long_description,
        categories: JSON.stringify(categories),
        certifications: JSON.stringify(certList),
        image_file: image_file,
      };

      return client.collections("supplierCollection").documents().create(document);
    })
        .catch(async (error) => {
          console.log("collection does not exist");
          await createTypesenseCollection();

          const {uid, address, company_name, brief_description, long_description, categories, image_file} = snapshot.data();
          document = {
            id: uid,
            uid: uid,
            address: `${address.building_name} ${address.city_name} ${address.post_code} ${address.country_name} ${address.street_name}`,
            company_name: company_name,
            brief_description: brief_description,
            long_description: long_description,
            categories: JSON.stringify(categories),
            certifications: JSON.stringify(certList),
            image_file: image_file,
          };

          return client.collections("supplierCollection").documents().create(document);
        });
  }
});

exports.onUserUpdate = functions.firestore.document("/users/{userId}").onUpdate((snapshot, context) => {
  if (snapshot.after.data().isSupplier) {
    const certList = Object.keys(snapshot.after.data().certifications);

    const {uid, address, company_name, brief_description, long_description, categories, image_file} = snapshot.after.data();
    document = {
      id: uid,
      uid: uid,
      address: `${address.building_name} ${address.city_name} ${address.post_code} ${address.country_name} ${address.street_name}`,
      company_name: company_name,
      brief_description: brief_description,
      long_description: long_description,
      categories: JSON.stringify(categories),
      certifications: JSON.stringify(certList),
      image_file: image_file,
    };

    return client.collections("supplierCollection").documents(uid).update(document);
  }
});

exports.onUserDelete = functions.firestore.document("/users/{userId}").onDelete((snapshot, context) => {
  if (snapshot.data().isSupplier) {
    return client.collections("supplierCollection").documents(snapshot.data().uid).delete();
  }
});

exports.searchSuppliers = functions.https.onRequest(async (req, res) => {
  cors(req, res, () => {
    const search = {
      "q": req.query.search,
      "query_by": "address,company_name,brief_description,long_description,categories,certifications",
    };

    client.collections("supplierCollection").documents().search(search).then((result) => {
      const resultMap = result.hits.map((hit) => hit.document);

      res.status(200).send(resultMap);
    })
        .catch((error) => {
          res.status(404).send([]);
        });
  });
});


// // Create and deploy your first functions
// // https://firebase.google.com/docs/functions/get-started
//
exports.test = functions.https.onRequest(async (request, response) => {
  functions.logger.info("test-getter", {production: isProduction, productionType: typeof isProduction});
});

exports.addUsersToChat = functions.firestore.document("chat_rooms/{chatId}").onCreate((snap, context) => {
  const participants = snap.data();
  const chatId = context.params.chatId;

  db.collection("users").doc(participants.senderId).collection("chat_rooms").doc(chatId).set({chat_id: chatId, unread_messages: false, user: participants.receiverId});
  db.collection("users").doc(participants.receiverId).collection("chat_rooms").doc(chatId).set({chat_id: chatId, unread_messages: false, user: participants.senderId});
});

exports.updateUnreadMessageCount = functions.firestore.document("chat_rooms/{chatId}/messages/{messageId}").onCreate((snap, context) => {
  const receiverId = snap.data().receiverId;
  const chatId = context.params.chatId;

  const chatRef = db.collection("users").doc(receiverId).collection("chat_rooms").doc(chatId);

  chatRef.get().then((doc) => {
    const chat = doc.data();

    if (!chat.unread_messages) {
      chatRef.update({unread_messages: true});
    }
  });
});

exports.incrementUnreadChatCount = functions.firestore.document("users/{userId}/chat_rooms/{chatId}").onUpdate((snap, context) => {
  const receiverId = context.params.userId;

  const isUnreadAfterUpdate = snap.after.data().unread_messages;

  if (isUnreadAfterUpdate) {
    db.collection("users").doc(receiverId).update({unread_messages: FieldValue.increment(1)});
  }
});


