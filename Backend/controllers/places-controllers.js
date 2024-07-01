const { validationResult } = require("express-validator");
const { v4: uuidv4 } = require("uuid");
const place = require("../models/place");

//STEP 1:
//NOTE: use a capital 'P' as this is a constructor function
const Place = require("../models/place");

const DUMMY_PLACES = [
  {
    id: "p1",
    title: "Rowan Univerity",
    description: "Best university in the nation!",
    location: {
      lat: 39.709973,
      lng: -75.1213819,
    },
    adress: "201 Mullica Hill Rd, Glassboro, NJ 08028",
    creator: "userId1",
  },
];

//STEP 4 - lets use our PLACE model
const getPlacesById = async (req, res, next) => {
  const placeId = req.params.placeId; // {placeId: 'p1'}

  // //we can get our place using Dummy places
  // const place = DUMMY_PLACES.find(p => {
  //     return p.id === placeId;
  // });

  //STEP 5 - lets use our PLACE model
  //we will use FINDBYID method that is provided by Mongoose
  //FindByID is a STATIC method
  //in constrast to SAVE it does not return a promise
  //NOTE: if you need a promise you can call "Places.findById().exec()"
  //FindByID may take some time to run so Async the getPlacesById and await
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Something went wrong, could not find a place." });
  }

  if (!place) {
    //return res.status(404).json({message: 'Could not find a place for given ID'});
    const error = new Error("Coult not find a place for the provided ID");
    error.code = 404;
    throw error; //this will triggler ERROR handling middleware
  }

  //STEP 6 - lests turn our Place object into normal JavaScript Object
  //res.json({place}); // equivelant => { place } => { place: place }

  //NOTE: the get rid of the "underscore" from the ID property
  //Note: Mongoose adds an ID getter to every document that returns the ID as a string
  //this will tell mongoose to add an ID property to the created object
  res.json({ place: place.toObject({ getters: true }) }); // equivelant => { place } => { place: place }
};

const getPlaceByUserID = async (req, res, next) => {
  const userId = req.params.uid;

  //STEP 7 - lets use our PLACES model
  // const place = DUMMY_PLACES.find(p => {
  //     return p.creator === userId;
  // });

  //FIND is similiar to FindByID that it doesn ot return a promise
  //but FIND allows us to use Async Await
  //NOTE: using FIND would return ALL places so need to add "userid" as argument
  //NOTE: FIND is available in both MongoDB and Mongoose
  //  In MongoDB it returns a Cursor and iterate through the results
  //  In Mongoose it returns a Array (can use Cursor property on Find() if want to return Curosor)
  let places;
  try {
    places = await Place.find({ creator: userId });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Fetching places has failed, please try again later" });
  }

  if (!place) {
    //return res.status(404).json({message: 'Could not find a place for given user ID'});
    const error = new Error("Coult not find a place for the provided ID");
    error.code = 404;

    return next(error); //this will triggler ERROR handling middleware
  }

  //return the response with the place that matches UserID

  //STEP 7 - need to add a method to our Places
  //res.json({place});
  res.json({
    places: places.map((place) => place.toObject({ getters: true })),
  });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return res
      .status(422)
      .json({ message: "Invalid inputs, please check post data" });
  }

  const { title, description, coordinates, creator } = req.body;

  console.log(req.body);

  const createdPlace = new Place({
    title,
    description,
    location: JSON.parse(coordinates),
    image: req.file.path,
    creator,
  });

  try {
    await createdPlace.save();
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Creating place failed, please try again" });
  }

  res.status(201).json({ place: createdPlace });
};

//Need to add this to our exports bundle
exports.createPlace = createPlace;
exports.getPlacesById = getPlacesById;
exports.getPlaceByUserID = getPlaceByUserID;
