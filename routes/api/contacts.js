const express = require("express");

const ctrl = require("../../controllers/contacts-controllers");

const { validateBody } = require("../../utils");
const { isValidId, authenticate } = require("../../middlewares");

const { schemas } = require("../../models/contact");

const router = express.Router();

router.get("/", authenticate, ctrl.getAllContacts);

router.get("/:contactId", authenticate, isValidId, ctrl.getContactsById);

router.post("/", authenticate, validateBody(schemas.addShema), ctrl.addContact);

router.delete("/:contactId", authenticate, isValidId, ctrl.deleteContact);

router.put(
	"/:contactId",
	authenticate,
	isValidId,
	validateBody(schemas.putShema),
	ctrl.updateContact
);

router.patch(
	"/:contactId/favorite",
	authenticate,
	isValidId,
	validateBody(schemas.patchFavoriteSchema, "patch"),
	ctrl.updateStatusContact
);

module.exports = router;
