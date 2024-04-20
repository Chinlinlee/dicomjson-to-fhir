const { HumanName, HumanNameUseCode } = require("./utils/FHIR/HumanName");
const { DicomJson } = require("./utils/DICOM/dicomJson");
const { uid } = require("uid/secure");
const dayjs = require("dayjs");
const { Identifier } = require("./utils/FHIR/Identifier");
const { Coding } = require("./utils/FHIR/Coding");
const { ContactPoint } = require("./utils/FHIR/ContactPoint");
const { Address } = require("./utils/FHIR/Address");
const { Practitioner } = require("./utils/FHIR/Practitioner");
const { InterpreterFactory } = require("./utils/converters/interpreterFactory");
const { setDicomPersonNameToFhirHumanNameMapping } = require("./utils/converters/setDicomPNToFhirHumanNameMapping");
const { DicomJsonToFhirImagingStudyFactory } = require("./utils/converters/dicomJsonToFhirImagingStudyFactory");

/**
 * @typedef DicomPersonName
 * @property familyName
 * @property givenName
 * @property middleName
 * @property prefix
 * @property suffix
 * 
 */

class DicomJsonToFhir {
    static GENDER_MAPPING = {
        "M": "male",
        "F": "female",
        "O": "other",
        "U": "unknown"
    };
    constructor(dicomJson, endpointAddressUrl, endpointID) {
        this.dicomJson = dicomJson;
        if (!endpointAddressUrl) {
            throw new Error("endpointAddressUrl is required, you must give the base wado-rs url of dicomweb server");
        } else if (!endpointID) {
            throw new Error("endpointID is required, you must give the id to your endpoint");
        }
        this.endpointAddressUrl = endpointAddressUrl;
        this.endpointID = endpointID;
    }

    getFhirJson() {
        let patient = this.getPatient();
        let endpoint = this.getEndpoint();
        let basedOn = this.getBasedOnServiceRequest();
        let referrer = this.getReferrer();
        let interpreter = this.getInterpreter();
    
        return {
            patient,
            endpoint,
            basedOn,
            referrer,
            interpreter,
            imagingStudy: new DicomJsonToFhirImagingStudyFactory(this.dicomJson, {
                patientID: patient.id,
                endpointID: this.endpointID,
                basedOnID: basedOn.id
            }).getImagingStudy()
        };
    }

    getPatient() {
        let dicomPatientName = DicomJson.getValue(this.dicomJson, "00100010")?.[0] || {
            "Alphabetic": "Unknown"
        };
        let dicomPatientGender = DicomJson.getString(this.dicomJson, "00100040") || "U";
        let fhirPatientGender = DicomJsonToFhir.GENDER_MAPPING[dicomPatientGender];

        let humanName = new HumanName();
        humanName.text = dicomPatientName?.Alphabetic;
        if (dicomPatientName?.Alphabetic !== "Unknown") {
            humanName.use = HumanNameUseCode.usual;
        }

        /**
         * parse dicom person name like SB1^SB2^SB3^SB4^SB5 into
         * {
         *     "familyName": "SB1",
         *     "givenName": "SB2",
         *     "middleName": "SB3",
         *     "prefix": "SB4",
         *     "suffix": "SB5"
         * }
         */
        let parsedPersonName = DicomJson.parsePersonName(dicomPatientName?.Alphabetic);

        for (let key in parsedPersonName) {
            setDicomPersonNameToFhirHumanNameMapping[key](parsedPersonName, humanName);
        }

        let patientID = DicomJson.getString(this.dicomJson, "00100020");
        let fhirPatient = {
            resourceType: "Patient",
            id: patientID || uid(12),
            gender: fhirPatientGender,
            active: true,
            name: [
                humanName
            ]
        };

        this.adjustPatient(fhirPatient);
        let birthDate = DicomJson.getString(this.dicomJson, "00100030");

        if (birthDate) {
            fhirPatient.birthDate = dayjs(birthDate).format("YYYY-MM-DD");
        }

        return fhirPatient;
    }

    adjustPatient(patient) {
        patient.id = patient.id.replace(/_/gim, "");
    }

    /**
     * 
     * @param {string} addressUrl The DICOMWeb URL of study level
     * @param {*} id The unique id of this DICOMWeb URL of PACS server.
     */
    getEndpoint(addressUrl, id) {
        return {
            resourceType: "Endpoint",
            status: "active",
            id: id,
            connectionType: {
                system: "http://terminology.hl7.org/CodeSystem/endpoint-connection-type",
                code: "dicom-wado-rs"
            },
            payloadType: [
                {
                    text: "DICOM"
                }
            ],
            payloadMimeType: ["application/dicom"],
            address: addressUrl
        };
    }

    getBasedOnServiceRequest(patientID) {
        let requestedProcedureCode = DicomJson.getString(this.dicomJson, "00400275.00321064.00080100") || DicomJson.getString(this.dicomJson, "00400275.00321064.00080104");
        if (!requestedProcedureCode) return null;

        return {
            id: uid(12),
            resourceType: "ServiceRequest",
            status: "completed",
            intent: "instance-order",
            subject: {
                reference: "Patient/" + patientID
            },
            code: {
                text: requestedProcedureCode
            }
        }
    }

    getReferrer() {
        let nameOfReferringPhysician = DicomJson.getValue(this.dicomJson, "00080090");

        let referringPhysician = new Practitioner();
        referringPhysician.id = uid(16);
        if (!nameOfReferringPhysician) {
            referringPhysician.gender = "unknown";
            let anonymousName = new HumanName();
            anonymousName.use = "anonymous";
            anonymousName.text = "anonymous";
            referringPhysician.name = [];
            referringPhysician.name.push(anonymousName);
            referringPhysician.id = "anonymous";
            return referringPhysician;
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

    getInterpreter() {
        let interpreterFactory = new InterpreterFactory(this.dicomJson);
        return interpreterFactory.make();
    }
}

module.exports.DicomJsonToFhir = DicomJsonToFhir;