const mongoose = require("mongoose");

const socialSchema = new mongoose.Schema({
  title: {
    type: String,
    default: null,
  },
  icon1: {
    type: String,
    default: null,
  },
  icon2: {
    type: String,
    default: null,
  },
  color1: {
    type: String,
    default: null,
  },
  color2: {
    type: String,
    default: null,
  },
  defaultLink: {
    type: String,
    default: null,
  },
});

const Social = mongoose.model("social", socialSchema);

module.exports = Social;
