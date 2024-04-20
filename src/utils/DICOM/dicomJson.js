// Native
// https://github.com/you-dont-need/You-Dont-Need-Lodash-Underscore#_get
const get = (obj, path, defaultValue = undefined) => {
    const travel = regexp =>
        String.prototype.split
            .call(path, regexp)
            .filter(Boolean)
            .reduce((res, key) => (res !== null && res !== undefined ? res[key] : res), obj);
    const result = travel(/[,[\]]+?/) || travel(/[,[\].]+?/);
    return result === undefined || result === obj ? defaultValue : result;
};

class DicomJson {
    /**
     * 
     * @param {any} data 
     * @param {string} tag 
     */
    static getString(data, tag) {
        let seqTags = tag.split(".");
        let path = seqTags.map(v => v + ".Value.0");
        let result = get(data, path);
        if (result && typeof result === "string") result = result.replace(/[\u0000]/gim, "");
        return result;
    }

    static getValue(data, tag) {
        let seqTags = tag.split(".");
        let path = seqTags.join("Value.0");
        let result = get(data, path + ".Value");
        return result;
    }

    static parsePersonName(personName) {
        if (personName === undefined) {
            return undefined;
        }
        const stringValues = personName.split('^');

        return {
            familyName: stringValues[0],
            givenName: stringValues[1],
            middleName: stringValues[2],
            prefix: stringValues[3],
            suffix: stringValues[4]
        };
    }
}

module.exports.DicomJson = DicomJson;