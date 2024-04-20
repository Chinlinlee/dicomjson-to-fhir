const { DicomJson } = require("../DICOM/dicomJson");
const { CodeableConcept } = require("../FHIR/CodeableConcept");

class ReasonCodeFactory {
    constructor(dicomJson) {
        this.dicomJson = dicomJson;
    }

    make() {
        let dicomReasonCode = DicomJson.getString(this.dicomJson, "00400275.00401002");
        if (!dicomReasonCode) return undefined;

        let reasonCode = new CodeableConcept();
        reasonCode.text = dicomReasonCode;

        return [reasonCode];
    }
}

module.exports.ReasonCodeFactory = ReasonCodeFactory;