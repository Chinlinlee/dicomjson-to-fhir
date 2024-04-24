# dicomjson-to-fhir

Convert dicom json model to FHIR ImagingStudy, Patient, and Endpoint

## Installation

```bash
npm install dicomjson-to-fhir
```

## Usage

<details>
    <summary>DICOM Json example</summary>
    
```json
{
    "00080005": {
        "vr": "CS",
        "Value": [
            "ISO_IR 192"
        ]
    },
    "00080008": {
        "vr": "CS",
        "Value": [
            "ORIGINAL",
            "PRIMARY",
            "AXIAL",
            "HELIX"
        ]
    },
    "00080012": {
        "vr": "DA",
        "Value": [
            "20061012"
        ]
    },
    "00080013": {
        "vr": "TM",
        "Value": [
            "091605.000000"
        ]
    },
    "00080016": {
        "vr": "UI",
        "Value": [
            "1.2.840.10008.5.1.4.1.1.2"
        ]
    },
    "00080018": {
        "vr": "UI",
        "Value": [
            "1.2.826.0.1.3680043.8.1055.1.20111102150758591.03296050.69180943"
        ]
    },
    "00080020": {
        "vr": "DA",
        "Value": [
            "20061012"
        ]
    },
    "00080022": {
        "vr": "DA",
        "Value": [
            "20061012"
        ]
    },
    "00080023": {
        "vr": "DA",
        "Value": [
            "20061012"
        ]
    },
    "00080030": {
        "vr": "TM",
        "Value": [
            "090258.000000"
        ]
    },
    "00080032": {
        "vr": "TM",
        "Value": [
            "085229.000000"
        ]
    },
    "00080033": {
        "vr": "TM",
        "Value": [
            "085229.719000"
        ]
    },
    "00080060": {
        "vr": "CS",
        "Value": [
            "CT"
        ]
    },
    "00081030": {
        "vr": "LO",
        "Value": [
            "CT1 abdomen\u0000"
        ]
    },
    "00081032": {
        "vr": "SQ",
        "Value": [
            {
                "00080100": {
                    "vr": "SH",
                    "Value": [
                        "CTABDOM\u0000"
                    ]
                },
                "00080102": {
                    "vr": "SH",
                    "Value": [
                        "XPLORE"
                    ]
                },
                "00080104": {
                    "vr": "LO",
                    "Value": [
                        "CT1 abdomen\u0000"
                    ]
                }
            }
        ]
    },
    "0008103E": {
        "vr": "LO",
        "Value": [
            "ARTERIELLE"
        ]
    },
    "00081111": {
        "vr": "SQ",
        "Value": [
            {
                "00081150": {
                    "vr": "UI",
                    "Value": [
                        "1.2.840.10008.3.1.2.3.3"
                    ]
                },
                "00081155": {
                    "vr": "UI",
                    "Value": [
                        "1.2.840.113704.1.111.5104.1160636572.51"
                    ]
                }
            }
        ]
    },
    "00100010": {
        "vr": "PN",
        "Value": [
            {
                "Alphabetic": "Anonymized"
            }
        ]
    },
    "00100020": {
        "vr": "LO",
        "Value": [
            "0\u0000"
        ]
    },
    "00101010": {
        "vr": "AS",
        "Value": [
            "000Y"
        ]
    },
    "00180010": {
        "vr": "LO",
        "Value": [
            "CONTRAST"
        ]
    },
    "00180022": {
        "vr": "CS",
        "Value": [
            "HELIX\u0000"
        ]
    },
    "00180050": {
        "vr": "DS",
        "Value": [
            "1.0\u0000"
        ]
    },
    "00180060": {
        "vr": "DS",
        "Value": [
            "120\u0000"
        ]
    },
    "00180088": {
        "vr": "DS",
        "Value": [
            "0.5\u0000"
        ]
    },
    "00180090": {
        "vr": "DS",
        "Value": [
            "302\u0000"
        ]
    },
    "00181030": {
        "vr": "LO",
        "Value": [
            "ART.RENALES 12/Abdomen/Hx\u0000"
        ]
    },
    "00181100": {
        "vr": "DS",
        "Value": [
            "302\u0000"
        ]
    },
    "00181120": {
        "vr": "DS",
        "Value": [
            "0\u0000"
        ]
    },
    "00181130": {
        "vr": "DS",
        "Value": [
            "151\u0000"
        ]
    },
    "00181140": {
        "vr": "CS",
        "Value": [
            "CW"
        ]
    },
    "00181151": {
        "vr": "IS",
        "Value": [
            "400\u0000"
        ]
    },
    "00181152": {
        "vr": "IS",
        "Value": [
            "300\u0000"
        ]
    },
    "00181160": {
        "vr": "SH",
        "Value": [
            "B\u0000"
        ]
    },
    "00181210": {
        "vr": "SH",
        "Value": [
            "B\u0000"
        ]
    },
    "00185100": {
        "vr": "CS",
        "Value": [
            "FFS\u0000"
        ]
    },
    "0020000D": {
        "vr": "UI",
        "Value": [
            "1.2.826.0.1.3680043.8.1055.1.20111102150758591.92402465.76095170"
        ]
    },
    "0020000E": {
        "vr": "UI",
        "Value": [
            "1.2.826.0.1.3680043.8.1055.1.20111102150758591.96842950.07877442"
        ]
    },
    "00200011": {
        "vr": "IS",
        "Value": [
            6168
        ]
    },
    "00200013": {
        "vr": "IS",
        "Value": [
            "1\u0000"
        ]
    },
    "00200032": {
        "vr": "DS",
        "Value": [
            -151.493508,
            -36.6564417,
            1295
        ]
    },
    "00200037": {
        "vr": "DS",
        "Value": [
            1,
            0,
            0,
            0,
            1,
            "0\u0000"
        ]
    },
    "00200052": {
        "vr": "UI",
        "Value": [
            "1.2.840.113704.1.111.3704.1160637109.3"
        ]
    },
    "00201041": {
        "vr": "DS",
        "Value": [
            "-325.00\u0000"
        ]
    },
    "00204000": {
        "vr": "LT",
        "Value": [
            "JPEG 2000 lossless - Version 4.0.2 (c) Image Devices GmbH\u0000"
        ]
    },
    "00280002": {
        "vr": "US",
        "Value": [
            1
        ]
    },
    "00280004": {
        "vr": "CS",
        "Value": [
            "MONOCHROME2\u0000"
        ]
    },
    "00280010": {
        "vr": "US",
        "Value": [
            512
        ]
    },
    "00280011": {
        "vr": "US",
        "Value": [
            512
        ]
    },
    "00280030": {
        "vr": "DS",
        "Value": [
            0.58984375,
            "0.58984375\u0000"
        ]
    },
    "00280100": {
        "vr": "US",
        "Value": [
            16
        ]
    },
    "00280101": {
        "vr": "US",
        "Value": [
            12
        ]
    },
    "00280102": {
        "vr": "US",
        "Value": [
            11
        ]
    },
    "00280103": {
        "vr": "US",
        "Value": [
            0
        ]
    },
    "00281050": {
        "vr": "DS",
        "Value": [
            50,
            "00050\u0000"
        ]
    },
    "00281051": {
        "vr": "DS",
        "Value": [
            350,
            "00350\u0000"
        ]
    },
    "00281052": {
        "vr": "DS",
        "Value": [
            "-1000\u0000"
        ]
    },
    "00281053": {
        "vr": "DS",
        "Value": [
            "1\u0000"
        ]
    },
    "00282110": {
        "vr": "CS",
        "Value": [
            "01"
        ]
    },
    "00282112": {
        "vr": "DS",
        "Value": [
            5.882680
        ]
    },
    "00400007": {
        "vr": "LO",
        "Value": [
            "CT1 abdomen\u0000"
        ]
    },
    "00400008": {
        "vr": "SQ",
        "Value": [
            {
                "00080100": {
                    "vr": "SH",
                    "Value": [
                        "CTABDOM\u0000"
                    ]
                },
                "00080102": {
                    "vr": "SH",
                    "Value": [
                        "XPLORE"
                    ]
                },
                "00080104": {
                    "vr": "LO",
                    "Value": [
                        "CT1 abdomen\u0000"
                    ]
                }
            }
        ]
    },
    "00400009": {
        "vr": "SH",
        "Value": [
            "A10026177758"
        ]
    },
    "00400254": {
        "vr": "LO",
        "Value": [
            "CT1 abdomen\u0000"
        ]
    },
    "00400260": {
        "vr": "SQ",
        "Value": [
            {
                "00080100": {
                    "vr": "SH",
                    "Value": [
                        "CTABDOM\u0000"
                    ]
                },
                "00080102": {
                    "vr": "SH",
                    "Value": [
                        "XPLORE"
                    ]
                },
                "00080104": {
                    "vr": "LO",
                    "Value": [
                        "CT1 abdomen\u0000"
                    ]
                }
            }
        ]
    },
    "00400275": {
        "vr": "SQ",
        "Value": [
            {
                "00400007": {
                    "vr": "LO",
                    "Value": [
                        "CT1 abdomen\u0000"
                    ]
                },
                "00400008": {
                    "vr": "SQ",
                    "Value": [
                        {
                            "00080100": {
                                "vr": "SH",
                                "Value": [
                                    "CTABDOM\u0000"
                                ]
                            },
                            "00080102": {
                                "vr": "SH",
                                "Value": [
                                    "XPLORE"
                                ]
                            },
                            "00080104": {
                                "vr": "LO",
                                "Value": [
                                    "CT1 abdomen\u0000"
                                ]
                            }
                        }
                    ]
                },
                "00400009": {
                    "vr": "SH",
                    "Value": [
                        "A10026177758"
                    ]
                },
                "00401001": {
                    "vr": "SH",
                    "Value": [
                        "A10026177757"
                    ]
                }
            }
        ]
    },
    "00401001": {
        "vr": "SH",
        "Value": [
            "A10026177757"
        ]
    }
}
```
</details>

### Code
```js
const fs = require("fs");
const path = require("path");
const { DicomJsonToFhir } = require("dicomjson-to-fhir");

let data = fs.readFileSync(
    path.join(__dirname, "./dicomjson.json") 
).toString();

let dicomJsonToFhir = new DicomJsonToFhir(JSON.parse(data), "http://aaExample.com/wado-rs", "my-endpoint");

// Only obtain Endpoint, Patient and ImagingStudy
let fhirJson = dicomJsonToFhir.getFhirJson();

// Add reference fields you need with array to arguments
let fhirJsonFull = dicomJsonToFhir.getFhirJson([
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
```

<details>
    <summary>Result</summary>

```json
{
  "patient": {
    "resourceType": "Patient",
    "id": "0",
    "gender": "unknown",
    "active": true,
    "name": [
      {
        "use": "usual"
      }
    ]
  },
  "endpoint": {
    "resourceType": "Endpoint",
    "status": "active",
    "id": "my-endpoint",
    "connectionType": {
      "system": "http://terminology.hl7.org/CodeSystem/endpoint-connection-type",
      "code": "dicom-wado-rs"
    },
    "payloadType": [
      {
        "text": "DICOM"
      }
    ],
    "payloadMimeType": [
      "application/dicom"
    ],
    "address": "http://aaExample.com/wado-rs"
  },
  "imagingStudy": {
    "resourceType": "ImagingStudy",
    "id": "1.2.826.0.1.3680043.8.1055.1.20111102150758591.92402465.76095170",
    "identifier": [
      {
        "use": "official",
        "system": "urn:dicom:uid",
        "value": "urn:oid:1.2.826.0.1.3680043.8.1055.1.20111102150758591.92402465.76095170"
      }
    ],
    "status": "unknown",
    "subject": {
      "reference": "Patient/0",
      "type": "Patient",
      "identifier": {
        "use": "usual",
        "value": "0"
      }
    },
    "started": "2006-10-12T01:02:58.000Z",
    "description": "CT1abdomen",
    "series": [
      {
        "uid": "1.2.826.0.1.3680043.8.1055.1.20111102150758591.96842950.07877442",
        "number": 6168,
        "modality": {
          "system": "http://dicom.nema.org/resources/ontology/DCM",
          "code": "CT"
        },
        "description": "ARTERIELLE",
        "instance": [
          {
            "uid": "1.2.826.0.1.3680043.8.1055.1.20111102150758591.03296050.69180943",
            "sopClass": {
              "system": "urn:ietf:rfc:3986",
              "code": "urn:oid:1.2.840.10008.5.1.4.1.1.2"
            },
            "number": "1",
            "title": "ORIGINAL"
          }
        ]
      }
    ]
  }
}
```
</details>
