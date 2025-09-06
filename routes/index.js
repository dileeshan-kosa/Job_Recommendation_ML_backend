const express = require("express");
const manageJobPost = require("../controller/manageJobPost");
const manageUserProfileDetails = require("../controller/manageUserProfileDetails");
const upload = require("../middleware/upload");
const UserSignUpController = require("../controller/userSignUp");
const userSignInController = require("../controller/userSignIn");
const userLogout = require("../controller/userLogout");

const router = express.Router();

// User register an Login
router.post("/signup", UserSignUpController);
router.post("/signin", userSignInController);

//log out User
router.get("/userLogout", userLogout);

// jobpost
router.post("/add-jobpost", manageJobPost.createJobpost);
router.get("/get-jobpost", manageJobPost.getjobpostdetails);

// get user data in ID
router.get("/user-profile/:id", manageUserProfileDetails.getUserDetails);

// user profile Details
router.post(
  "/add-userprofile/:id",
  upload.single("cv_files"),
  manageUserProfileDetails.createCvData
);

// Read CV by MongoDB ID
router.get(
  "/read-user-profile/:id",
  manageUserProfileDetails.getUserProfileDetails
);

// Read prediction details
router.get(
  "/get-prediction-details/:id",
  manageUserProfileDetails.getPredictionDetails
);

module.exports = router;
