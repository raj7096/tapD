const express = require("express");
const auth = require("../middleware/Auth.js");
const User = require("../model/User.js");
const Social = require("../model/socialApp.js");
const { upload } = require("../middleware/multer.js");
const router = express.Router();

//Signup
router.post("/signup", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    const token = await user.generateAuthToken();
    res.status(201).send({ User: user, token });
  } catch (error) {
    res.status(400).send({ Error: error.message });
  }
});

//Login
router.post("/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body);
    const token = await user.generateAuthToken();
    res.status(200).send({ User: user, token });
  } catch (error) {
    res.status(400).send({ Error: error.message });
  }
});

//Add Social Link
router.post("/addSocialLink", auth, async (req, res) => {
  try {
    const app = await Social.findOne({ _id: req.body.id });
    const data = {
      username: req.body.username,
      profileLink: req.body.link,
      appData: Object.assign(app),
    };
    req.user.socialLinks = req.user.socialLinks.concat(data);
    await req.user.save();
    res.status(200).send({ User: req.user });
  } catch (error) {
    res.status(400).send({ Error: error.message });
  }
});

//Add Custom Link
router.post("/customLink", auth, async (req, res) => {
  try {
    const app = await Social.findOne({
      title: new RegExp(req.body.title, "i"),
    });
    if (app === null) {
      const data = {
        username: null,
        profileLink: req.body.link,
        appData: null,
      };
      req.user.socialLinks = req.user.socialLinks.concat(data);
      await req.user.save();
    } else {
      const data = {
        username: null,
        profileLink: req.body.link,
        appData: Object.assign(app),
      };
      req.user.socialLinks = req.user.socialLinks.concat(data);
      await req.user.save();
    }
    res.status(200).send({ User: req.user });
  } catch (error) {
    res.status(400).send({ Error: error.message });
  }
});

//Remove Social Link
router.get("/removeSocialLink/:id", auth, async (req, res) => {
  try {
    req.user.socialLinks = req.user.socialLinks.filter((link) => {
      return link._id.toString() !== req.params.id;
    });
    await req.user.save();
    res.status(200).send({ User: req.user });
  } catch (error) {
    res.status(400).send({ Error: error.message });
  }
});

//Instant Button
router.post("/instant/:id", auth, async (req, res) => {
  try {
    req.user.socialLinks.forEach((link) => {
      link.isActive = false;
      if (link._id.toString() === req.params.id) {
        link.isActive = req.body.value;
        req.user.save();
      }
    });
    res.status(200).send({ User: req.user });
  } catch (error) {
    res.status(400).send({ Error: error.message });
  }
});

//Get User By QR Code
router.get("/GetProfile/:id", async (req, res) => {
  try {
    const user = await User.find({ _id: req.params.id });
    res.status(200).send({ User: user });
  } catch (error) {
    res.status(400).send({ Error: error.message });
  }
});

//Update User
router.patch("/updateUser", auth, upload.single("avatar"), async (req, res) => {
  const updates = Object.keys(req.body);
  try {
    updates.forEach((update) => (req.user[update] = req.body[update]));
    req.user.profilePhoto = req.file.location;
    await req.user.save();
    res.status(200).send({ User: req.user });
  } catch (error) {
    res.status(400).send({ Error: error.message });
  }
});

//update password in profile
router.patch("/updatePassword", auth, async (req, res) => {
  try {
    req.user.password = req.body.password;
    await req.user.save();
    res
      .status(200)
      .send({ User: req.user, Message: "Password Successfully Updated!" });
  } catch (error) {
    res.status(400).send({ Error: error.message });
  }
});

// 1 Also For Resend OTP
router.post("/forgetPassword", async (req, res) => {
  try {
    const user = await User.getUser(req.body);
    res.status(200).send({ User: user });
  } catch (error) {
    res.status(400).send({ Error: error.message });
  }
});

// 2  Otp verify
router.post("/OtpVerify", async (req, res) => {
  try {
    const user = await User.verifyOtp(req.body);
    res
      .status(200)
      .send({ User: user, Message: "Otp Verified,Now You Can Reset Password" });
  } catch (error) {
    res.status(400).send({ Error: error.message });
  }
});

// 3 Reset Password
router.patch("/resetPassword", async (req, res) => {
  try {
    const user = await User.resetPassword(req.body);
    res.status(200).send({
      Message: "Password Has Been Changed,Login With New Password",
    });
  } catch (error) {
    res.status(400).send({ Error: error.message });
  }
});

//Logout
router.post("/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token != req.token;
    });
    await req.user.save();
    res.status(200).send({ Message: "Done" });
  } catch (error) {
    res.status(500).send({ Error: error.message });
  }
});

module.exports = router;
