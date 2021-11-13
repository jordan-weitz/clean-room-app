const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");

//UPDATE USER
// this put request will be executed when a post request is sent to
// /api/users/ID_NUMBER_HERE
// we give the variable the name id "/:id"
router.put("/:id", async (req, res) => {
	// we then check if the id from the request body matches the id in the URL parameter
	// OR if the request user is an admin
	if (req.body.userId === req.params.id || req.body.isAdmin) {
		//if those criteria hold true then we check if they are trying to update the password
		// if they are then a password field will have been included in the request body
		if (req.body.password) {
			try {
				//if a password was included in the request body then we generate some salt
				// and use brcypt to generate a hashed password which we then plug back into
				// the request body variable so that later we can update the user using
				// all the request body variables at once.
				const salt = await bcrypt.genSalt(10);
				req.body.password = await bcrypt.hash(req.body.password, salt);
			} catch (err) {
				//notice that this code is a return statement. I believe that exits the
				// loop!
				return res.status(500).json(err);
			}
		}
		try {
			// here we try to create a user object by using a method on the User
			// model itself that searches the DB and finds a user with a matching id
			// then updates that user object in the DB using all the request body variables
			const user = await User.findByIdAndUpdate(req.params.id, {
				$set: req.body,
			});
			res.status(200).json("Account has been updated!");
		} catch (err) {
			return res.status(500).json(err);
		}
	} else {
		// if the req body id and URL parameter id don't match && the user is not an
		// admin then we send a 403 status and inform user that they are only
		//able to update their own account.
		return res.status(403).json("You can update only your account");
	}
});

// DELETE USER
// this code will be executed when a http delete request is submitted to
// api/users/ID_NUMBER_HERE
// we specify that an id should be included in the url "/:id"
// then later on we can refer to this id as req.params.id
router.delete("/:id", async (req, res) => {
	// we check if user id of req body matches the id in parameter
	if (req.body.userId === req.params.id || req.body.isAdmin) {
		try {
			//we try to create user object and use our User model to find and delete
			// the user that matches the req parameter id
			const user = await User.findByIdAndDelete(req.params.id);
			res.status(200).json("Account has been deleted successfully");
		} catch (err) {
			return res.status(500).json(err);
		}
	} else {
		return res.status(403).json("You can only delete your own account");
	}
});

// get user
// this code is executed when a get request with an id parameter is passed to /api/users/
// we specify the request should have an id "/:id" <-- the colon specifies a variable
// then we can later refer to it as req.params.id
router.get("/:id", async (req, res) => {
	try {
		// we create a user object using our User models findById method and pass the
		// parameter id as the argument
		const user = await User.findById(req.params.id);
		// so we don't want to send the password in the response
		// this code desconstructs the user document(all the variables) and we take
		// out the password and updatedAt variables and we will just return "others"
		const { password, updatedAt, ...other } = user._doc;
		res.status(200).json(other);
	} catch (err) {
		res.status(500).json(err);
	}
});

// follow a user
// this code will be executed when a put request is sent to /api/users/ID_NUMBER_HERE/follow

router.put("/:id/follow", async (req, res) => {
	// we check to ensure user is not trying to follow themselves
	if (req.body.userId !== req.params.id) {
		try {
			// we create two users, the person wants to follow someone
			// and the user that will be follower
			const user = await User.findById(req.params.id);
			const currentUser = await User.findById(req.body.userId);
			//check to ensure the user is not already following that person
			// so that they cant follow them twice
			if (!user.followers.includes(req.body.userId)) {
				// we update the person getting followed and add the userId to the followers list
				await user.updateOne({ $push: { followers: req.body.userId } });
				// we update the person following someone else by adding the id to the following list
				await currentUser.updateOne({ $push: { following: req.params.id } });
				res.status(200).json("You are now following " + user.username);
			} else {
				res.status(403).json("You already follow this user");
			}
		} catch (err) {
			res.status(500).json(err);
		}
	} else {
		res.status(403).json("You can't follow yourself");
	}
});

//unfollow a user
router.put("/:id/unfollow", async (req, res) => {
	// we check to ensure user is not trying to follow themselves
	if (req.body.userId !== req.params.id) {
		try {
			// we create two users, the person wants to follow someone
			// and the user that will be follower
			const user = await User.findById(req.params.id);
			const currentUser = await User.findById(req.body.userId);
			//check to ensure the user is not already following that person
			// so that they cant follow them twice
			if (user.followers.includes(req.body.userId)) {
				// we update the person getting followed and add the userId to the followers list
				await user.updateOne({ $pull: { followers: req.body.userId } });
				// we update the person following someone else by adding the id to the following list
				await currentUser.updateOne({ $pull: { following: req.params.id } });
				res.status(200).json("You are no longer following " + user.username);
			} else {
				res.status(403).json("You do not follow this user");
			}
		} catch (err) {
			res.status(500).json(err);
		}
	} else {
		res.status(403).json("You can't unfollow yourself");
	}
});

module.exports = router;
