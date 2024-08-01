import { Router } from "express";
import { createContactController, deleteContactController, getAllContactsController, getContactByIdController, patchContactController } from "../controllers/contacts.js";
import { ctrlWrapper } from "../utils/ctrlWrapper.js";
import { validateBody } from "../middlewares/validateBody.js";
import { createContactSchema, updateContactSchema } from "../validation/contacts.js";
import { isValidId } from '../middlewares/isValidId.js';


const router = Router();

router.get("/contacts", ctrlWrapper(getAllContactsController));

router.get("/contacts/:id", isValidId, ctrlWrapper(getContactByIdController));

router.post("/contacts", validateBody(createContactSchema), ctrlWrapper(createContactController));

router.patch("/contacts/:id", isValidId, validateBody(updateContactSchema), ctrlWrapper(patchContactController));

router.delete("/contacts/:id", isValidId, ctrlWrapper(deleteContactController));

export default router;
