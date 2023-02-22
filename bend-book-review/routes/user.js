const express = require("express");
const { check } = require("express-validator");

const userController = require("../Controllers/user-controller");
const fileUpload = require("../middleware/file-uploads");

const router = express.Router();

// to get all user
router.get("/", userController.getUser);

//to signup
router.post(
  "/signup",
  fileUpload.single("image"),
  [
    check("name").not().isEmpty(),
    check("email").isEmail().normalizeEmail(),
    check("password").isLength({ min: 6 }),
  ],
  userController.signup
);

router.post("/login", userController.login);

module.exports = router;
