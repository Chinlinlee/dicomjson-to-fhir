const HumanNameUseCode = Object.freeze({
    usual: "usual",
    official: "official",
    temp: "temp",
    nickname: "nickname",
    anonymous: "anonymous",
    old: "old",
    maiden: "maiden"
});

class HumanName {
    constructor() {
        this.use = HumanNameUseCode.anonymous;
        this.text = undefined;
        this.family = undefined;
        this.given = undefined;
        this.prefix = undefined;
        this.suffix = undefined;
    }

    toJson() {
        return Object.getOwnPropertyNames(this).reduce((a, b) => {
            if (this[b]) a[b] = this[b];
            return a;
        }, {});
    }
}

module.exports.HumanNameUseCode = HumanNameUseCode;
module.exports.HumanName = HumanName;