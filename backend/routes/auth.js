const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");

//REGISTER
// so when the router recieves a post request from /register this is what will happen
router.post("/register", async (req, res) => {
	// creating a new user

	try {
		// we use bcrypt, which we imported, to create a salt
		// then we create a hashed password using the supplied password and the salt
		// we created.
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(req.body.password, salt);

		//we then create the user object using our model of a user.
		//notice the password supplied to the object is the hashed password.
		const newUser = await new User({
			username: req.body.username,
			email: req.body.email,
			password: hashedPassword,
		});
		//this saves the user object to the mongoDB
		const user = await newUser.save();
		//send successful message back to browser and the JSON user object
		res.status(200).json(user);
	} catch (err) {
		res.status(500).json(err);
	}
});

// LOGIN
//this function will be executed when a post request is sent to api/auth/login
router.post("/login", async (req, res) => {
	try {
		// we create a user object and populate it from the mongoDB
		const user = await User.findOne({ email: req.body.email });
		// if theres no match based off of the email provided then and error is thrown
		!user && res.status(404).send("user not found");

		// if the user is matched based off the email then we check the password
		// this compare method automatically salts the password provided and then
		// attempts to match the passwords
		const validPassword = await bcrypt.compare(
			req.body.password,
			user.password
		);
		!validPassword && res.status(400).json("wrong password");
		// if the email matches and the passwords match then this code is executed
		res.status(200).send("User authenticated");
	} catch (err) {
		res.status(500).json(err);
	}
});

module.exports = router;
