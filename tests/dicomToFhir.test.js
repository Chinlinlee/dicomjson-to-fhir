const { describe, it } = require("node:test");
const assert = require("node:assert");
const { DicomJsonToFhir } = require("../src/index");
const { testData } = require("./data");

class StudyRefSelectionTester {
    constructor() {}

    static itShouldHave(field) {
        it(`Should have ${field} in study using selection`, () => {
            let dicomJsonToFhir = new DicomJsonToFhir(testData, "http://aaExample.com/wado-rs", "my-endpoint");
            let fhirJson = dicomJsonToFhir.getFhirJson([field]);
            assert.ok(fhirJson?.[field]);
            assert.ok(fhirJson.imagingStudy?.[field]);
        })
    }

    static itShouldNotHave(field) {
        it(`Should not have ${field} in study using selection`, () => {
            let dicomJsonToFhir = new DicomJsonToFhir(testData, "http://aaExample.com/wado-rs", "my-endpoint");
            let fhirJson = dicomJsonToFhir.getFhirJson();
            assert.ok(!fhirJson?.[field]);
            assert.ok(!fhirJson.imagingStudy?.[field]);
        });
    }

    static itShouldNotHaveThatSourceNotPossess(field, dicomPaths=[]) {
        it(`Should not have ${field} that source not possess it`, () => {
            let clonedTestData = structuredClone(testData);
            for(let dicomPath of dicomPaths) {
                delete clonedTestData[dicomPath];
            }
            let dicomJsonToFhir = new DicomJsonToFhir(clonedTestData, "http://aaExample.com/wado-rs", "my-endpoint");
            let fhirJson = dicomJsonToFhir.getFhirJson([field]);
            assert.ok(!fhirJson?.[field]);
            assert.ok(!fhirJson.imagingStudy?.[field]);
        })
    }
}


describe("Parse DICOM JSON to FHIR", () => {
    let dicomJsonToFhir = new DicomJsonToFhir(testData, "http://aaExample.com/wado-rs", "my-endpoint");
    let baseFhirJson = dicomJsonToFhir.getFhirJson();

    it("Should have modality with correct value (CT) in series", () => {
        assert.equal(baseFhirJson?.imagingStudy?.series[0].modality.code, "CT");
    });

    it("Should have started with correct value (2006-10-12T09:02:58) in study", () => {
       assert.ok(baseFhirJson?.imagingStudy?.started.includes("2006-10-12T09:02:58")); 
    });

    it("Should have numberOfSeries with correct value (8) in study", () => {
        assert.equal(baseFhirJson?.imagingStudy?.numberOfSeries, 8);
    });

    it("Should have numberOfInstances with correct value (87) in study", () => {
        assert.equal(baseFhirJson?.imagingStudy?.numberOfInstances, 87);
    });

    it("Should have procedureCode in study", () => {
        assert.ok(baseFhirJson.imagingStudy?.procedureCode);
    });

    it("Should have reasonCode in study", () => {
        assert.ok(baseFhirJson.imagingStudy?.reasonCode);
    });

    let studyRefFields = [
        {
            field: "basedOn",
            //00400275.00321064
            dicomPaths: [
                "00400275"
            ]
        },
        {
            field: "referrer",
            dicomPaths: [
                "00080090",
                "00080096"
            ]
        },
        {
            field: "interpreter",
            dicomPaths: [
                "00081060"
            ]
        },
        {
            field: "procedureReference",
            dicomPaths: [
                "00081032"
            ]
        },
        {
            field: "location",
            dicomPaths: [
                "00081040",
                "00400243"
            ]
        }
    ];

    it("Should raise error with invalid selection", () => {
        try {
            let fhirJson = dicomJsonToFhir.getFhirJson("123");
        } catch(e) {
            return;
        }
        throw new Error("Should not be here");
    });

    for(let field of studyRefFields) {
        StudyRefSelectionTester.itShouldHave(field.field);
        StudyRefSelectionTester.itShouldNotHave(field.field);
        StudyRefSelectionTester.itShouldNotHaveThatSourceNotPossess(
            field.field,
            field.dicomPaths
        );
    }
});

