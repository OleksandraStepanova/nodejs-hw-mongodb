import { Router } from "express";
import { createContactController, deleteContactController, getAllContactsController, getContactByIdController, patchContactController } from "../controllers/contacts.js";
import { ctrlWrapper } from "../utils/ctrlWrapper.js";
import { validateBody } from "../middlewares/validateBody.js";
import { createContactSchema, updateContactSchema } from "../validation/contacts.js";
import { isValidId } from '../middlewares/isValidId.js';
import { authenticate } from "../middlewares/authenticate.js";
import { upload } from "../middlewares/multer.js";


const router = Router();

router.use(authenticate);

router.get("/", ctrlWrapper(getAllContactsController));

router.get("/:id", isValidId, ctrlWrapper(getContactByIdController));

router.post("/", upload.single('photo'), validateBody(createContactSchema), ctrlWrapper(createContactController));

router.patch("/:id", isValidId, upload.single('photo'), validateBody(updateContactSchema), ctrlWrapper(patchContactController));

router.delete("/:id", isValidId, ctrlWrapper(deleteContactController));

export default router;
