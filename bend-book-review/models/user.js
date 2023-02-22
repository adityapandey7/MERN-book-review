const mongoose = require("mongoose");
const mongooseUniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: [true, "Please enter your name"] },
  email: { type: String, required: [true, "Please enter Email"], unique: true },
  password: {
    type: String,
    required: [true, "Please enter Password"],
    minLength: 6,
  },
  image: { type: String, required: [true, "Please provide image"] },
  reviews: [{ type: mongoose.Types.ObjectId, required: true, ref: "Review" }],
});

userSchema.plugin(mongooseUniqueValidator);

module.exports = mongoose.model("User", userSchema);
