import createHttpError from 'http-errors';
import { createContact, deleteContact, getAllContacts, getContactById, updateContact } from "../sevices/contacts.js";
import { parsePaginationParams } from '../utils/parsePaginationParams.js';
import { parseSortParams } from '../utils/parseSortParams.js';
import { parseFilterParams } from '../utils/parseFilterParams.js';
import { saveFileToUploadDir } from '../utils/saveFileToUploadDir.js';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';

export const getAllContactsController = async (req, res) => {

    const { page, perPage } = parsePaginationParams(req.query);

    const { sortBy, sortOrder } = parseSortParams(req.query);

    const filter = parseFilterParams(req.query);

    const contacts = await getAllContacts({
        page,
        perPage,
        sortBy,
        sortOrder,
        filter,
        id:req.user._id,
    });

    res.status(200).json({
            status: 200,
            message: "Successfully found contacts!",
            data: contacts,
    });
};

export const getContactByIdController = async (req, res) => {

    const { id } = req.params;

    const { _id } = req.user;

    const contact = await getContactById(id, _id);

    if (!contact) {
        throw createHttpError(404, 'Contact not found');
    }

    res.status(200).json({
            status: 200,
            message: `Successfully found contact with id ${id}!`,
            data: contact,
    });
};

export const createContactController = async (req, res) => {
    const userId = req.user._id;
    const payload = req.body;

    const contact = await createContact(userId, payload);

    res.status(201).json({
        status: 201,
        message: "Successfully created a contact!",
        data: contact,
    });
};

export const patchContactController = async (req, res) => {
    const { id } = req.params;
    const photo = req.file;
    const { _id } = req.user;

    let photoUrl;

    if (photo) {
        if (process.env.ENABLE_CLOUDINARY === 'true') {
            photoUrl = await saveFileToCloudinary(photo);
        } else {
            photoUrl = await saveFileToUploadDir(photo);
        }
    }

    const payload = { ...req.body, photo: photoUrl };

    const result = await updateContact(id, payload, _id);

    if (!result) {
        throw createHttpError(404, 'Contact not found');
    }

    res.json({
        status: 200,
        message: "Successfully patched a contact!",
        data: result.contact,
    });
};

export const deleteContactController = async (req, res) => {
    const { id } = req.params;
    const { _id } = req.user;

    const contact = await deleteContact(id, _id);

    if (!contact) {
        throw createHttpError(404, 'Contact not found');
    }

    res.status(204).send();
};
