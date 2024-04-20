const { DicomJson } = require("../DICOM/dicomJson");
const { Coding } = require("../FHIR/Coding");

const LATERALITY_CODE = {
    "L": {
        "code": "419161000",
        "display": "Unilateral left"
    },
    "R": {
        "code": "419465000",
        "display": "Unilateral right"
    },
}

class SeriesLateralityFactory {
    constructor(dicomJson) {
        this.dicomJson = dicomJson;
    }

    make() {
        let dicomLaterality = DicomJson.getString(this.dicomJson, "00200060");
        if (!dicomLaterality) {
            return undefined;
        }

        let coding = new Coding();
        coding.system = "http://snomed.info/sct";
        try {
            coding.code = LATERALITY_CODE[dicomLaterality].code;
            coding.display = LATERALITY_CODE[dicomLaterality].display;
        } catch(e) {
            // Not valid value in dicom, use both
            coding.code = "51440002";
            coding.display = "Bilateral";
        }
        
        return coding;
    }
}

module.exports.SeriesLateralityFactory = SeriesLateralityFactory;