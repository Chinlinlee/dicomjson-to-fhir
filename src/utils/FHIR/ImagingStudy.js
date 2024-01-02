const { Coding } = require("./Coding");
const { Reference } = require("./Reference");

class ToJsonParent {
    constructor() {}
    toJson() {
        return Object.getOwnPropertyNames(this).reduce((a, b) => {
            if (this[b]) a[b] = this[b];
            return a;
        }, {});
    }
}

class ImagingStudy extends ToJsonParent {
    constructor() {
        super();
        this.resourceType = "ImagingStudy";
        this.id = "";
        this.identifier = []; //0..*
        this.status = "unknown"; //1..1 code registered | available | cancelled | entered-in-error | unknown
        this.modality = undefined; //0..* coding
        this.subject = new Reference(); //1..1 reference
        this.started = undefined; //0..1 dateTime
        this.endpoint = undefined; //0..* Reference don't have this now  (This is mean where the DicomWEB server)
        this.numberOfSeries = undefined; //0..1  int
        this.numberOfInstances = undefined; //0..1 int
        this.description = undefined; //0..1 string
        this.series = []; //0..* 放置ImagingStudy_Series
    }
}

class ImagingStudySeries extends ToJsonParent {
    constructor() {
        super();
        this.uid = ""; //1..1
        this.number = undefined; //0..1 int
        this.modality = new Coding(); //1..1 coding   //
        this.modality.system = "http://dicom.nema.org/resources/ontology/DCM";
        this.description = undefined; //0..1 string
        this.numberOfInstances = ""; //0..1 int
        this.endpoint = undefined; //0..* Reference
        /** @type { Coding } */
        this.bodySite = undefined; //0..1 Coding
        this.laterality = undefined;
        this.started = undefined; //0..1 dateTime
        this.performer = undefined; //0..* {function (Codeable) :0..1, actor:1..1 (Reference)}
        this.instance = []; //0..*
    }
}

class ImagingStudySeriesInstance extends ToJsonParent {
    constructor() {
        super();
        this.uid = ""; //1..1
        this.sopClass = new Coding(); //1..1 coding
        this.number = ""; //0..1
        this.title = undefined; //0..1
    }
}


module.exports.ImagingStudy = ImagingStudy;
module.exports.ImagingStudySeries = ImagingStudySeries;
module.exports.ImagingStudySeriesInstance = ImagingStudySeriesInstance;