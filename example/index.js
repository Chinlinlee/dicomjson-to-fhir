const fs = require("fs");
const path = require("path");
const { DicomJsonToFhir } = require("../src/index");

let data = fs.readFileSync(
    path.join(__dirname, "./dicomjson.json")
).toString();

let dicomJsonToFhir = new DicomJsonToFhir(JSON.parse(data), "http://aaExample.com/wado-rs", "my-endpoint");

let fhirJson = dicomJsonToFhir.getFhirJson([
    "basedOn",
    "referrer",
    "interpreter",
    "procedureReference",
    "procedureCode",
    "location",
    "reasonCode",
    "seriesSpecimen",
    "seriesPerformerActor"
]);

console.log(JSON.stringify(fhirJson, null, 2));