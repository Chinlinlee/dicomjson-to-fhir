const { uid } = require("uid/secure");
const { DicomJson } = require("../DICOM/dicomJson");
const { HumanName } = require("../FHIR/HumanName");
const { Practitioner } = require("../FHIR/Practitioner");
const { setDicomPersonNameToFhirHumanNameMapping } = require("./setDicomPNToFhirHumanNameMapping");

class InterpreterFactory {
    constructor(dicomJson) {
        this.dicomJson = dicomJson;
    }

    make() {
        let practitionerInterpreter = new Practitioner();
        practitionerInterpreter.id = uid(16);
        let name = new HumanName();
        if (this.#isNull()) {
            return undefined;
        }

        name.use = "usual";
        let dicomPersonName = DicomJson.getValue(this.dicomJson, "00081060")?.[0]?.Alphabetic;
        let dicomNameOfPhysicianReadingStudy = DicomJson.parsePersonName(dicomPersonName);
        for (let key in dicomNameOfPhysicianReadingStudy) {
            setDicomPersonNameToFhirHumanNameMapping[key](dicomNameOfPhysicianReadingStudy, name);
        }

        practitionerInterpreter.name = [];
        practitionerInterpreter.name.push(name);
        return practitionerInterpreter;
    }

    #isNull() {
        return !(this.dicomJson?.["00081060"]?.Value?.[0]);
    }
}

module.exports.InterpreterFactory = InterpreterFactory;