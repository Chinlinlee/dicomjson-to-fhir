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

    it("Should raise error with invalid selection", () => {
        try {
            let fhirJson = dicomJsonToFhir.getFhirJson("123");
        } catch(e) {
            return;
        }
        throw new Error("Should not be here");
    });
    
    // #region study
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
    
    it("Should have description in study", () => {
        assert.equal(baseFhirJson.imagingStudy?.description, "CT1 abdomen");
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

    for(let field of studyRefFields) {
        StudyRefSelectionTester.itShouldHave(field.field);
        StudyRefSelectionTester.itShouldNotHave(field.field);
        StudyRefSelectionTester.itShouldNotHaveThatSourceNotPossess(
            field.field,
            field.dicomPaths
        );
    }
    // #endregion
    
    // #region series
    it("Should have modality with correct value (CT) in series", () => {
        assert.equal(baseFhirJson?.imagingStudy?.series[0].modality.code, "CT");
    });

    it("Should have uid with correct value (1.2.826.0.1.3680043.8.1055.1.20111102150758591.96842950.07877442) in series", () => {
        assert.equal(baseFhirJson.imagingStudy.series[0]?.uid, testData["0020000E"].Value[0]);
    });
    
    it("Should have number with correct value (6168) in series", () => {
        assert.equal(baseFhirJson.imagingStudy.series[0]?.number, 6168);
    });
    
    it("Should have description with correct value (Series Description CT1 abdomen) in series", () => {
        assert.equal(baseFhirJson.imagingStudy.series[0]?.description, testData["0008103E"].Value[0]);
    });

    it("Should have numberOfInstances with correct value (1) in series", () => {
        assert.equal(baseFhirJson.imagingStudy.series[0]?.numberOfInstances, 1);
    });

    it("Should have bodySite with correct value (818981001, Abdomen) in series", () => {
        assert.equal(baseFhirJson.imagingStudy.series[0]?.bodySite?.code, "818981001");
    });
    // #endregion

    // #region instance
    it("Should have uid with correct value (1.2.826.0.1.3680043.8.1055.1.20111102150758591.03296050.69180943) in instance", () => {
        assert.equal(baseFhirJson.imagingStudy.series[0]?.instance[0]?.uid, testData["00080018"].Value[0]);
    });
    it("Should have sopClass with correct value (1.2.840.10008.5.1.4.1.1.2) in instance", () => {
        assert.equal(baseFhirJson.imagingStudy.series[0]?.instance[0]?.sopClass?.code, "urn:oid:" + testData["00080016"].Value[0]);
    });
    it("Should have number with correct value (1) in instance", () => {
        assert.equal(baseFhirJson.imagingStudy.series[0]?.instance[0]?.number, testData["00200013"].Value[0]);
    });
    // #endregion

});

