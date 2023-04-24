const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { ctrlWrapper } = require("../utils/ctrlWrapper");

const { User } = require("../models/user");

const { HttpError } = require("../helpers");

const { SECRET_KEY } = process.env;

const register = async (req, res) => {
	const { email, password } = req.body;
	const user = await User.findOne({ email });
	if (user) {
		throw HttpError(409, "Email in use");
	}

	const hashPassword = await bcrypt.hash(password, 10);

	const result = await User.create({ ...req.body, password: hashPassword });
	if (!result) {
		throw HttpError(404, "Not found");
	}
	res.status(201).json({
		email: result.email,
		subscription: result.subscription,
	});
};

const login = async (req, res) => {
	const { email, password } = req.body;
	const user = await User.findOne({ email });
	if (!user) {
		throw HttpError(401, "Email or password is wrong");
	}
	const passwordCompare = await bcrypt.compare(password, user.password);
	if (!passwordCompare) {
		throw HttpError(401, "Email or password is wrong");
	}

	const payload = {
		id: user._id,
	};
	const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "23h" });
	await User.findByIdAndUpdate(user._id, { token });

	res.json({
		token,
		user: {
			email: user.email,
			subscription: user.subscription,
		},
	});
};

const getCurrent = async (req, res) => {
	const { name, email } = req.user;
	res.json({
		name,
		email,
	});
};

const logout = async (req, res) => {
	const { _id } = req.user;
	await User.findByIdAndUpdate(_id, { token: "" });

	res.status(204).json();
};

const updateSubskription = async (req, res) => {
	const { _id: id } = req.user;
	const { subscription: newSubscription } = req.body;
	const result = await User.findByIdAndUpdate(
		id,
		{ subscription: newSubscription },
		{ new: true }
	);
	res.json({
		message: `Subscription set to '${result.subscription}'`,
		user: {
			name: result.name,
			email: result.email,
			subscription: result.subscription,
		},
	});
};

module.exports = {
	register: ctrlWrapper(register),
	login: ctrlWrapper(login),
	getCurrent: ctrlWrapper(getCurrent),
	logout: ctrlWrapper(logout),
	updateSubskription: ctrlWrapper(updateSubskription),
};
