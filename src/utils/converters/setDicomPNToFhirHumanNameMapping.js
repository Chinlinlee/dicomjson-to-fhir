/**
 * @typedef DicomPersonName
 * @property familyName
 * @property givenName
 * @property middleName
 * @property prefix
 * @property suffix
 * 
 */

const setDicomPersonNameToFhirHumanNameMapping = {
    /**
     * 
     * @param {DicomPersonName} dicomPersonName 
     * @param {HumanName} fhirHumanName 
     */
    familyName: (dicomPersonName, fhirHumanName) => {
        if (dicomPersonName?.familyName) {
            fhirHumanName.family = dicomPersonName.familyName;
        }
    },
    /**
     * 
     * @param {DicomPersonName} dicomPersonName 
     * @param {HumanName} fhirHumanName 
     */
    givenName: (dicomPersonName, fhirHumanName) => {
        if (dicomPersonName?.givenName) {
            if (!fhirHumanName.given) fhirHumanName.given = [];
            fhirHumanName.given.push(dicomPersonName.givenName);
        }
    },
    /**
     * 
     * @param {DicomPersonName} dicomPersonName 
     * @param {HumanName} fhirHumanName 
     */
    middleName: (dicomPersonName, fhirHumanName) => {
        if (dicomPersonName?.middleName) {
            if (!fhirHumanName.given) fhirHumanName.given = [];
            fhirHumanName.given.push(dicomPersonName.middleName);
        }
    },
    /**
     * 
     * @param {DicomPersonName} dicomPersonName 
     * @param {HumanName} fhirHumanName 
     */
    prefix: (dicomPersonName, fhirHumanName) => {
        if (dicomPersonName?.prefix) {
            if (!fhirHumanName.prefix) fhirHumanName.prefix = [];
            fhirHumanName.prefix.push(dicomPersonName.prefix);
        }
    },
    /**
     * 
     * @param {DicomPersonName} dicomPersonName 
     * @param {HumanName} fhirHumanName 
     */
    suffix: (dicomPersonName, fhirHumanName) => {
        if (dicomPersonName?.suffix) {
            if (!fhirHumanName.suffix) fhirHumanName.suffix = [];
            fhirHumanName.suffix.push(dicomPersonName.suffix);
        }
    }
};

module.exports.setDicomPersonNameToFhirHumanNameMapping = setDicomPersonNameToFhirHumanNameMapping;