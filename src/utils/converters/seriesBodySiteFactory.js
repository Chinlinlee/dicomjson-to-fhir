const { DicomJson } = require("../DICOM/dicomJson");
const { Coding } = require("../FHIR/Coding");
const BODY_SITE_CODE = require("../DICOM/bodySite-code.json");

class SeriesBodySiteFactory {
    constructor(dicomJson) {
        this.dicomJson = dicomJson;
    }

    make() {
        let dicomBodyPartExamined = DicomJson.getString(this.dicomJson, "00180015");
        if (!dicomBodyPartExamined) return undefined;
        
        let coding = new Coding();
        coding.system = "http://snomed.info/sct";

        let bodyPartSnomed = BODY_SITE_CODE.find(v => v.BodyPartExamined === dicomBodyPartExamined);
        if (!bodyPartSnomed) return undefined;

        coding.code = bodyPartSnomed?.CodeValue;
        coding.display = bodyPartSnomed?.CodeMeaning;

        return coding;
    }
}

module.exports.SeriesBodySiteFactory = SeriesBodySiteFactory;