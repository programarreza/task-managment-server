const express = require("express");
const app = express();
const { MongoClient, ServerApiVersion } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.PASS_DB}@cluster0.thl8tgs.mongodb.net/?retryWrites=true&w=majority`;
//Dengar:  taskNestle database connection in this data 
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const usersCollection = client.db("taskManagementDB").collection("users");


    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

	 // google login user
	 app.put("/users/:email", async (req, res) => {
		const email = req.params.email;
		const user = req.body;
		const query = { email: email };
		const options = { upsert: true };
		const isExist = await usersCollection.findOne(query);
		console.log("user found", isExist);
		if (isExist) return res.send(isExist);
		const result = await usersCollection.updateOne(
		  query,
		  {
			$set: { ...user },
		  },
		  options
		);
		res.send(result);
	  });
  




    // await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("task management is running ");
});

app.listen(port, () => {
  console.log(`task management on port ${port}`);
});
