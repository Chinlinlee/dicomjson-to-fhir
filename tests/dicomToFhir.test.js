const { describe, it } = require("node:test");
const assert = require("node:assert");
const { DicomJsonToFhir } = require("../src/index");
const { testData } = require("./data");

describe("Parse DICOM JSON to FHIR", () => {
    let dicomJsonToFhir = new DicomJsonToFhir(testData, "http://aaExample.com/wado-rs", "my-endpoint");
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
});

