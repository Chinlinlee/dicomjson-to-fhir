// minimal implementation of FHIR Procedure for imaging study
class Procedure {
    constructor(patientID) {
        this.id = undefined;
        this.resourceType = "Procedure";
        /** @type { "preparation" | "in-progress" | "not-done" | "on-hold" | "stopped" | "completed" | "entered-in-error" | "unknown" } */
        this.status = "completed";
        this.subject = {
            reference: `Patient/${patientID}`
        };
        this.code = undefined;
    }
}

module.exports.Procedure = Procedure;