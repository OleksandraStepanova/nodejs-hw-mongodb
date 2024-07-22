import { ContactsCollection } from "../db/modells/contacts.js";

export const getAllContacts = async () => {
    const contacts = ContactsCollection.find();
    return contacts;
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
