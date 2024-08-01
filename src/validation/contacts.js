import Joi from 'joi';

export const createContactSchema = Joi.object({
    name: Joi.string().min(3).max(20).required(),
    phoneNumber: Joi.string().pattern(/^\+[1-9]\d{7,14}$/).required().messages({
        'string.pattern.base': 'Phone number must be a valid international number starting with + and followed by 8 to 15 digits.',
    }),
    email: Joi.string().min(3).max(20).email(),
    isFavourite: Joi.boolean(),
    contactType: Joi.string().valid('work', 'home', 'personal').required()
});

export const updateContactSchema = Joi.object({
    name: Joi.string().min(3).max(20),
    phoneNumber: Joi.string().pattern(/^\+[1-9]\d{7,14}$/).messages({
        'string.pattern.base': 'Phone number must be a valid international number starting with + and followed by 8 to 15 digits.'
    }),
    email: Joi.string().min(3).max(20).email(),
    isFavourite: Joi.boolean(),
    contactType: Joi.string().valid('work', 'home', 'personal')
});
