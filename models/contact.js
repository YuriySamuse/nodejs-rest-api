const { Schema, model } = require("mongoose");
const Joi = require("joi");

const { handleMongooseEroor } = require("../utils");

const contactSchema = new Schema(
	{
		name: {
			type: String,
			required: [true, "Set name for contact"],
		},
		email: {
			type: String,
		},
		phone: {
			type: String,
		},
		favorite: {
			type: Boolean,
			default: false,
		},
		owner: {
			type: Schema.Types.ObjectId,
			ref: "user",
			required: true,
		},
	},
	{ versionKey: false, timestamps: false }
);

contactSchema.post("save", handleMongooseEroor);

const addShema = Joi.object({
	name: Joi.string().min(3).required().messages({
		"any.required": `missing required name field`,
		"string.empty": `"name" cannot be empty`,
		"string.base": `"name" must be string`,
	}),

	email: Joi.string()
		.email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
		.required()
		.messages({
			"any.required": `missing required email field`,
			"string.empty": `"email" cannot be empty`,
		}),

	phone: Joi.string().min(1).max(15).required().messages({
		"any.required": `missing required phone field`,
		"string.empty": `"phone" cannot be empty, min 1 max 15 leters.`,
	}),
	favorite: Joi.boolean().messages({
		"boolean.base": `favorite must be boolean`,
	}),
});

const putShema = Joi.object({
	name: Joi.string().min(3).messages({
		"any.required": `"name" is required`,
		"string.empty": `"name" cannot be empty`,
		"string.base": `"name" must be string`,
	}),
	email: Joi.string()
		.email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
		.messages({
			"any.required": `"email" is required`,
			"string.empty": `"email" cannot be empty`,
		}),

	phone: Joi.string().min(1).max(15).messages({
		"any.required": `"phone" is required`,
		"string.empty": `"phone" cannot be empty, min 1 max 15 leters.`,
	}),
	favorite: Joi.boolean().messages({
		"boolean.base": `favorite must be boolean`,
	}),
});

const patchFavoriteSchema = Joi.object({
	favorite: Joi.boolean().required().messages({
		"any.required": `missing field favorite`,
		"boolean.base": `favorite must be boolean`,
	}),
});

const Contact = model("contact", contactSchema);

const schemas = {
	addShema,
	putShema,
	patchFavoriteSchema,
};

module.exports = {
	Contact,
	schemas,
};
