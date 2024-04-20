const { ToJsonParent } = require("./ToJsonParent");

class Specimen extends ToJsonParent {
    constructor() {
        super();
        this.id = undefined;
        /** @protected */
        this.resourceType = "Specimen";
        /** @type { import("./Identifier").Identifier | undefined } */
        this.accessionIdentifier = undefined;
        /** @type {"available" | "unavailable" | "unsatisfactory" | "entered-in-error"} */
        this.status = "available";
    }
}

module.exports.Specimen = Specimen;