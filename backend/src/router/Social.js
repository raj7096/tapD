const express = require("express");
const Social = require("../model/socialApp.js");
const router = express.Router();

//Add Social Apps
router.post("/AddSocialApp", async (req, res) => {
  try {
    const App = await new Social(req.body);
    await App.save();
    res.status(200).send({ App });
  } catch (error) {
    res.status(400).send({ Error: error.message });
  }
});

//View Social Apps
router.get("/GetSocialApp", async (req, res) => {
  try {
    const Apps = await Social.find({});
    res.status(200).send({ Apps });
  } catch (error) {
    res.status(400).send({ Error: error.message });
  }
});

module.exports = router;
