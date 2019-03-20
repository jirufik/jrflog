const STDOUT = require('./stdout');
const FILE = require('./file');
const MongoDB = require('./mongoDB');
const PostgreSQL = require('./postgreSQL');

module.exports = class Model {

    constructor(options) {
        this.model = null;
        this.typesLog = {
            info: 'info',
            warning: 'warning',
            error: 'error',
            debug: 'debug',
            other: 'other'
        };

        options = options || {type: 'stdout'};
        if (!options.type) {
            options.type = 'stdout';
        }

        if (options.type === 'stdout') {
            this.model = new STDOUT();
        } else if (options.type === 'file') {
            this.model = new FILE();
        } else if (options.type === 'mongoDB') {
            this.model = new MongoDB(options);
        } else if (options.type === 'postgreSQL') {
            this.model = new PostgreSQL(options);
        }

    }

    async init(options) {
        await this.model.init(options);
    }

    async add(log, type) {
        const logAdd = await this._fillLog({log, type});
        await this.model.add(logAdd);
    }

    async get(filter) {
        return await this.model.get(filter);
    }

    async del(filter) {
        return await this.model.del(filter);
    }

    async _generateEmptyLog() {

        return {
            log: '',
            comment: '',
            system: '',
            user: '',
            posted: new Date(),
            type: this.typesLog.other,
            code: '',
            id: await this._generateid()
        }

    }

    async _fillLog({
                       logAdd,
                       log = '',
                       type = this.typesLog.other
                   } = {}) {

        logAdd = logAdd || await this._generateEmptyLog();

        if (typeof log === 'string') {
            logAdd.log = log;
        }

        logAdd.type = await this._getType(log, type);

        if (await this._isObjLog(log)) {

            await this._fillFields([
                'log',
                'comment',
                'system',
                'user',
                'code'
            ], logAdd, log);

        } else {
            try {
                logAdd.log = JSON.stringify(log);
            } catch (e) {
                logAdd.log = String(log);
            }
        }

        return logAdd;

    }

    async _isObjLog(log) {
        return typeof log === 'object' && log.log;
    }

    async _fillFields(fields, toObj, fromObj) {
        for (let field of fields) {
            try {
                toObj[field] = fromObj[field] || '';
            } catch (e) {
                toObj[field] = '';
            }
        }
    }

    async _getType(log, type) {

        let findType = type;
        if (typeof log === 'object') {
            try {
                findType = log.type;
            } catch (e) {
                findType = this.typesLog.other;
            }
            findType = findType || type || this.typesLog.other;
        }

        try {
            type = this.typesLog[findType];
            if (!type) {
                type = this.typesLog.other;
            }
        } catch (e) {
            type = this.typesLog.other;
        }

        return type;

    }

    async _generateid(len = 5, smallChar = true, bigChar = true, num = true, date = true) {
        let strid = '';
        let patern = '';
        if (smallChar) {
            patern += 'abcdefghijklmnopqrstuvwxyz';
        }
        if (bigChar) {
            patern += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        }
        if (num) {
            patern += '0123456789';
        }

        for (let i = 0; i < len; i++) {
            strid += patern.charAt(Math.floor(Math.random() * patern.length));
        }

        if (date) {
            strid += `-${new Date().getTime()}`;
        }
        return strid;
    }

};