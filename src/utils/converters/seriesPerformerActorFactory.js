const { uid } = require("uid/secure");
const { DicomJson } = require("../DICOM/dicomJson");
const { Practitioner } = require("../FHIR/Practitioner");
const { setDicomPersonNameToFhirHumanNameMapping } = require("../converters/setDicomPNToFhirHumanNameMapping");
const { HumanName } = require("../FHIR/HumanName");
const { Identifier } = require("../FHIR/Identifier");
class SeriesPerformerActorFactory {
    constructor(dicomJson) {
        this.dicomJson = dicomJson;
    }

    make() {
        if (!this.#isHaveActor()) return undefined;

        let practitioner = new Practitioner();
        practitioner.id = uid(16);
        let performingPhysicianName = DicomJson.getString(this.dicomJson, "00081050");
        if (performingPhysicianName) {
            let humanName = this.#getNameFromPn(performingPhysicianName);
            practitioner.name = [humanName];
            return practitioner;
        }

        let performingPhysicianIdentificationSeq = DicomJson.getValue(this.dicomJson, "00081052");
        if (performingPhysicianIdentificationSeq) {
            let identifiers = this.#getIdentifierFromDicomIdentification(performingPhysicianIdentificationSeq[0]);
            practitioner.identifier = identifiers;
            return practitioner;
        }

        let operatorName = DicomJson.getValue(this.dicomJson, "00081070");
        if (operatorName) {
            let humanName = this.#getNameFromPn(operatorName);
            practitioner.name = [humanName];
            return practitioner;
        }

        let operatorIdentificationSeq = DicomJson.getValue(this.dicomJson, "00081072");
        if (operatorIdentificationSeq) {
            let identifiers = this.#getIdentifierFromDicomIdentification(operatorIdentificationSeq[0]);
            practitioner.identifier = identifiers;
            return practitioner;
        }
    }

    #isHaveActor() {
        return DicomJson.getString(this.dicomJson, "00081050") ||
            DicomJson.getValue(this.dicomJson, "00081052")?.length > 0 ||
            DicomJson.getString(this.dicomJson, "00081070") ||
            DicomJson.getValue(this.dicomJson, "00081072")?.length > 0;
    }

    #getNameFromPn(pn) {
        let humanName = new HumanName();
        humanName.use = "usual";
        let parsedPersonName = DicomJson.parsePersonName(pn?.Alphabetic);
        for (let key in parsedPersonName) {
            setDicomPersonNameToFhirHumanNameMapping[key](parsedPersonName, humanName);
        }
        return humanName;
    }

    #getIdentifierFromDicomIdentification(identification) {
        let identifiers = [];
        let institutionName = DicomJson.getString(identification, "00080080");
        if (institutionName) {
            let identifier = new Identifier();
            identifier.system = "http://www.acme.org/practitioners";
            identifier.value = institutionName;
            identifiers.push(identifier);
        }

        let codingSchemeDesignator = DicomJson.getString(identification, "00401101.00080102");
        let codingSchemeVersion = DicomJson.getString(identification, "00401101.00080103");
        let codeMeaning = DicomJson.getString(identification, "00401101.00080104");
        this.#addDicomIdentificationByCodeSeqItem(codeMeaning, codingSchemeDesignator, codingSchemeVersion, identifiers);

        let codeValue = DicomJson.getString(identification, "00401101.00080100");
        this.#addDicomIdentificationByCodeSeqItem(codeValue, codingSchemeDesignator, codingSchemeVersion, identifiers);

        let longValue = DicomJson.getString(identification, "00401101.00080119");
        this.#addDicomIdentificationByCodeSeqItem(longValue, codingSchemeDesignator, codingSchemeVersion, identifiers);

        let urnCodeValue = DicomJson.getString(identification, "00401101.00080120");
        this.#addDicomIdentificationByCodeSeqItem(urnCodeValue, codingSchemeDesignator, codingSchemeVersion, identifiers);

        return identifiers;
    }

    #addDicomIdentificationByCodeSeqItem(value, codingSchemeDesignator, codingSchemeVersion, identifiers) {
        if (value) {
            let identifier = new Identifier();
            identifier.system = "http://www.acme.org/practitioners";
            identifier.value = [value, codingSchemeDesignator, codingSchemeVersion].filter(v => v).join(" ");
            identifiers.push(identifier);
        }
    }
}

module.exports.SeriesPerformerActorFactory = SeriesPerformerActorFactory;