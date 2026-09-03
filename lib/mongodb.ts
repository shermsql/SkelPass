import { MongoClient, type Db } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "Production";

if (!uri) {
  throw new Error(
    "MONGODB_URI environment variable is not set. Please check your .env.local file."
  );
}

declare global {
  var _skelpassMongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  if (!global._skelpassMongoClientPromise) {
    const client = new MongoClient(uri);
    global._skelpassMongoClientPromise = client.connect();
  }
  clientPromise = global._skelpassMongoClientPromise;
} else {
  const client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default clientPromise;

export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  return client.db(dbName);
}

export async function getUsersCollection() {
  const db = await getDb();
  return db.collection("users");
}

export async function getVaultItemsCollection() {
  const db = await getDb();
  return db.collection("vaultItems");
}

export async function getFoldersCollection() {
  const db = await getDb();
  return db.collection("folders");
}

export async function getSessionsCollection() {
  const db = await getDb();
  return db.collection("sessions");
}
