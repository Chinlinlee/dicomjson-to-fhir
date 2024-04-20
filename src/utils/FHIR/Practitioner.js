const { ToJsonParent } = require("./ToJsonParent");

class Practitioner extends ToJsonParent {
    constructor() {
        super();
        this.id = undefined;
        /** @type { import("./HumanName").HumanName[] | undefined } */
        this.name = undefined;
        /** @type { import("./ContactPoint").ContactPoint[] | undefined } */
        this.telecom = undefined;
        /** @type { import("./Address").Address[] | undefined } */
        this.address = undefined;
        this.gender = "unknown";
        this.resourceType = "Practitioner";
    }

    initAddress() {
        if (!this.address) this.address = [];
    }
}

module.exports.Practitioner = Practitioner;