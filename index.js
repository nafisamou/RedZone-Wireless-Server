const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.grwbbr0.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const productsCollection = client.db("Job-Task-4").collection("products");
    const usersCollection = client.db("Job-Task-4").collection("users");

    // ------------------------Products----------------------

    app.get("/products", async (req, res) => {
      const query = {};
      const cursor = productsCollection.find(query).sort({ price: -1 });
      const products = await cursor.limit(6).toArray();
      res.send(products);
    });
    app.get("/productsAll", async (req, res) => {
      const query = {};
      const cursor = productsCollection.find(query).sort({ price: -1 });
      const products = await cursor.toArray();
      res.send(products);
    });
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const products = await productsCollection.findOne(query);
      res.send(products);
    });
    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await usersCollection.findOne(query);
      res.send({ isAdmin: user?.role === "admin" });
    });

    // ------------------PRODUCT-----------------
    /* -----Add Product-------- */
    app.post("/products", async (req, res) => {
      const newProduct = req.body;

      const product = await productsCollection.insertOne(newProduct);

      res.send(product);
    });

    // Product Update

    app.put("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const products = req.body;
      const options = { upsert: true };
      const updateProducts = {
        $set: {
          price: products.price,

          email: products.email,

          description: products.description,
        },
      };
      const result = await productsCollection.updateOne(
        query,
        updateProducts,
        options
      );
      res.send(result);
    });

    /* -------Delete Product------- */
    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };

      const result = await productsCollection.deleteOne(filter);
      res.send(result);
    });

    // User
    // -------------Users----------
    app.get("/users", async (req, res) => {
      const query = {};
      const users = await usersCollection.find(query).toArray();
      res.send(users);
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      console.log(user);
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    app.put("/users/admin/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await usersCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });

    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await usersCollection.findOne(query);
      res.send({ isAdmin: user?.role === "admin" });
    });

    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id);
      const filter = { _id: ObjectId(id) };
      const result = await usersCollection.deleteOne(filter);
      res.send(result);
    });
  } catch (error) {
    console.log(error);
    res.send({
      success: false,
      error: error.message,
    });
  } finally {
  }
}
run().catch((err) => console.error(err));

app.get("/", async (req, res) => {
  res.send("job-task server is running");
});

app.listen(port, () => {
  client.connect((err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Connected to MongoDB");
    }
  });
  console.log(`job-task server is running on ${port}`);
});
