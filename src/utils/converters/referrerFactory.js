const { DicomJson } = require("../DICOM/dicomJson");
const { Practitioner } = require("../FHIR/Practitioner");
const { HumanName, HumanNameUseCode } = require("../FHIR/HumanName");
const { Address } = require("../FHIR//Address.js");
const { uid } = require("uid/secure");
const { setDicomPersonNameToFhirHumanNameMapping } = require("./setDicomPNToFhirHumanNameMapping.js");
const { ContactPoint } = require("../FHIR/ContactPoint.js");

class ReferrerFactory {
    constructor(dicomJson) {
        this.dicomJson = dicomJson;
    }

    make() {
        let nameOfReferringPhysician = DicomJson.getValue(this.dicomJson, "00080090");

        let referringPhysician = new Practitioner();
        referringPhysician.id = uid(16);
        if (!nameOfReferringPhysician) {
            return undefined;
        }

        let name = new HumanName();
        name.use = HumanNameUseCode.usual;
        name.text = nameOfReferringPhysician?.[0]?.Alphabetic;

        let parsedPersonName = DicomJson.parsePersonName(nameOfReferringPhysician?.[0]?.Alphabetic);

        for (let key in parsedPersonName) {
            setDicomPersonNameToFhirHumanNameMapping[key](parsedPersonName, parsedPersonName);
        }
        referringPhysician.name = [];
        referringPhysician.name.push(name.toJson());

        let institutionName = DicomJson.getString(this.dicomJson, "00080096.00080080");
        let institutionCodeValue = DicomJson.getString(this.dicomJson, "00080096.00080082.00080100");
        let institutionCodeMeaning = DicomJson.getString(this.dicomJson, "00080096.00080082.00080104");

        if (institutionName) {
            let fhirInstitutionAddress = new Address();
            fhirInstitutionAddress.use = "work";
            fhirInstitutionAddress.text = institutionName;
            referringPhysician.initAddress();
            referringPhysician.address.push((fhirInstitutionAddress));
        } 

        if (institutionCodeValue) {
            let fhirInstitutionAddress = new Address();
            fhirInstitutionAddress.use = "work";
            let institutionCodingSchemeDesignator = DicomJson.getString(this.dicomJson, "00080096.00080082.00080102");
            let institutionCodingSchemeVersion = DicomJson.getString(this.dicomJson, "00080096.00080082.00080103");
            fhirInstitutionAddress.text = [institutionCodeValue, institutionCodingSchemeDesignator, institutionCodingSchemeVersion].join(" ");
            referringPhysician.initAddress();
            referringPhysician.address.push((fhirInstitutionAddress));
        } 

        if (institutionCodeMeaning) {
            let fhirInstitutionAddress = new Address();
            fhirInstitutionAddress.use = "work";
            fhirInstitutionAddress.text = institutionCodeMeaning;
            referringPhysician.initAddress();
            referringPhysician.address.push(fhirInstitutionAddress);
        }

        let personAddress = DicomJson.getString(this.dicomJson, "00080096.00401102");
        if (personAddress) {
            let fhirAddress = new Address();
            fhirAddress.use = "work";
            fhirAddress.type = "physical";
            fhirAddress.text = personAddress;
            referringPhysician.initAddress();
            referringPhysician.address.push(fhirAddress);
        }

        let telephoneNumber = DicomJson.getString(this.dicomJson, "00080096.00401103");
        if (telephoneNumber) {
            let contactPoint = new ContactPoint();
            contactPoint.value = telephoneNumber;
            referringPhysician.telecom = [];
            referringPhysician.telecom.push(contactPoint);
        }

        return referringPhysician.toJson();
    }
}

module.exports.ReferrerFactory = ReferrerFactory;