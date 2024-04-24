const { describe, it } = require("node:test");
const assert = require("node:assert");
const { DicomJsonToFhir } = require("../src/index");
const { testData } = require("./data");

describe("Parse DICOM JSON to FHIR", () => {
    let dicomJsonToFhir = new DicomJsonToFhir(testData, "http://aaExample.com/wado-rs", "my-endpoint");
    let baseFhirJson = dicomJsonToFhir.getFhirJson();

    it("Should have modality in series", () => {
        assert.equal(baseFhirJson?.imagingStudy?.series[0].modality.code, "CT");
    });

    it("Should have started in study", () => {
       assert.ok(baseFhirJson?.imagingStudy?.started.includes("2006-10-12T09:02:58")); 
    });

    it("Should raise error with invalid selection", () => {
        try {
            let fhirJson = dicomJsonToFhir.getFhirJson("123");
        } catch(e) {
            return;
        }
        throw new Error("Should not be here");
    });

    it("Should have referrer using selection", () => {
        let fhirJson = dicomJsonToFhir.getFhirJson(["referrer"]);
        assert.ok(fhirJson?.referrer);
        assert.ok(fhirJson.imagingStudy?.referrer);
    });

    it("Should not have referrer using selection", () => {
        let fhirJson = dicomJsonToFhir.getFhirJson();
        assert.ok(!fhirJson?.referrer);
        assert.ok(!fhirJson.imagingStudy?.referrer);
    });

    it("Should not have referrer that source not possess it", () => {
        let clonedTestData = structuredClone(testData);
        delete clonedTestData["00080090"];
        delete clonedTestData["00080096"];
        let dicomJsonToFhirForWithoutReferrer = new DicomJsonToFhir(clonedTestData, "http://aaExample.com/wado-rs", "my-endpoint");
        let fhirJson = dicomJsonToFhirForWithoutReferrer.getFhirJson(["referrer"]);
        assert.ok(!fhirJson?.referrer);
    });
});

