import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI as string;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// Añade una propiedad a globalThis
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

// Usar un singleton en desarrollo para evitar múltiples conexiones
if (!global._mongoClientPromise) {
  client = new MongoClient(uri, options);
  global._mongoClientPromise = client.connect();
}

clientPromise = global._mongoClientPromise;

export default clientPromise;
