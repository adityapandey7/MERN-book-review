const HttpError = require("../models/Htpp-error");
const Review = require("../models/review");
const User = require("../models/user");
const { validationResult } = require("express-validator");
const { default: mongoose } = require("mongoose");
const fs = require("fs");

const getReviews = async (req, res, next) => {
  let reviews;

  try {
    reviews = await Review.find({});
  } catch (err) {
    const error = new HttpError(
      "Fetching user failed, please try again later",
      500
    );
    return next(error);
  }
  res.json({
    reviews: reviews.map((user) => user.toObject({ getters: true })),
  });
};

// get review by user Id

const getReviewByUserId = async (req, res, next) => {
  const userId = req.params.userId;

  let userWithReview;

  try {
    userWithReview = await User.findById(userId).populate("reviews");
  } catch (err) {
    const error = new HttpError(
      "Fetching reviews failed, please try again later.",
      500
    );
    return next(error);
  }

  if (!userWithReview || userWithReview.reviews.length === 0) {
    return next(
      new HttpError("Could not find reviews for the provided user", 404)
    );
  }
  res.json({
    reviews: userWithReview.reviews.map((review) =>
      review.toObject({ getters: true })
    ),
  });
};

// get review by Id

const getReviewById = async (req, res, next) => {
  const revId = req.params.revId;

  let review;
  try {
    review = await Review.findById(revId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find a review.",
      500
    );
    return next(error);
  }

  if (!review) {
    const error = new HttpError("Could not find the review.", 500);
    return next(error);
  }

  res.json({ review: review.toObject({ getters: true }) });
};

// create Review

const createReview = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }
  const { title, description } = req.body;
  console.log("t", title);
  console.log("d", description);
  console.log("i", req.file);

  const createdReview = new Review({
    title,
    description,
    image: req.file.path,
    // review,
    creator: req.userData.userId,
  });

  console.log("cre", createdReview);

  let user;

  try {
    user = await User.findById(req.userData.userId);
  } catch (err) {
    const error = new HttpError(
      "Creating review failed, please try again.",
      500
    );
    return next(error);
  }
  console.log("user", user);
  if (!user) {
    const error = new HttpError("Could not find user for provided id.", 404);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdReview.save({ session: sess });
    user.reviews.push(createdReview);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Creating Review Failed, Please try again.",
      500
    );
    return next(error);
  }
  res.status(201).json({ reviews: createdReview });
};

// edit review
const updateReview = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      HttpError("Invalid inputs passes, please check your data", 422)
    );
  }

  const { title, description } = req.body;
  const reviewId = req.params.revId;

  let review;

  try {
    review = await Review.findById(reviewId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update review.",
      500
    );
    return next(error);
  }
  if (review.creator.toString() !== req.userData.userId) {
    const error = new HttpError(
      "You are not allowed to edit this review.",
      401
    );
    return next(error);
  }
  review.title = title;
  review.description = description;

  try {
    await review.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update review.",
      500
    );
    return next(error);
  }
  res.status(200).json({ review: review.toObject({ getters: true }) });
};
// delete review

const deleteReview = async (req, res, next) => {
  const reviewId = req.params.revId;

  let review;
  try {
    review = await Review.findById(reviewId).populate("creator");
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete review",
      500
    );
    console.log("err", err);
    return next(error);
  }
  if (!review) {
    return next(HttpError("Could not find place for this Id", 404));
  }

  if (review.creator.id !== req.userData.userId) {
    const error = new HttpError(
      "you are not allowed to delete this review",
      401
    );
    return next(error);
  }
  const imagePath = review.image;

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    review.creator.reviews.pull(review);
    await review.creator.save({ session: sess });
    await review.remove({ session: sess });
    await await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete review.",
      500
    );
    return next(error);
  }

  fs.unlink(imagePath, (err) => {
    console.log(err);
  });

  res.status(200).json({ mess: "delete review success" });
};

exports.getReviews = getReviews;
exports.getReviewByUserId = getReviewByUserId;
exports.getReviewById = getReviewById;
exports.createReview = createReview;
exports.updateReview = updateReview;
exports.deleteReview = deleteReview;
