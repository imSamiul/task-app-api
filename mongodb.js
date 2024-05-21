// CRUD create read update delete
const mongodb = require('mongodb');

const { MongoClient, ObjectId } = mongodb;
const databaseName = 'task-manager';

// Replace the uri string with your MongoDB deployment's connection string.
const connectionURL = 'mongodb://127.0.0.1:27017';

// Create a new client and connect to MongoDB
const client = new MongoClient(connectionURL);
const id = new ObjectId();

async function run() {
  try {
    // Connect to the "insertDB" database and access its "haiku" collection
    const database = client.db(databaseName);
    const users = database.collection('users');

    // Create a document to insert
    // const singleObj = {
    //   name: 'Karim',
    //   age: 25,
    // };
    // const multipleObj = [
    //   {
    //     name: 'Nadim',
    //     age: 24,
    //   },
    //   {
    //     name: 'Jubayer',
    //     age: 23,
    //   },
    //   {
    //     name: 'Anamul',
    //     age: 22,
    //   },
    // ];
    // CREATE - Insert Single Object to the MongoDB database
    // const result = await users.insertOne(singleObj);

    // CREATE - Insert Multiple Object to the mongoDB database
    // const result = await users.insertMany(multipleObj);

    // READ - Find one object from the database
    // const findOne = await users.findOne({ name: 'Anamul' });

    // READ - Find multiple object in array from database
    // const findArray = await users.find({ name: 'Anamul' }).toArray();

    // READ - Find object using ObjectId
    // const findOneUsingId = await users.findOne({
    //   _id: new ObjectId('663cf0d9b732ecffaa5f7925'),
    // });

    // UPDATE - update one object using object id
    // const updateOneObj = await users.updateOne(
    //   {
    //     _id: new ObjectId('663cf0d9b732ecffaa5f7925'),
    //   },
    //   { $set: { age: 28 } },
    // );

    // UPDATE - update many object using name
    // const updateManyObj = await users.updateMany(
    //   {
    //     name: 'Jubayer',
    //   },
    //   { $inc: { age: 1 } },
    // );

    // DELETE - delete many object from database
    // const deleteManyObj = await users.deleteMany({
    //   name: 'Nadim',
    // });

    // DELETE - delete one object from database
    // const deleteOneObj = await users.deleteOne({
    //   name: 'Anamul',
    // });

    // Print the ID of the inserted document
    console.log(
      `A document was inserted with the _id: ${JSON.stringify(deleteOneObj)}`,
    );
  } finally {
    // Close the MongoDB client connection
    await client.close();
  }
}
// Run the function and handle any errors
run().catch(console.dir);

// CRUD operation using promise
// .updateMany({ name: 'Anamul' }, { $set: { age: 25 } })
// .then((result) => {
//   console.log(result);
// })
// .catch((error) => {
//   console.log(error);
// });
