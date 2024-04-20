const { DicomJson } = require("../DICOM/dicomJson");

const { Location } = require("../FHIR/Location");
const { Address } = require("../FHIR/Address");
const { uid } = require("uid/secure");

class LocationFactory {
    constructor(dicomJson) {
        this.dicomJson = dicomJson;
    }

    make() {
        let locationName = DicomJson.getString(this.dicomJson, "00081040") || DicomJson.getString(this.dicomJson, "00400243");

        if (locationName) {
            return this.#getLocation(locationName);
        } 

        return undefined;
    }

    #getLocation(name) {
        let address = new Address();
        address.text = name;
        let location = new Location();
        location.address = address;
        location.id = uid(16);

        return location;
    }
}

module.exports.LocationFactory = LocationFactory;