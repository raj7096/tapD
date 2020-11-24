const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { sendMail, OTP } = require("../sender/mail.js");
const { sms, otp } = require("../sender/sms.js");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username Required"],
    unique: true,
  },
  name: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
    required: [true, "Email Required"],
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
  phoneNumber: {
    type: Number,
    required: [true, "Phone Number Required"],
    unique: true,
  },
  profilePhoto: {
    type: String,
    default: null,
  },
  otp: {
    type: Number,
  },
  otp_verified: {
    type: Boolean,
    default: false,
  },
  socialLinks: [
    {
      username: {
        type: String,
        default: null,
      },
      profileLink: {
        type: String,
        default: null,
      },
      appData: {
        type: Object,
        default: null,
      },
      isActive: {
        type: Boolean,
        default: false,
      },
    },
  ],
  tokens: [
    {
      token: {
        type: String,
        required: [true, "Token Required"],
      },
    },
  ],
});

//Fields TO Remove From Response
userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.otp;
  delete userObject.tokens;
  delete userObject.otp_verified;

  return userObject;
};

//For Generating JWT Token While SignUp And Login
userSchema.methods.generateAuthToken = async function () {
  const user = this;

  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);

  user.tokens = user.tokens.concat({ token });
  await user.save();

  return token;
};

// Hash the plain text password before saving
userSchema.pre("save", async function (next) {
  const user = this;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

//Error While Duplicate values
userSchema.post("save", function (error, doc, next) {
  if (error.name === "MongoError" && error.code === 11000) {
    next(new Error(`${Object.keys(error.keyPattern)} already exists`));
  } else {
    next();
  }
});

//1 Get User In Forget Password
userSchema.statics.getUser = async (body) => {
  let user;
  if (body.email.length > 0) {
    user = await User.findOne({
      email: body.email,
    });
    if (!user) {
      throw new Error("No user Found Please Signup!");
    }
    user.otp = null;
    user.otp_verified = false;
    await sendMail(user);
    user.otp = OTP;
    await user.save();
    setTimeout(() => {
      user.otp = null;
      user.save();
    }, 60000);
    return user;
  } else if (body.phoneNumber.length > 0) {
    user = await User.findOne({
      phoneNumber: body.phoneNumber,
    });
    if (!user) {
      throw new Error("No user Found Please Signup!");
    }
    user.otp = null;
    user.otp_verified = false;
    await sms(user);
    user.otp = otp;
    await user.save();
    setTimeout(() => {
      user.otp = null;
      user.save();
    }, 60000);
    return user;
  }
};

//2 verify Otp
userSchema.statics.verifyOtp = async (body) => {
  let user;
  if (body.email.length > 0) {
    user = await User.findOne({ email: body.email });
  } else if (body.phoneNumber.length > 0) {
    user = await User.findOne({ phoneNumber: body.phoneNumber });
  }
  if (user.otp === null) {
    throw new Error("Otp Expired!");
  }
  if (user.otp != body.otp) {
    throw new Error("Please Enter Valid OTP");
  }
  user.otp_verified = true;
  await user.save();
  return user;
};

//3 Reset Password
userSchema.statics.resetPassword = async (body) => {
  let user;
  if (body.email.length > 0) {
    user = await User.findOne({ email: body.email });
  } else if (body.phoneNumber.length > 0) {
    user = await User.findOne({ phoneNumber: body.phoneNumber });
  }
  if (user.otp_verified != true) {
    throw new Error("Please Verify Your Email");
  }
  user.password = body.password;
  user.otp = null;
  user.otp_verified = false;
  user.tokens = [];
  await user.save();
  return user;
};

//Login By Email,phoneNumber
userSchema.statics.findByCredentials = async (body) => {
  let data;
  let user;
  if (body.email.length > 0 && body.password.length > 0) {
    data = {
      email: body.email,
      password: body.password,
    };
    user = await User.findOne({ email: data.email });
  } else if (body.phoneNumber.length > 0 && body.password.length > 0) {
    data = {
      phoneNumber: body.phoneNumber,
      password: body.password,
    };
    user = await User.findOne({ phoneNumber: data.phoneNumber });
  }
  if (!user) {
    throw new Error("No User Found Please SignUp!");
  }

  const isMatch = await bcrypt.compare(data.password, user.password);

  if (!isMatch) {
    throw new Error("Password Is Incorrect");
  }

  return user;
};

const User = mongoose.model("user", userSchema);

module.exports = User;
