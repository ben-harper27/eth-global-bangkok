import { MongoClient, ServerApiVersion } from "mongodb";

const mongoPassword = "Z8Uf4LnnwBBrybbj"; // TODO: Make this a proper secret
const uri = `mongodb+srv://ben:${mongoPassword}@memenomicsai.njofc.mongodb.net/?retryWrites=true&w=majority&appName=MemenomicsAI`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    console.log('TEST', 'connecting to mongo')
    await client.connect();
    // Send a ping to confirm a successful connection
    let connectionresult = await client.db("admin").command({ ping: 1 });
    console.log('TEST', 'mongo resut', connectionresult)
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } catch( error ) {
    console.error('TEST', 'error', error)
  } finally {
    // Ensures that the client will close when you finish/error
    console.log('TEST', 'closing mongo')
    await client.close();
  }
}
run().catch(console.dir);

/**
 * Generic function to insert one or many documents into a collection
 * @param {string} collectionName - Name of the collection
 * @param {Object|Array} data - Single document or array of documents to insert
 * @returns {Promise} - Returns insertion result
 */
async function insertDocuments(collectionName, data) {
  try {
    await client.connect();
    const collection = client.db("memenomicsai").collection(collectionName);

    if (Array.isArray(data)) {
      return await collection.insertMany(data);
    }
    return await collection.insertOne(data);
  } finally {
    await client.close();
  }
}

/**
 * Generic function to find documents in a collection
 * @param {string} collectionName - Name of the collection
 * @param {Object} query - MongoDB query object
 * @param {Object} options - Additional options (sort, limit, etc.)
 * @returns {Promise<Array>} - Returns found documents
 */
async function findDocuments(collectionName, query = {}, options = {}) {
  try {
    await client.connect();
    const collection = client.db("memenomicsai").collection(collectionName);

    return await collection.find(query, options).toArray();
  } finally {
    await client.close();
  }
}

/**
 * Generic function to update documents in a collection
 * @param {string} collectionName - Name of the collection
 * @param {Object} query - MongoDB query object
 * @param {Object} update - Update operations
 * @param {Object} options - Additional options (upsert, multi, etc.)
 * @returns {Promise} - Returns update result
 */
async function updateDocuments(collectionName, query, update, options = {}) {
  try {
    await client.connect();
    const collection = client.db("memenomicsai").collection(collectionName);

    if (options.many) {
      return await collection.updateMany(query, update, options);
    }
    return await collection.updateOne(query, update, options);
  } finally {
    await client.close();
  }
}

/**
 * Generic function to delete documents from a collection
 * @param {string} collectionName - Name of the collection
 * @param {Object} query - MongoDB query object
 * @param {Object} options - Additional options
 * @returns {Promise} - Returns deletion result
 */
async function deleteDocuments(collectionName, query, options = {}) {
  try {
    await client.connect();
    const collection = client.db("memenomicsai").collection(collectionName);

    if (options.many) {
      return await collection.deleteMany(query, options);
    }
    return await collection.deleteOne(query, options);
  } finally {
    await client.close();
  }
}

// Export the wrapper functions
export { insertDocuments, findDocuments, updateDocuments, deleteDocuments };
