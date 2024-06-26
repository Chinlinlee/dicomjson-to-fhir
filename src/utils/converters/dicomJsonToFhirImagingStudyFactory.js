const { DicomJson } = require("../DICOM/dicomJson");
const { Identifier } = require("../FHIR/Identifier");
const { Coding } = require("../FHIR/Coding");
const { sanitizeNestedObject } = require("../utils");
const { ImagingStudy, ImagingStudySeries, ImagingStudySeriesInstance } = require("../FHIR/ImagingStudy");
const dayjs = require("dayjs");
const { SeriesLateralityFactory } = require("./seriesLateralityFactory");
const { SeriesSpecimenFactory } = require("./seriesSpecimenFactory");
const { SeriesBodySiteFactory } = require("./seriesBodySiteFactory");

class DicomJsonToFhirImagingStudyFactory {
    /**
     * 
     * @param {import("../../types/Dicom").DicomJson} dicomJson 
     * @param {import("../../types/DicomJsonToFhirImagingStudyFactory").DicomJsonToFhirImagingStudyFactoryOptions} opts 
     */
    constructor(dicomJson, opts) {
        this.dicomJson = dicomJson;
        /** @type { import("../../types/DicomJsonToFhirImagingStudyFactory").DicomJsonToFhirImagingStudyFactoryOptions } */
        this.opts = opts;

        if (!this.opts?.selection) {
            this.opts.selection = [];
        }
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
        this.setStudyBasedOn(study);
        this.setStudyInterpreter(study);
        this.setStudyReferrer(study);
        this.setStudyEndpoint(study);
        this.setStudyProcedureReference(study);
        this.setStudyProcedureCode(study);
        this.setStudyLocation(study);
        this.setStudyReasonCode(study);

        let series = this.getSeries();
        let instance = this.getInstance();

        return this.combineImagingStudyChildren(study, series, instance);
    }

    setStudySubject(study) {
        study.subject.reference =
            `Patient/${this.opts.patientID}`;
        study.subject.type = "Patient";
    }

    setStudyStarted(study) {
        let studyDate = DicomJson.getString(this.dicomJson, "00080020") || "";
        let studyTime = DicomJson.getString(this.dicomJson, "00080030") || "";
        let studyStartedStr = `${studyDate}${studyTime}`;
        study.started = dayjs(studyStartedStr, "YYYYMMDDhhmmss").format();
        study.numberOfSeries = DicomJson.getString(this.dicomJson, "00201206");
        if (study.numberOfSeries) study.numberOfSeries = parseInt(study.numberOfSeries);

        study.numberOfInstances = DicomJson.getString(this.dicomJson, "00201208");
        if (study.numberOfInstances) study.numberOfInstances = parseInt(study.numberOfInstances);

        study.description = DicomJson.getString(this.dicomJson, "00081030");
    }

    setStudyBasedOn(study) {
        if (this.opts.basedOnID && this.opts.selection.indexOf("basedOn") >= 0) {
            study.basedOn = [
                {
                    reference: `ServiceRequest/${this.opts.basedOnID}`
                }
            ]
        }
    }

    setStudyReferrer(study) {
        if (this.opts.referrerID && this.opts.selection.indexOf("referrer") >= 0) {
            study.referrer = {
                reference: `Practitioner/${this.opts.referrerID}`
            };
        }
    }

    setStudyInterpreter(study) {
        if (this.opts.interpreterID && this.opts.selection.indexOf("interpreter") >= 0) {
            study.interpreter = {
                reference: `Practitioner/${this.opts.interpreterID}`
            };
        }
    }

    setStudyEndpoint(study) {
        study.endpoint = [
            {
                reference: `Endpoint/${this.opts.endpointID}`
            }
        ]
    }

    setStudyProcedureReference(study) {
        if (this.opts.procedureReferenceID && this.opts.selection.indexOf("procedureReference") >= 0) {
            study.procedureReference = {
                reference: `Procedure/${this.opts.procedureReferenceID}`
            }
        }
    }

    setStudyProcedureCode(study) {
        if (this.opts.procedureCode) {
            study.procedureCode = this.opts.procedureCode;
        }
    }

    setStudyLocation(study) {
        if (this.opts.locationID  && this.opts.selection.indexOf("location") >= 0) {
            study.location = {
                reference: `Location/${this.opts.locationID}`
            }
        }
    }

    setStudyReasonCode(study) {
        if (this.opts.reasonCode) {
            study.reasonCode = this.opts.reasonCode;
        }
    }

    getSeries() {
        let series = new ImagingStudySeries();
        let dicomSeriesInstanceUID = DicomJson.getString(this.dicomJson, "0020000E");
        series.uid = dicomSeriesInstanceUID;
        series.number = DicomJson.getString(this.dicomJson, "00200011");
        if (series.number) series.number = parseInt(series.number);

        series.modality.code = DicomJson.getString(this.dicomJson, "00080060");
        series.description = DicomJson.getString(this.dicomJson, "0008103E");
        series.numberOfInstances = DicomJson.getString(this.dicomJson, "00201209");
        if (series.numberOfInstances) series.numberOfInstances = parseInt(series.numberOfInstances);

        this.setSeriesBodySite(series);
        this.setSeriesStarted(series);
        this.setSeriesPerformer(series);
        this.setSeriesLaterality(series);
        this.setSeriesSpecimen(series);
        this.setSeriesPerformer(series);

        return series;
    }

    setSeriesStarted(series) {
        let seriesDate = DicomJson.getString(this.dicomJson, "00200020") || "";
        let seriesTime = DicomJson.getString(this.dicomJson, "00200031") || "";
        let seriesStartedStr = `${seriesDate}${seriesTime}`;

        series.started = dayjs(seriesStartedStr).isValid() ? dayjs(seriesStartedStr, "YYYYMMDDhhmmss").toISOString() : undefined;
    }

    setSeriesBodySite(series) {
        let bodySiteFactory = new SeriesBodySiteFactory(this.dicomJson);
        let bodySite = bodySiteFactory.make();
        if (bodySite) {
            series.bodySite = bodySite;
        }
    }

    setSeriesLaterality(series) {
        let lateralityFactory = new SeriesLateralityFactory(this.dicomJson);
        let lateralityCoding = lateralityFactory.make();

        if (lateralityCoding) {
            series.laterality = lateralityCoding;
        }
    }

    setSeriesSpecimen(series) {
        if (this.opts.seriesSpecimenID && this.opts.selection.indexOf("seriesSpecimen") >= 0) {
            series.specimen = {
                reference: `Specimen/${this.opts.seriesSpecimenID}`
            };
        }
    }

    setSeriesPerformer(series) {
        if (this.opts.seriesPerformerActorID && this.opts.selection.indexOf("seriesPerformerActor") >= 0) {
            series.performer = {
                function: {
                    coding: [
                        {
                            system: "http://terminology.hl7.org/CodeSystem/v3-ParticipationType",
                            code: "PRF"
                        }
                    ]
                },
                actor: {
                    reference: `Practitioner/${this.opts.seriesPerformerActorID}`
                }
            }
        }
    }

    getInstance() {
        let instance = new ImagingStudySeriesInstance();
        let dicomSOPInstanceUID = DicomJson.getString(this.dicomJson, "00080018");
        instance.uid = dicomSOPInstanceUID;
        instance.sopClass.system = "urn:ietf:rfc:3986";
        instance.sopClass.code = `urn:oid:${DicomJson.getString(this.dicomJson, "00080016")}`;
        instance.number = DicomJson.getString(this.dicomJson, "00200013");
        if (instance.number) instance.number = parseInt(instance.number);

        // TODO
        // The mapping tag is incorrect
        // and either extract method 
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

module.exports.DicomJsonToFhirImagingStudyFactory = DicomJsonToFhirImagingStudyFactory;