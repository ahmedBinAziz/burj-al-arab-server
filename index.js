const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const admin = require("firebase-admin");
const MongoClient = require("mongodb").MongoClient;
require('dotenv').config()

const uri =`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.g3qco.mongodb.net/burjAlArabretryWrites=true&w=majority`;

const port = 5000;

const app = express();

app.use(cors());
app.use(bodyParser.json());


var serviceAccount = require("./configs/burj-al-arab-after-auth-10-firebase-adminsdk-jfkle-ae9667aa26.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIRE_DB
});



const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  console.log("db connection successfully");
  const bookings = client.db("burj-al-arab").collection("booking");

  app.post("/addBooking", (req, res) => {
    const newBooking = req.body;
    bookings.insertOne(newBooking).then((result) => {
      res.send(result.insertedCount > 0);
    })

  })

  app.get("/bookings", (req, res) => {
    const bearer = req.headers.authorization;
    if (bearer && bearer.startsWith("Bearer ")) {
      const idToken = bearer.split(' ')[1];
      admin
        .auth()
        .verifyIdToken(idToken)
        .then((decodedToken) => {
          const tokenEmail = decodedToken.email;
          const queryEmail = req.query.email;
          if(tokenEmail == queryemail) {
            bookings.find({email: queryEmail})
            .toArray((err, documents) => {
              res.status(200).send(documents);
            })
          }
          else{
            res.status(401).send('un authorized access')
          }
        })
        .catch((error) => {
          res.status(401).send('un authorized access')
        });
    }
    else{
      res.status(401).send('un authorized access')
    }

   
  });
});

app.listen(port);
