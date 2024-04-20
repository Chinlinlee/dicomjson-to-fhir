const { uid } = require("uid/secure");
const { DicomJson } = require("../DICOM/dicomJson");
const { Identifier } = require("../FHIR/Identifier");
const { Specimen } = require("../FHIR/Specimen");

class SeriesSpecimenFactory {
    constructor(dicomJson) {
        this.dicomJson = dicomJson;
    }

    make() {
        let dicomSpecimenIdentifier = DicomJson.getString(this.dicomJson, "00400560.00400551");
        if (!dicomSpecimenIdentifier) {
            return undefined;
        }

        let accessionIdentifier = new Identifier();
        accessionIdentifier.system = "http://lab.acme.org/specimens/2011";
        accessionIdentifier.value = dicomSpecimenIdentifier;

        let specimen = new Specimen();
        specimen.id = uid(16);
        specimen.accessionIdentifier = accessionIdentifier;

        return specimen;
    }
}

module.exports.SeriesSpecimenFactory = SeriesSpecimenFactory;