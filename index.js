const express = require("express");
require("dotenv").config({ path: "./.env" });
const bodyParser = require("body-parser");

const app = express();
const http = require("http").createServer(app);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Methods", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

const port = 4000;

const db = require("./queries");

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.get("/", (request, response) => {
  response.json({ info: "Node.js, Express, and Postgres API" });
});

app.post("/make-payment", db.makePayment);

app.post("/sendSMS", db.makePayment);

http.listen(port, () => {
  console.log(`App running on port ${port}.`);
});

app.use(function (err, req, res, next) {
  res.status(err.status || 500).json(response.error(err.status || 500));
});
process.on("uncaughtException", (err) => {
  console.log("uncaughtException App Error (Kond)", err);
});

app.use(function (err, req, res, next) {
  res.status(err.status || 500).json(response.error(err.status || 500));
});
