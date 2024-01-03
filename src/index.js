const { HumanName, HumanNameUseCode } = require("./utils/FHIR/HumanName");
const { DicomJson } = require("./utils/DICOM/dicomJson");
const { uid } = require("uid/secure");
const dayjs = require("dayjs");
const { ImagingStudy, ImagingStudySeries, ImagingStudySeriesInstance } = require("./utils/FHIR/ImagingStudy");
const { Identifier } = require("./utils/FHIR/Identifier");
const { Coding } = require("./utils/FHIR/Coding");

/**
 * @typedef DicomPersonName
 * @property familyName
 * @property givenName
 * @property middleName
 * @property prefix
 * @property suffix
 * 
 */

const setDicomPersonNameToFhirHumanNameMapping = {
    /**
     * 
     * @param {DicomPersonName} dicomPersonName 
     * @param {HumanName} fhirHumanName 
     */
    familyName: (dicomPersonName, fhirHumanName) => {
        fhirHumanName.family = dicomPersonName.familyName;
    },
    /**
     * 
     * @param {DicomPersonName} dicomPersonName 
     * @param {HumanName} fhirHumanName 
     */
    givenName: (dicomPersonName, fhirHumanName) => {
        if (fhirHumanName?.given) {
            fhirHumanName.given?.push(dicomPersonName.givenName);
        } else {
            fhirHumanName.given = [];
            fhirHumanName.given.push(dicomPersonName.givenName);
        }
    },
    /**
     * 
     * @param {DicomPersonName} dicomPersonName 
     * @param {HumanName} fhirHumanName 
     */
    middleName: (dicomPersonName, fhirHumanName) => {
        if (fhirHumanName?.given) {
            fhirHumanName.given?.push(dicomPersonName.middleName);
        } else {
            fhirHumanName.given = [];
            fhirHumanName.given.push(dicomPersonName.middleName);
        }
    },
    /**
     * 
     * @param {DicomPersonName} dicomPersonName 
     * @param {HumanName} fhirHumanName 
     */
    prefix: (dicomPersonName, fhirHumanName) => {
        if (fhirHumanName?.prefix) {
            fhirHumanName.prefix?.push(dicomPersonName.prefix);
        } else {
            fhirHumanName.prefix = [];
            fhirHumanName.prefix.push(dicomPersonName.prefix);
        }
    },
    /**
     * 
     * @param {DicomPersonName} dicomPersonName 
     * @param {HumanName} fhirHumanName 
     */
    suffix: (dicomPersonName, fhirHumanName) => {
        if (fhirHumanName?.suffix) {
            fhirHumanName.suffix?.push(dicomPersonName.suffix);
        } else {
            fhirHumanName.suffix = [];
            fhirHumanName.suffix.push(dicomPersonName.suffix);
        }
    }
};

const sanitizeNestedObject = obj => JSON.parse(JSON.stringify(obj), (key, value) => {
    return (value === null || value === "" || (typeof value === 'object' && !Object.keys(value).length) ? undefined : value)
});

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
        return {
            patient: this.getPatient(),
            endpoint: this.getEndpoint(this.endpointAddressUrl, this.endpointID),
            imagingStudy: new DicomJsonToFhirImagingStudyFactory(this.dicomJson).getImagingStudy()
        };
    }

    getPatient() {
        let dicomPatientName = DicomJson.getValue(this.dicomJson, "00100010") || {
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
            setDicomPersonNameToFhirHumanNameMapping[key](parsedPersonName[key], humanName);
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
}

class DicomJsonToFhirImagingStudyFactory {
    constructor(dicomJson) {
        this.dicomJson = dicomJson;
    }

    getImagingStudy() {
        let study = new ImagingStudy();
        let dicomStudyInstanceUID = DicomJson.getString(this.dicomJson, "0020000D");
        study.id = dicomStudyInstanceUID;

        let accessNumberAndIssuer = this.getTagStringConcat(this.dicomJson, "00080050", "00080051");
        let identifiers = [
            dicomStudyInstanceUID,
            accessNumberAndIssuer,
            DicomJson.getString(this.dicomJson, "00200010")
        ];
        study.identifier = this.getStudyIdentifiers(identifiers);

        this.setStudySubject(study);
        this.setStudyStarted(study);

        let series = this.getSeries();
        let instance = this.getInstance();

        return this.combineImagingStudyChildren(study, series, instance);
    }

    setStudySubject(study) {
        let dicomPatientID = DicomJson.getString(this.dicomJson, "00100020");
        dicomPatientID = dicomPatientID.replace(/_/gim, "");
        study.subject.identifier = new Identifier();
        if (dicomPatientID) {
            study.subject.reference =
                `Patient/${dicomPatientID}`;
            study.subject.type = "Patient";
            study.subject.identifier.use = "usual";
            study.subject.identifier.value = dicomPatientID;
        } else {
            study.subject.reference = "Patient/unknown";
            study.subject.type = "Patient";
            study.subject.identifier.use = "anonymous";
            study.subject.identifier.value = "unknown";
        }
    }

    setStudyStarted(study) {
        let studyDate = DicomJson.getString(this.dicomJson, "00080020") || "";
        let studyTime = DicomJson.getString(this.dicomJson, "00080030") || "";
        let studyStartedStr = `${studyDate}${studyTime}`;
        study.started = dayjs(studyStartedStr, "YYYYMMDDhhmmss").toISOString();
        study.numberOfSeries = DicomJson.getString(this.dicomJson, "00201206");
        study.numberOfInstances = DicomJson.getString(this.dicomJson, "00201208");
        study.description = DicomJson.getString(this.dicomJson, "00081030");
    }

    getSeries() {
        let series = new ImagingStudySeries();
        let dicomSeriesInstanceUID = DicomJson.getString(this.dicomJson, "0020000E");
        series.uid = dicomSeriesInstanceUID;
        series.number = DicomJson.getString(this.dicomJson, "00200011");
        series.modality.code = DicomJson.getString(this.dicomJson, "00080060");
        series.description = DicomJson.getString(this.dicomJson, "0008103E");
        series.numberOfInstances = DicomJson.getString(this.dicomJson, "00201209");
        series.bodySite = new Coding();
        series.bodySite.display = DicomJson.getString(this.dicomJson, "00180015");

        this.setSeriesStarted(series);
        this.setSeriesPerformer(series);

        return series;
    }

    setSeriesStarted(series) {
        let seriesDate = DicomJson.getString(this.dicomJson, "00200020") || "";
        let seriesTime = DicomJson.getString(this.dicomJson, "00200031") || "";
        let seriesStartedStr = `${seriesDate}${seriesTime}`;
        
        series.started = dayjs(seriesStartedStr).isValid() ? dayjs(seriesStartedStr, "YYYYMMDDhhmmss").toISOString(): undefined;
    }

    setSeriesPerformer(series) {
        series.performer = DicomJson.getString(this.dicomJson, "00081050") ||
            DicomJson.getString(this.dicomJson, "00081052")
        DicomJson.getString(this.dicomJson, "00081070")
        DicomJson.getString(this.dicomJson, "00081072");
    }

    getInstance() {
        let instance = new ImagingStudySeriesInstance();
        let dicomSOPInstanceUID = DicomJson.getString(this.dicomJson, "00080018");
        instance.uid = dicomSOPInstanceUID;
        instance.sopClass.system = "urn:ietf:rfc:3986";
        instance.sopClass.code = `urn:oid:${DicomJson.getString(this.dicomJson, "00080016")}`;
        instance.number = DicomJson.getString(this.dicomJson, "00200013");
        instance.title = DicomJson.getString(this.dicomJson, "00080008") ||
            DicomJson.getString(this.dicomJson, "00070080") ||
            (DicomJson.getString(this.dicomJson, "0040a043") != undefined
                ? DicomJson.getString(this.dicomJson, "0040a043") +
                DicomJson.getString(this.dicomJson, "00080104") : undefined) ||
            DicomJson.getString(this.dicomJson, "00420010");

        return instance;
    }

    getTagStringConcat(dicomJson, ...tags) {
        let result = "";
        for (let i = 0; i < tags.length; i++) {
            let tag = tags[i];
            let tagValue = DicomJson.getString(dicomJson, tag);
            if (tagValue) result += tagValue;
        }
        if (!result) return undefined;
        return result;
    }

    getStudyIdentifiers(identifiers) {
        let result = [];
        if (identifiers[0] != undefined) {
            let identifier1 = new Identifier();
            identifier1.use = "official";
            identifier1.system = "urn:dicom:uid";
            identifier1.value = "urn:oid:" + identifiers[0];
            result.push(identifier1);
        }
        //need sample dicom with the organization
        if (identifiers[1] != undefined) {
            let identifier2 = new Identifier();
            identifier2.type = new Coding();
            identifier2.use = "usual";
            identifier2.value = identifiers[1];
            result.push(identifier2);
        }
        if (identifiers[2] != undefined) {
            let identifier3 = new Identifier();
            identifier3.use = "secondary";
            identifier3.value = "s" + identifiers[2];
            result.push(identifier3);
        }
        return result;
    }

    combineImagingStudyChildren(study, series, instance) {
        let studyJson = study.toJson();
        let seriesJson = series.toJson();
        let instanceJson = instance.toJson();
        seriesJson.instance.push(instanceJson);
        studyJson.series.push(seriesJson);
        return sanitizeNestedObject(studyJson);
    }
}

module.exports.DicomJsonToFhir = DicomJsonToFhir;