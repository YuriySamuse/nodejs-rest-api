const { Schema, model } = require("mongoose");
const Joi = require("joi");

const { handleMongooseEroor } = require("../utils");

const emailRegexp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

const userSchema = new Schema(
	{
		name: {
			type: String,
			required: false,
			default: "",
		},
		email: {
			type: String,
			match: emailRegexp,
			required: [true, "Email is required"],
			unique: true,
		},
		password: {
			type: String,
			required: [true, "Set password for user"],
		},
		subscription: {
			type: String,
			enum: ["starter", "pro", "business"],
			default: "starter",
		},
		token: {
			type: String,
			defailt: "",
		},
		avatarURL: {
			type: String,
		},
		verify: {
			type: Boolean,
			default: false,
		},
		verificationToken: {
			type: String,
			required: [true, "Verify token is required"],
		},
	},
	{ versionKey: false, timestamps: false }
);

userSchema.post("save", handleMongooseEroor);

const registerSchema = Joi.object({
	name: Joi.string(),
	email: Joi.string().pattern(emailRegexp).required(),
	password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
	email: Joi.string().pattern(emailRegexp).required(),
	password: Joi.string().min(6).required(),
});

const emailSchema = Joi.object({
	email: Joi.string().pattern(emailRegexp).required(),
});

const updateSubscription = Joi.object({
	subscription: Joi.string()
		.valid("starter", "pro", "business")
		.required()
		.messages({
			"any.required": `Subscription is required`,
		}),
});

const schemas = {
	registerSchema,
	loginSchema,
	updateSubscription,
	emailSchema,
};

const User = model("user", userSchema);

module.exports = {
	User,
	schemas,
};
