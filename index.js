const express = require("express");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
    const tasksCollection = client.db("taskManagementDB").collection("tasks");

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

    // task area
    app.post("/tasks", async (req, res) => {
      const task = req.body;
      const result = await tasksCollection.insertOne(task);
      res.send(result);
    });

    app.get("/tasks/:email", async (req, res) => {
      const email = req.params.email;
      const result = await tasksCollection.find({ email }).toArray();
      res.send(result);
    });

    app.delete("/tasks/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await tasksCollection.deleteOne(query);
      res.send(result);
    });

    app.patch("/taskUpdate/:id", async (req, res) => {
      const { id } = req.params;
      const { status } = req.body;

      const updateTask = await tasksCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { status: status } },
        { returnDocument: "after" }
      );
      res.send(updateTask);
    });

    app.get("/tasks_update/:id", async (req, res) => {
      const id = req.params.id;
      const result = await tasksCollection.findOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    app.put("/task_update/:id", async (req, res) => {
      const id = req.params.id;
      const task = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateTask = {
        $set: {
          title: task.title,
          description: task.description,
          endDate: task.endDate,
          priority: task.priority,
        },
      };
      const result = await tasksCollection.updateOne(
        filter,
        updateTask,
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
