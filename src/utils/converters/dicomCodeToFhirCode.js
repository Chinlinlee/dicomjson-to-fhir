const { DicomJson } = require("../DICOM/dicomJson");
const { CodeableConcept } = require("../FHIR/CodeableConcept");

class DicomCodeToFhirCodeFactory {
    constructor(dicomCode) {
        this.dicomCode = dicomCode;
    }

    make() {
        let codeMeaning = DicomJson.getString(this.dicomCode, "00080104");
        if (!codeMeaning) return undefined;
        let codes = [];
        let code = new CodeableConcept();
        code.text=  codeMeaning;
        codes.push(code);

        let codeValueCode = new CodeableConcept();
        let codeValue = DicomJson.getString(this.dicomCode, "00080100");
        let codingSchemeDesignator = DicomJson.getString(this.dicomCode, "00080102") || "";
        let codingSchemeVersion = DicomJson.getString(this.dicomCode, "00080103") || "";
        if (codeValue) {
            codeValueCode.text = [codeValue, codingSchemeDesignator, codingSchemeVersion].join(" ");
            codes.push(codeValueCode);
        }

        let longCodeValueCode = new CodeableConcept();
        let longCodeValue = DicomJson.getString(this.dicomCode, "00080119");
        if (longCodeValue) {
            longCodeValueCode.text = [longCodeValue, codingSchemeDesignator, codingSchemeVersion].join(" ");
            codes.push(longCodeValueCode);
        }

        let urnCodeValueCode = new CodeableConcept();
        let urnCodeValue = DicomJson.getString(this.dicomCode, "00080120");
        if (urnCodeValue) {
            urnCodeValueCode.text = [urnCodeValue, codingSchemeDesignator, codingSchemeVersion].join(" ");
            codes.push(urnCodeValue);
        }

        return codes;
    }
}

module.exports.DicomCodeToFhirCodeFactory = DicomCodeToFhirCodeFactory;