import { CodeableConcept } from "../utils/FHIR/CodeableConcept";
import { Specimen } from "../utils/FHIR/Specimen";

type Selection =
    | "basedOn"
    | "referrer"
    | "interpreter"
    | "procedureReference"
    | "location"
    | "seriesSpecimen"
    | "seriesPerformerActor";

export type DicomJsonToFhirImagingStudyFactoryOptions = {
    patientID: string;
    endpointID: string;
    basedOnID: string;
    referrerID: string;
    interpreterID: string;
    procedureReferenceID: string;
    procedureCode: CodeableConcept;
    locationID: string;
    reasonCode: CodeableConcept[];
    seriesSpecimenID: string;
    seriesPerformerActorID: string;
    selection: Selection[];
};
