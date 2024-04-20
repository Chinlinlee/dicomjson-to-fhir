const { uid } = require("uid/secure");

const { DicomJson } = require("../DICOM/dicomJson");
const { Procedure } = require("../FHIR/Procedure");
const { DicomCodeToFhirCodeFactory } = require("./dicomCodeToFhirCode");

class ProcedureReferenceFactory {
    constructor(dicomJson, patientID) {
        this.dicomJson = dicomJson;
        this.patientID = patientID;
    }

    make() {
        let procedure = new Procedure(this.patientID);
        procedure.id = uid(12);
        let procedureCodeSeq = DicomJson.getValue(this.dicomJson, "00081032");
        if (!procedureCodeSeq?.length > 0) return undefined;

        let dicomCodeToFhirCodeFactory = new DicomCodeToFhirCodeFactory(procedureCodeSeq[0]);
        let code = dicomCodeToFhirCodeFactory.make();
        if (code) {
            procedure.code = code.at(0);
        } else {
            return undefined;
        }

        return procedure;
    }
}

module.exports.ProcedureReferenceFactory = ProcedureReferenceFactory;