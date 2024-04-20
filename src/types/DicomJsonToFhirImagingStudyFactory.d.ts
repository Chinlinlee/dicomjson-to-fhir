import { CodeableConcept } from "../utils/FHIR/CodeableConcept";
import { Specimen } from "../utils/FHIR/Specimen";

export type DicomJsonToFhirImagingStudyFactoryOptions = {
    patientID: string,
    endpointID: string,
    basedOnID: string,
    referrerID: string;
    interpreter: string;
    procedureReferenceID: string;
    procedureCode: CodeableConcept;
    locationID: string;
    reasonCode: CodeableConcept[];
    seriesSpecimenID: string;
    seriesPerformerActorID: string;
};