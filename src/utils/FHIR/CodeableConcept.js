class CodeableConcept {
    constructor() {
        this.coding = undefined;
        /** @type { string | undefined } */
        this.text = undefined;
    }

    initCoding() {
        if (!this.coding) {
            this.coding = [];
        }
    }
}

module.exports.CodeableConcept = CodeableConcept;