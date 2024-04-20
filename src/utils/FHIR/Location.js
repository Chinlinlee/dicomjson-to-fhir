/**
 * minimal implementation of FHIR Location
 */
class Location {
    constructor() {
        this.id = undefined;
        /** @protected */
        this.resourceType = "Location";
        /** @type { import("./Address").Address | undefined } */
        this.address = undefined;
    }
}

module.exports.Location = Location;