const express = require("express");
require("./db/mongoose.js");
const userRouter = require("./router/User.js");
const socialRouter = require("./router/Social.js");
const cors = require("cors");

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(cors());
app.use(userRouter);
app.use(socialRouter);

app.get("/", (req, res) => {
  res.json({ Message: "In Index.js" });
});

app.listen(port, () => {
  console.log("Server Running on Port", port);
});
