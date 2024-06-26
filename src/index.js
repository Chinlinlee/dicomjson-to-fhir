const { HumanName, HumanNameUseCode } = require("./utils/FHIR/HumanName");
const { DicomJson } = require("./utils/DICOM/dicomJson");
const { uid } = require("uid/secure");
const dayjs = require("dayjs");
const { InterpreterFactory } = require("./utils/converters/interpreterFactory");
const { setDicomPersonNameToFhirHumanNameMapping } = require("./utils/converters/setDicomPNToFhirHumanNameMapping");
const { DicomJsonToFhirImagingStudyFactory } = require("./utils/converters/dicomJsonToFhirImagingStudyFactory");
const { ReferrerFactory } = require("./utils/converters/referrerFactory");
const { ProcedureReferenceFactory } = require("./utils/converters/procedureReferenceFactory");
const { ProcedureCodeFactory } = require("./utils/converters/procedureCodeFactory");
const { LocationFactory } = require("./utils/converters/locationFactory");
const { ReasonCodeFactory } = require("./utils/converters/reasonCodeFactory");
const { SeriesSpecimenFactory } = require("./utils/converters/seriesSpecimenFactory");
const { SeriesPerformerActorFactory } = require("./utils/converters/seriesPerformerActorFactory");

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
    static IMAGING_STUDY_SELECTION_COLUMNS = [
        "basedOn",
        "referrer",
        "interpreter",
        "procedureReference",
        "procedureCode",
        "location",
        "reasonCode",
        "seriesSpecimen",
        "seriesPerformerActor"
    ];

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

    /**
     * 
     * @param {(typeof DicomJsonToFhir.IMAGING_STUDY_SELECTION_COLUMNS[number])[]} selection 
     * @returns 
     */
    getFhirJson(selection=[]) {
        if (selection.some(v=> DicomJsonToFhir.IMAGING_STUDY_SELECTION_COLUMNS.indexOf(v)) < 0) {
            throw new Error("selection must be one of " + DicomJsonToFhir.IMAGING_STUDY_SELECTION_COLUMNS.join(", "));
        }

        let patient = this.getPatient();
        let endpoint = this.getEndpoint(this.endpointAddressUrl, this.endpointID);
        let basedOn = this.getBasedOnServiceRequest();
        let referrer = this.getReferrer();
        let interpreter = this.getInterpreter();
        let procedureReference = this.getProcedureReference(patient.id);
        let procedureCode = this.getProcedureCode();
        let location = this.getLocation();
        let reasonCode = this.getReasonCode();
        let seriesSpecimen = this.getSeriesSpecimen();
        let seriesPerformerActor = this.getSeriesPerformerActor();

        let result = {
            patient,
            endpoint,
            basedOn,
            referrer,
            interpreter,
            procedureReference,
            procedureCode,
            location,
            reasonCode,
            seriesSpecimen,
            seriesPerformerActor,
            imagingStudy: new DicomJsonToFhirImagingStudyFactory(this.dicomJson, {
                patientID: patient.id,
                endpointID: this.endpointID,
                basedOnID: basedOn?.id,
                referrerID: referrer?.id,
                interpreterID: interpreter?.id,
                procedureReferenceID: procedureReference?.id,
                procedureCode,
                locationID: location?.id,
                reasonCode,
                seriesSpecimenID: seriesSpecimen?.id,
                seriesPerformerActorID: seriesPerformerActor?.id,
                selection
            }).getImagingStudy()
        };

        let baseResult = {
            patient: patient,
            endpoint: result.endpoint,
            imagingStudy: result.imagingStudy
        };

        for(let field of selection) {
            baseResult[field] = result[field];
        }

        return baseResult;
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
        let referrerFactory = new ReferrerFactory(this.dicomJson);
        return referrerFactory.make();
    }

    getInterpreter() {
        let interpreterFactory = new InterpreterFactory(this.dicomJson);
        return interpreterFactory.make();
    }

    /**
     * 
     * @param {string} patientID 
     * @returns 
     */
    getProcedureReference(patientID) {
        let procedureReferenceFactory = new ProcedureReferenceFactory(this.dicomJson, patientID);
        return procedureReferenceFactory.make();
    }

    getProcedureCode() {
        let procedureCodeFactory = new ProcedureCodeFactory(this.dicomJson);
        return procedureCodeFactory.make();
    }

    getLocation() {
        let locationFactory = new LocationFactory(this.dicomJson);
        return locationFactory.make();
    }

    getReasonCode() {
        let reasonCodeFactory = new ReasonCodeFactory(this.dicomJson);
        return reasonCodeFactory.make();
    }

    getSeriesSpecimen() {
        let seriesSpecimenFactory = new SeriesSpecimenFactory(this.dicomJson);
        return seriesSpecimenFactory.make();
    }

    getSeriesPerformerActor() {
        let seriesPerformerActorFactory = new SeriesPerformerActorFactory(this.dicomJson);
        return seriesPerformerActorFactory.make();
    }
}

module.exports.DicomJsonToFhir = DicomJsonToFhir;