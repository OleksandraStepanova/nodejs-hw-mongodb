import { SORT_ORDER } from "../constants/index.js";
import { ContactsCollection } from "../db/modells/contacts.js";
import { calculatePaginationData } from "../utils/calculatePaginationData.js";

export const getAllContacts = async ({ page=1, perPage=10, sortOrder=SORT_ORDER.ASC, sortBy='_id', filter={},}) => {
    const limit = perPage;
    const skip = (page - 1) * perPage;

    const contactsQuery = ContactsCollection.find();

    if (filter.contactType) {
        contactsQuery.where('contactType').equals(filter.contactType);
    }

    if (filter.isFavourite) {
        contactsQuery.where('isFavourite').equals(filter.isFavourite);
    }

    const [contactsCount, contacts] = await Promise.all([
        ContactsCollection.find().merge(contactsQuery).countDocuments(),
        contactsQuery.skip(skip).limit(limit).sort({ [sortBy]: sortOrder }).exec(),
    ]);

    const paginationData = calculatePaginationData(contactsCount, perPage, page);

    return {
        data: contacts,
        ...paginationData,
    };
};

export const getContactById = async (contactID) => {
    const contact = ContactsCollection.findById(contactID);
    return contact;
};

export const createContact = async (payload) => {
    const contact = await ContactsCollection.create(payload);
    return contact;
};

export const updateContact = async (contactId, payload) => {
    const rowResult = await ContactsCollection.findByIdAndUpdate(
        { _id: contactId },
        payload
    );

    if (!rowResult) return null;

    return {
        contact: rowResult,
    };

};

export const deleteContact = async (contactId) => {
    const contact = await ContactsCollection.findOneAndDelete({
        _id: contactId,
    });

    return contact;
};
