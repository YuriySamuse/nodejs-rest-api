const nodemailer = require("nodemailer");
require("dotenv").config();

const { EMAIL_PASSWORD, EMAIL_FROM } = process.env;

const nodemailerConfig = {
	host: "mail.calorifics.com.ua",
	port: 465,
	secure: true,
	auth: {
		user: EMAIL_FROM,
		pass: EMAIL_PASSWORD,
	},
};

const transport = nodemailer.createTransport(nodemailerConfig);

const sendEmail = async (data) => {
	const email = { ...data, from: EMAIL_FROM };
	await transport.sendMail(email);
	return true;
};

module.exports = sendEmail;
