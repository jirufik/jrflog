module.exports = class STDOUT {

    constructor() {
        this.typesOutput = {
            FLAT: 'flat',
            JSON: 'json'
        };
        this.typeOutput = this.typesOutput.FLAT;
        this.color = true;
        this.separator = null;
        this._colors = {
            info: '\x1b[34m',
            warning: '\x1b[33m',
            error: '\x1b[31m',
            debug: '\x1b[36m',
            other: '\x1b[0m'
        };
    }

    async init({typeOutput = 'flat', color = true, separator = null} = {}) {
        this.typeOutput = typeOutput;
        this.color = color;
        this.separator = separator;
    }

    async add(log) {
        try {
            await this._outputObj(log, log.type);
        } catch (e) {
            await this._outputString(log, log.type);
        }
    }

    async _outputObj(log, type) {
        if (this.typeOutput === this.typesOutput.FLAT) {
            await this._outputFlat(log, type);
        } else if (this.typeOutput === this.typesOutput.JSON) {
            await this._outputJSON(log, type);
        } else {
            await this._outputString(log, type);
        }
    }

    async _outputFlat(log, type) {
        if (this.color) {
            await this._outputFlatColor(log, type);
        } else {
            await this._outputFlatNotColor(log);
        }
    }

    async _outputFlatColor(log, type) {
        let color = this._colors[type];
        if (!color) color = this._colors.other;
        if (this.separator) {
            const str = await this._createFlatWithSeparator(log);
            console.log(color, str, this._colors.other);
        } else {
            console.log(color, JSON.stringify(log), this._colors.other);
        }
    }

    async _outputFlatNotColor(log) {
        if (this.separator) {
            const str = await this._createFlatWithSeparator(log);
            console.log(str);
        } else {
            console.log(JSON.stringify(log));
        }
    }

    async _createFlatWithSeparator(log) {
        let str = `${log.log}${this.separator}`;
        str += `${log.comment}${this.separator}`;
        str += `${log.system}${this.separator}`;
        str += `${log.user}${this.separator}`;
        str += `${log.posted}${this.separator}`;
        str += `${log.type}${this.separator}`;
        str += `${log.code}${this.separator}`;
        str += `${log.id}`;
        return str;
    }

    async _outputJSON(log, type) {
        if (this.color) {
            await this._outputJSONColor(log, type);
        } else {
            await this._outputJSONNotColor(log);
        }
    }

    async _outputJSONColor(log, type) {
        let color = this._colors[type];
        if (!color) color = this._colors.other;
        console.log(color, JSON.stringify(log, null, 4), this._colors.other);
    }

    async _outputJSONNotColor(log) {
        console.log(JSON.stringify(log, null, 4));
    }

    async _outputString(log, type) {
        if (this.color) {
            await this._outputStringColor(log, type);
        } else {
            await this._outputStringNotColor(log);
        }
    }

    async _outputStringColor(log, type) {
        let color = this._colors[type];
        if (!color) color = this._colors.other;
        console.log(color, log, this._colors.other);
    }

    async _outputStringNotColor(log) {
        console.log(log);
    }

};