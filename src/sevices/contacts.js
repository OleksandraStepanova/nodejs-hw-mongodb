import { contactsCollection } from "../db/modells/contacts.js";

export const getAllContacts = async () => {
    const contacts = contactsCollection.find();
    return contacts;
};

export const getContactById = async (contactID) => {
    const contact = contactsCollection.findById(contactID);
    return contact;
};
