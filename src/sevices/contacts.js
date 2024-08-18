import { SORT_ORDER } from "../constants/index.js";
import { ContactsCollection } from "../db/modells/contacts.js";
import { calculatePaginationData } from "../utils/calculatePaginationData.js";

export const getAllContacts = async ({ page=1, perPage=10, sortOrder=SORT_ORDER.ASC, sortBy='_id', filter={}, id}) => {
    const limit = perPage;
    const skip = (page - 1) * perPage;

    const contactsQuery = ContactsCollection.find({userId:id});

    if (filter.contactType) {
        contactsQuery.where('contactType').equals(filter.contactType);
    }

    if (filter.isFavourite) {
        contactsQuery.where('isFavourite').equals(filter.isFavourite);
    }

    const [contactsCount, contacts] = await Promise.all([
        ContactsCollection.find({userId:id}).merge(contactsQuery).countDocuments(),
        contactsQuery.skip(skip).limit(limit).sort({ [sortBy]: sortOrder }).exec(),
    ]);

    const paginationData = calculatePaginationData(contactsCount, perPage, page);

    return {
        data: contacts,
        ...paginationData,
    };
};

export const getContactById = async (contactID, userId) => {
    const contact = ContactsCollection.findOne({_id:contactID, userId});
    return contact;
};

export const createContact = async (userId, payload) => {
    const contact = await ContactsCollection.create({userId:userId, ...payload});
    return contact;
};

export const updateContact = async (contactId, payload, userId,) => {
    const rowResult = await ContactsCollection.findOneAndUpdate(
        { _id: contactId, userId},
        payload,
    );

    if (!rowResult) return null;

    const result = await ContactsCollection.findById(contactId);

    return {
        contact: result,
    };

};

export const deleteContact = async (contactId, userId) => {
    const contact = await ContactsCollection.findOneAndDelete({
        _id: contactId,
        userId
    });

    return contact;
};
