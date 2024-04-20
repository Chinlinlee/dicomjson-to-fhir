const { DicomJson } = require("../DICOM/dicomJson");
const { DicomCodeToFhirCodeFactory } = require("./dicomCodeToFhirCode");

class ProcedureCodeFactory {
    constructor(dicomJson) {
        this.dicomJson = dicomJson;
    }

    make() {
        let procedureCodeSeq = DicomJson.getValue(this.dicomJson, "00081032");
        if (!procedureCodeSeq?.length > 0) return undefined;

        let dicomCodeToFhirCodeFactory = new DicomCodeToFhirCodeFactory(procedureCodeSeq[0]);
        let code = dicomCodeToFhirCodeFactory.make();
        if (code) {
            return code;
        }
        return undefined;
    }
}

module.exports.ProcedureCodeFactory = ProcedureCodeFactory;