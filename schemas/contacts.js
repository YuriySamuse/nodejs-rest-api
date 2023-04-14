const Joi = require("joi");

const addShema = Joi.object({
	name: Joi.string().min(3).required().messages({
		"any.required": `"name" is required`,
		"string.empty": `"name" cannot be empty`,
		"string.base": `"name" must be string`,
	}),
	email: Joi.string()
		.email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
		.required()
		.messages({
			"any.required": `"email" is required`,
			"string.empty": `"email" cannot be empty`,
		}),
	phone: Joi.string().min(1).max(15).required().messages({
		"any.required": `"phone" is required`,
		"string.empty": `"phone" cannot be empty, min 1 max 15 leters.`,
	}),
});

module.exports = {
	addShema,
};