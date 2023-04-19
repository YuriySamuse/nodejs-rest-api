const mongoose = require("mongoose");

const app = require("./app");

const DB_HOST =
	"mongodb+srv://Samusev:SOeQfiJieJf0Qjrn@cluster0.bjowjll.mongodb.net/db-contacts?retryWrites=true&w=majority";

// SOeQfiJieJf0Qjrn

mongoose
	.connect(DB_HOST)
	.then(() =>
		app.listen(3000, () => {
			console.log("Database connection successful");
		})
	)
	.catch((error) => console.log(error.message));

// app.listen(3000, () => {
// 	console.log("Server running. Use our API on port: 3000");
// });
