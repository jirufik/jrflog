const Model = require('./models');

module.exports = class JRFLOG {

    constructor() {
        this._model = null;
        this.types = {
            STDOUT: 'stdout',
            File: 'file',
            MongoDB: 'mongoDB',
            PosgreSQL: 'postgreSQL'
        };
    }

    async init(options) {
        this._model = new Model(options);
        await this._model.init(options);
    }

    async add(log, type) {
        await this._model.add(log, type);
    }

    async get(filter) {
        return await this._model.get(filter);
    }

    async del(filter) {
        return await this._model.del(filter);
    }

    async info(log) {
        await this.add(log, 'info');
    }

    async warning(log) {
        await this.add(log, 'warning');
    }

    async error(log) {
        await this.add(log, 'error');
    }

    async debug(log) {
        await this.add(log, 'debug');
    }

    async other(log) {
        await this.add(log, 'other');
    }

};