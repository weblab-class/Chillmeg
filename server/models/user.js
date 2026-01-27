const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  googleid: String,
  email: { type: String, default: "" },
  picture: { type: String, default: "" },
});

// compile model from schema
module.exports = mongoose.model("user", UserSchema);
