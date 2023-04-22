const express = require("express");

const ctrl = require("../../controllers/contacts-controllers");

const { validateBody, isValidId } = require("../../utils");

const { schemas } = require("../../models/contact");

const router = express.Router();

router.get("/", ctrl.getAllContacts);

router.get("/:contactId", isValidId, ctrl.getContactsById);

router.post("/", validateBody(schemas.addShema), ctrl.addContact);

router.delete("/:contactId", isValidId, ctrl.deleteContact);

router.put("/:contactId", validateBody(schemas.putShema), ctrl.updateContact);

router.patch(
	"/:contactId/favorite",
	validateBody(schemas.patchFavoriteSchema, "patch"),
	ctrl.updateStatusContact
);

module.exports = router;
