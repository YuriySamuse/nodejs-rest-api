const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const fs = require("fs/promises");
const path = require("path");
const Jimp = require("jimp");
const { nanoid } = require("nanoid");

const { ctrlWrapper } = require("../utils/ctrlWrapper");

const { User } = require("../models/user");

const { HttpError, sendEmail } = require("../helpers");

const { SECRET_KEY, BASE_URL } = process.env;

const avatarsDir = path.join(__dirname, "../", "public", "avatars");

const register = async (req, res) => {
	const { email, password } = req.body;
	const user = await User.findOne({ email });
	if (user) {
		throw HttpError(409, "Email in use");
	}

	const hashPassword = await bcrypt.hash(password, 10);
	const avatarURL = gravatar.url(email);
	const verificationToken = nanoid();

	const result = await User.create({
		...req.body,
		password: hashPassword,
		avatarURL,
		verificationToken,
	});

	const verifyEmail = {
		to: email,
		subject: "Verify email",
		html: `<p>To confirm registration follow the <a target='_blank href="${BASE_URL}/users/verify/${verificationToken}">Link</a></p>`,
	};

	await sendEmail(verifyEmail);

	if (!result) {
		throw HttpError(404, "Not found");
	}
	res.status(201).json({
		user: {
			email: result.email,
			subscription: result.subscription,
		},
	});
};

const verify = async (req, res) => {
	const { verificationToken } = req.params;
	const user = await User.findOne({ verificationToken });
	if (!user) {
		throw HttpError(404, "User not found");
	}

	await User.findByIdAndUpdate(user._id, {
		verify: true,
		verificationToken: "",
	});
	res.status(200).json({
		message: "Verification successful",
	});
};

const resendVerifyEmail = async (req, res) => {
	const { email } = req.body;
	const user = await User.findOne({ email });
	if (!user) {
		throw HttpError(404, "missing required field email");
	}
	if (user.verify) {
		throw HttpError(400, "Verification has already been passed");
	}

	const verifyEmail = {
		to: email,
		subject: "Verify email",
		html: `<p>To confirm registration follow the <a target='_blank href="${BASE_URL}/users/verify/${user.verificationToken}">Link</a></p>`,
	};

	await sendEmail(verifyEmail);

	res.status(200).json({
		message: "Verification email sent",
	});
};

const login = async (req, res) => {
	const { email, password } = req.body;
	const user = await User.findOne({ email });
	if (!user) {
		throw HttpError(401, "Email or password is wrong");
	}
	if (!user.verify) {
		throw HttpError(401, "Email not verify");
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

const updateAvatar = async (req, res) => {
	const { _id } = req.user;
	const { path: tempUpload, filename } = req.file;

	await Jimp.read(`${tempUpload}`)
		.then((image) => {
			return image
				.resize(250, 250) // resize
				.writeAsync(`${tempUpload}`); // save
		})
		.catch((err) => {
			console.error(err);
		});

	const avatarName = `${_id}_${filename}`;
	const resultUpload = path.join(avatarsDir, avatarName);
	await fs.rename(tempUpload, resultUpload);
	const avatarURL = path.join("avatars", avatarName);
	await User.findByIdAndUpdate(_id, { avatarURL });

	res.json({ avatarURL });
};

module.exports = {
	register: ctrlWrapper(register),
	login: ctrlWrapper(login),
	getCurrent: ctrlWrapper(getCurrent),
	logout: ctrlWrapper(logout),
	updateSubskription: ctrlWrapper(updateSubskription),
	updateAvatar: ctrlWrapper(updateAvatar),
	verify: ctrlWrapper(verify),
	resendVerifyEmail: ctrlWrapper(resendVerifyEmail),
};
