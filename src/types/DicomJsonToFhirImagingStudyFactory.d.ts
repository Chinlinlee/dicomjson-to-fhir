import { CodeableConcept } from "../utils/FHIR/CodeableConcept";

export type DicomJsonToFhirImagingStudyFactoryOptions = {
    patientID: string,
    endpointID: string,
    basedOnID: string,
    referrerID: string;
    interpreter: string;
    procedureReferenceID: string;
    procedureCode: CodeableConcept;
    locationID: string;
};