const fs = require('fs');
const fsPromises = fs.promises;
const {Transform, Writable, Duplex} = require('stream');

class WriteLogs extends Writable {

    constructor(opt = {}) {
        super(opt);
        this.logs = opt.logs;
        this.onlyCount = opt.onlyCount;
    }

    _write(chunk, encoding, next) {

        if (this.onlyCount) {
            this.onlyCount.count++;
        } else {
            this.logs.push(JSON.parse(chunk.toString()));
        }

        next();

    }

}

class TransformToLogs extends Transform {

    constructor(opt = {}) {
        opt.readableObjectMode = true;
        super(opt);

        this.chunksData = '';
        this.pushData = [];
        this.separator = opt.separator || '\r\n';
        this.isFlat = opt.isFlat;
        this.fieldsSeparator = opt.fieldsSeparator;
        this.filter = opt.filter;
        this.countLogs = 0;
        this.offset = 0;
        this.first = 0;
        this.last = 0;

    }

    _transform(chunk, encoding, next) {

        this.chunksData += chunk.toString();
        let logIsFill = this.chunksData.includes(this.separator);

        if (logIsFill) {

            this.pushData = this.chunksData.split(this.separator);
            let lastData = this.pushData.pop();
            let lastDataIsFullLog = lastData.includes(this.separator);
            if (lastDataIsFullLog) {
                this.pushData.push(lastData);
            } else {
                this.chunksData = lastData;
            }

            let isFirst = true;

            for (let strLog of this.pushData) {
                let log = this._convertStringToLog(strLog, isFirst);
                if (this._pushLog(log)) {
                    this.push(JSON.stringify(log));
                }
                isFirst = false;
            }

        }

        next();

    }

    _flush(next) {

        if (!this.isFlat && this.chunksData) {
            let strLog = this.chunksData;
            let log = this._convertFlatJsonStringToLog(`{${strLog}`);
            if (this._pushLog(log)) {
                this.push(JSON.stringify(log));
            }
        }

        next();

    }

    _pushLog(log) {

        let pushLog = this._takeLog(log);

        if (!pushLog) {
            return false;
        }

        if (this.filter.last && this.filter.countLogs === 0) {
            return false;
        }

        if (this.filter.first) {
            return this._pushFirstLog();
        }

        if (this.filter.last && !this.filter.onlyCount) {
            return this._pushLastLog();
        }

        return pushLog;

    }

    _pushFirstLog() {

        if (this.first < this.filter.first) {

            if (this.offset < this.filter.offset) {
                this.offset++;
                return false;
            }

            this.first++;
            return true;

        }

        return false;

    }

    _pushLastLog() {

        this.countLogs++;
        let start = 0;
        let end = this.filter.countLogs;

        if (this.filter.offset) {
            start = this.filter.countLogs - (this.filter.last + this.filter.offset);
            end = this.filter.countLogs - this.filter.offset;
        } else {
            start = this.filter.countLogs - this.filter.last;
        }

        if (start < this.countLogs && this.countLogs <= end) {
            return true;
        }

        return false;

    }

    _takeLog(log) {

        if (!this.filter) {
            return true;
        }

        if (this.filter.id) {
            return this._takeLogById(log);
        } else if (this.filter.filters) {
            return this._takeLogByFilters(log);
        } else if (this.filter.search) {
            return this._takeLogBySearch(log);
        }

        return true;

    }

    _takeLogById(log) {

        if (this.filter.exclude) {

            if (Array.isArray(this.filter.id)) {
                return !this.filter.id.includes(log.id);
            }

            return !this.filter.id === log.id;

        } else {

            if (Array.isArray(this.filter.id)) {
                return this.filter.id.includes(log.id);
            }

            return this.filter.id === log.id;

        }

    }

    _takeLogByFilters(log) {

        for (let filter of this.filter.filters) {
            let filterEl = this._takeLogByFilterEl(log, filter);
            if (!filterEl) {
                return false;
            }
        }

        return true;

    }

    _takeLogByFilterEl(log, filter) {
        // =, <=, >=, <>, <, >, in, nin, contain
        if (filter.compare === '=') {
            return log[filter.field] === filter.value;
        } else if (filter.compare === '<=') {
            return log[filter.field] <= filter.value;
        } else if (filter.compare === '>=') {
            return log[filter.field] >= filter.value;
        } else if (filter.compare === '<>') {
            return log[filter.field] !== filter.value;
        } else if (filter.compare === '<') {
            return log[filter.field] < filter.value;
        } else if (filter.compare === '>') {
            return log[filter.field] > filter.value;
        } else if (filter.compare === 'in') {
            return filter.value.includes(log[filter.field]);
        } else if (filter.compare === 'nin') {
            return !filter.value.includes(log[filter.field]);
        } else if (filter.compare === 'contain') {
            return log[filter.field].includes(filter.value);
        }

        return true;
    }

    _convertStringToLog(strLog, isFirst) {

        let log;

        if (this.isFlat && this.fieldsSeparator) {
            log = this._convertFlatStringToLog(strLog);
        } else if (this.isFlat && !this.fieldsSeparator) {
            log = this._convertFlatJsonStringToLog(strLog);
        } else {
            log = this._convertJsonStringToLog(strLog, isFirst);
        }

        return log;

    }

    _takeLogBySearch(log) {
        let strLog = JSON.stringify(log);
        return strLog.includes(this.filter.search);
    }

    _convertFlatJsonStringToLog(strLog) {
        return JSON.parse(strLog);
    }

    _convertJsonStringToLog(strLog, isFirst) {

        let log = {};

        if (isFirst) {
            log = JSON.parse(`${strLog}}`);
        } else {
            log = JSON.parse(`{${strLog}}`);
        }

        return log;

    }

    _convertFlatStringToLog(strLog) {

        let fields = strLog.split(this.fieldsSeparator);
        let log = {};

        log.log = fields[0];
        log.comment = fields[1];
        log.system = fields[2];
        log.user = fields[3];
        log.posted = fields[4];
        log.type = fields[5];
        log.code = fields[6];
        log.id = fields[7];

        return log;

    }

}

module.exports = class File {
    constructor() {
        this.path = __dirname;
        this.name = 'jrflogs.txt';
        this.separator = null;
        this.typesOutput = {
            FLAT: 'flat',
            JSON: 'json'
        };
        this.typeOutput = this.typesOutput.FLAT;
    }

    async init({
                   path = __dirname,
                   name = 'jrflogs.txt',
                   separator = null,
                   typeOutput = 'flat'
               } = {}) {
        this.path = path;
        this.name = name;
        this.separator = separator;
        this.typeOutput = typeOutput;
    }

    async add(log) {
        if (this.typeOutput === this.typesOutput.FLAT) {
            await this._outputFlat(log);
        } else if (this.typeOutput === this.typesOutput.JSON) {
            await this._outputJSON(log);
        } else {
            await this._outputString(log);
        }
    }

    async get(filter) {

        if (filter.last) {
            await this._fillCountLogs(filter);
        }

        if (filter.stream && !filter.onlyCount) {
            return await this._transformToLogs(filter);
        } else if (filter.onlyCount) {

            if (filter.countLogs) {
                return filter.countLogs;
            }

            let streamLogs = await this._transformToLogs(filter);
            let logs = await this._getLogsOnlyCount(streamLogs);

            return logs.count;

        } else {

            let streamLogs = await this._transformToLogs(filter);
            let logs = await this._getLogsWithoutStream(streamLogs);

            return logs;
        }

    }

    async del(filter) {
        return 0;
    }

    async _fillCountLogs(filter) {

        filter.onlyCount = true;
        let streamLogs = await this._transformToLogs(filter);
        let logs = await this._getLogsOnlyCount(streamLogs);
        filter.countLogs = logs.count;
        filter.onlyCount = false;

    }

    async _getLogsOnlyCount(streamLogs) {

        return new Promise(resolve => {
            let logs = {count: 0};
            let writeLogs = new WriteLogs({onlyCount: logs, objectMode: true, highWaterMark: 1});
            streamLogs.pipe(writeLogs);
            writeLogs.on('finish', () => resolve(logs));
        });

    }

    async _getLogsWithoutStream(streamLogs) {

        return new Promise(resolve => {
            let logs = [];
            let writeLogs = new WriteLogs({logs, objectMode: true, highWaterMark: 1});
            streamLogs.pipe(writeLogs);
            writeLogs.on('finish', () => resolve(logs));
        });


        //// other methods
        // let logs = '';
        // for await (let chunk of streamLogs) {
        //     logs += chunk.toString();
        // }
        // return logs;

        // let end = new Promise(function(resolve, reject) {
        //     let logs = [];
        //     let writeLogs = new WriteLogs({logs});
        //     streamLogs.pipe(writeLogs);
        //     streamLogs.on('finish', () => resolve(logs));
        // });
        // return end;
    }


    async _transformToLogs(filter) {

        let options = {filter};
        options.fieldsSeparator = this.separator;
        options.isFlat = this.typeOutput === this.typesOutput.FLAT;
        options.separator = await this._getSeparatorOfLogs();

        let rs = fs.createReadStream(`${this.path}/${this.name}`);
        let ts = new TransformToLogs(options);
        let logsStream = rs.pipe(ts);

        return logsStream;

    }

    async _getSeparatorOfLogs() {

        if (this.typeOutput === this.typesOutput.FLAT) {
            return '\r\n';
        } else if (this.typeOutput === this.typesOutput.JSON) {
            return '}\r\n{';
        }

        return '\r\n';
    }

    async _outputString(log) {
        await fsPromises.appendFile(`${this.path}/${this.name}`, `${String(log)}\r\n`);
    }

    async _outputJSON(log) {
        await fsPromises.appendFile(`${this.path}/${this.name}`, `${JSON.stringify(log, null, 4)}\r\n`);
    }

    async _outputFlat(log) {
        if (this.separator) {
            let str = await this._createFlatWithSeparator(log);
            await fsPromises.appendFile(`${this.path}/${this.name}`, `${str}\r\n`);
        } else {
            await fsPromises.appendFile(`${this.path}/${this.name}`, `${JSON.stringify(log)}\r\n`);
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

};