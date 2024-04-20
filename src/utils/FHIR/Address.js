class Address {
    constructor() {
        /** @type { string | undefined } */
        this.use = undefined;
        /** @type { string | undefined } */
        this.text = undefined;
        /** @type { string[] | undefined } */
        this.line = undefined;
        /** @type { string | undefined } */
        this.city = undefined;
        /** @type { string | undefined } */
        this.district = undefined;
        /** @type { string | undefined } */
        this.state = undefined;
        /** @type { string | undefined } */
        this.postalCode = undefined;
        /** @type { string | undefined } */
        this.country = undefined;
    }
}

module.exports.Address = Address;