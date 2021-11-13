const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const postRoute = require("./routes/post");

const app = express();

//this starts the dotenv library. This allows you to put global variables in the .env folder
dotenv.config();

// this is how we connect to our DB. the process.env.MONGO_URL is the secret key for
// our database. We placed it in the .env folder so that it wont be present in the build
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true }, () => {
	console.log("Connected to MongoDB");
});

//middleware
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));

// so when a user goes to register the app will send a post request to theauthroute
// which will then create the user using the request body.
app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/posts", postRoute);

// this is telling our express app to listen on port 8800
app.listen(8800, () => {
	console.log("Backend server is running");
});
