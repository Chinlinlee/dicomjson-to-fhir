/**
 * @description
 * For practitioners, this is the information that describes the contact point
 */
class ContactPoint {
    constructor() {
        this.system = "phone";
        /** @type { string | undefined } */
        this.value = undefined;
        this.use = "work";
    }
}

module.exports.ContactPoint = ContactPoint;