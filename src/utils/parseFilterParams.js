const parseContactType = (type) => {
  const isString = typeof type === 'string';
  if (!isString) return;
  const isContactType = (type) => ['work', 'home', 'personal'].includes(type);

  if (isContactType(type)) return type;
};

const parseBoolean = (boolean) => {
    const isString = typeof boolean === 'string';
    if (!isString) return;

    const isBoolean = (boolean) => ['true', 'false'].includes(boolean);

    if (isBoolean(boolean)) return boolean;
};

export const parseFilterParams = (query) => {
    const { isFavourite, contactType } = query;

    const parsedIsFavourite = parseBoolean(isFavourite);
    const parsedContactType = parseContactType(contactType);

    return {
        isFavourite: parsedIsFavourite,
        contactType: parsedContactType,
    };
};
