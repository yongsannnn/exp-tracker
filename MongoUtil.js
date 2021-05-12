//NodeJs mongo driver
const mongoClient = require("mongodb").MongoClient;

async function connect(mongoUrl, dbName) {
    //Create a client
    let client = await mongoClient.connect(mongoUrl, {
        useUnifiedTopology: true
    })

    //Use a database
    let db = client.db(dbName);
    console.log("Database connected");
    return db;
}


//we are exporting out the connect function
module.exports={
    connect
}