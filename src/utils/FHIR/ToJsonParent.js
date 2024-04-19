class ToJsonParent {
    constructor() {}
    toJson() {
        return Object.getOwnPropertyNames(this).reduce((a, b) => {
            if (this[b]) a[b] = this[b];
            return a;
        }, {});
    }
}

module.exports.ToJsonParent = ToJsonParent;