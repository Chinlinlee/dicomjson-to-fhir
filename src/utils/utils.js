const sanitizeNestedObject = obj => JSON.parse(JSON.stringify(obj), (key, value) => {
    return (value === null || value === "" || (typeof value === 'object' && !Object.keys(value).length) ? undefined : value)
});

module.exports.sanitizeNestedObject = sanitizeNestedObject;