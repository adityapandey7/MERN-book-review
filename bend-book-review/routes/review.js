const express = require("express");
const auth = require("../middleware/auth");
const reviewsController = require("../Controllers/reviews-controller");
const { check } = require("express-validator");
const fileUpload = require("../middleware/file-uploads");

const router = express.Router();

//get all review
router.get("/", reviewsController.getReviews);

//get review by id
router.get("/:revId", reviewsController.getReviewById);

//auth
router.use(auth);

// get by user id
router.get("/user/:userId", reviewsController.getReviewByUserId);

// creating review
router.post(
  "/create",
  fileUpload.single("image"),
  [check("title").not().isEmpty(), check("description").isLength({ min: 5 })],
  reviewsController.createReview
);

//edit review
router.patch(
  "/:revId",
  [check("title").not().isEmpty(), check("description").isLength({ min: 5 })],
  reviewsController.updateReview
);

// delete review
router.delete("/:revId", reviewsController.deleteReview);

module.exports = router;
