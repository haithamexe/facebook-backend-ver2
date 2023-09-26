const dotnev = require("dotenv");
dotnev.config();
const express = require("express");
const cors = require("cors");
const { readdirSync } = require("fs");
const mongoose = require("mongoose");
const corsOptions = require("./config/corsOptions");
const dbConnect = require("./config/dbConnect");
const PORT = process.env.PORT || 8000;

dbConnect();
const app = express();
app.use(express.json());
app.use(cors(corsOptions));

app.get("/", (req, res) => {
  res.send("<h1>run</h1>");
});
readdirSync("./routes").map((r) => app.use("/", require("./routes/" + r)));

mongoose.connection.once("open", () => {
  console.log("connected to database");
  app.listen(PORT, () => console.log("running on port" + PORT));
});
mongoose.connection.on("error", () => {
  console.log("server not running, database error", err);
});
