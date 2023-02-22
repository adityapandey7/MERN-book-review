const { default: mongoose } = require("mongoose");

const Schema = mongoose.Schema;

const reviewSchema = Schema({
  title: { type: String, required: [true, "Please enter a title"] },
  description: { type: String, required: [true, "Please enter description"] },
  image: {
    type: String,
    required: [true, "Please provide image for reference"],
  },
  // rating: {
  //   type: Number,
  //   required: [true, "Please provide rating based on your exp."],
  // },
  creator: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
});

module.exports = mongoose.model("Review", reviewSchema);
