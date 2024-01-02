class Reference {
    constructor() {
        this.reference = undefined; //(Literal reference, Relative, internal or absolute URL)(string)
        /** @type { string } */
        this.type = undefined; //string
        /** @type { import("./Identifier").Identifier | undefined } */
        this.identifier = undefined;
        /** @type { string } */
        this.display = undefined;
    }
}
module.exports.Reference = Reference;