const express = require("express");

//STEP 1: import express validator
//we need object destructoring to import the CHECK method
//CHECK method is actually a fucntion we can execute
//it will actually return a new middleware configured for our validation requirements
const { check } = require("express-validator");

const placesControllers = require("../controllers/places-controllers");
const fileUpload = require("../middleware/file-upload");

const router = express.Router();

router.get("/:placeId", placesControllers.getPlacesById);
router.get("/user/:uid", placesControllers.getPlaceByUserID);

//STEP 1: note that we can register multiple (chained) middle ware on same Method + Path combination
//Example: we want to ensure "title" is not empty
router.post(
  "/",
  fileUpload.single("image"),
  [check("title").notEmpty(), check("description").isLength({ min: 5 })],
  placesControllers.createPlace
);

module.exports = router;
