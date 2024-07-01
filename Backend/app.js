const express = require("express");
const bodyParser = require("body-parser");

//STEP 1 import Mongoose
const Mongoose = require("mongoose");

const placesRoutes = require("./routes/places-routes");
const usersRoutes = require("./routes/users-routes");
const { default: mongoose } = require("mongoose");

//STEP 2: to create absolute paths
const path = require("path");

const app = express();

//STEP 1 add a new MiddleWare that parses the data
//routes are read top to bottom
//first parse the body then reach the routes
//NOTE: bodyParser.JSON will parse any JSON data and desearlize into JavaScript
//then it will call NEXT and fall into the next middleware which is "/api/places"
app.use(bodyParser.json());

//STEP 1: add a new middleware to hand static image files
//requests will be handled by special middleware called EXPRESS.STATIC()
//express.static takes in a path (must be absolute path)
//any files in the UPLOADS folder will be returns
app.use("/uploads/images", express.static(path.join("uploads", "images")));

//STEP 1 - add a middleware function
//the idea is that we do not send back a response but add certain headers to the response
app.use((req, res, next) => {
  //This allows us to controls with domains have access to these resources
  res.setHeader("Access-Control-Allow-Origin", "*");

  //This controls within headers are allowed
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  //This basically controls which HTTP methods can be used on the frontend
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");

  //move to next middleware
  next();
});

app.use("/api/places", placesRoutes);
app.use("/api/users", usersRoutes);

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occured" });
});

//STEP 2
//mongoose.connect().then().catch();
const url =
  "mongodb+srv://project-7:lAcQLkLBfYDGT5qR@cluster0.wt9obem.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose
  .connect(url)
  .then(() => {
    app.listen(3001);
  })
  .catch((err) => {
    console.log(err);
  });

//app.listen(3001);
