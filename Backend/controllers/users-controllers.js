const { validationResult } = require("express-validator");

const User = require("../models/user");

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "-password");
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Fetching places has failed, please try again later" });
  }
  res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

const signup = async (req, res, next) => {
  const { name, email, password } = req.body;

  // Check if user already exists
  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Signup failed, please try again later" });
  }

  if (existingUser) {
    return res.status(422).json({ message: "User already exists" });
  }

  // Assuming req.file.path contains the path to the uploaded image
  const imagePath = req.file.path;

  const createdUser = new User({
    name,
    email,
    password,
    image: imagePath, // Store the image path in your user document
  });

  try {
    await createdUser.save();
    res.status(201).json({ user: createdUser.toObject({ getters: true }) });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    return res.status(500).json({ message: "Login failed" });
  }

  if (!existingUser || existingUser.password !== password) {
    return res.status(422).json({ message: "Invalid credentials" });
  }

  res.json({ message: "Logged in!" });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
