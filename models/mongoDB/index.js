const MongoClient = require('mongodb').MongoClient;

module.exports = class MongoDB {

    constructor({
                    server = 'localhost',
                    port = 27100,
                    db = 'jrflogs',
                    collection = 'logs',
                    user = '',
                    password = ''
                } = {}) {

        this.server = server;
        this.port = port;
        this.db = db;
        this.collection = collection;
        this.user = user;
        this.password = password;
        this.logs = null;
        this._db = null;
        this.fields = ['log', 'comment', 'system', 'user', 'posted', 'type', 'code', 'id'];
    }


    async init() {

        let res = await this.connect();
        if (!res.okay) {
            throw Error('Not init model mongoDB');
        }

    }

    async connect() {

        let res = await this._generateRes(false, 'not connect');

        let connectStr = await this.getConnectStr();
        const db = await MongoClient.connect(connectStr, {useNewUrlParser: true});
        this._db = db;
        const collection = db.db(this.db).collection(this.collection);
        this.logs = collection;

        res.okay = true;
        res.description = '';
        return res;

    }

    async disconnect() {
        if (this._db) {
            await this._db.close();
        }
    }

    async getConnectStr() {

        let url = 'mongodb://';

        if (this.user || this.password) {
            url += `${this.user}:${this.password}@`;
        }

        if (this.server) {
            url += this.server;
        }

        if (this.port) {
            url += `:${this.port}`;
        }

        if (this.db) {
            url += `/${this.db}`;
        }

        return url;

    }

    async add(log) {

        let res = await this._generateRes(false, 'not add');

        let resInsert = (await this.logs.insertOne(log));
        if (!resInsert.insertedId) {
            return res;
        }

        res.okay = true;
        res.description = '';
        res.output.push(resInsert.insertedId);
        return res;

    }

    async get(filter) {

        let res = await this._generateRes(true);

        let find = await this._generateFind(filter);

        let sort = {};
        let skip = filter.offset || 0;
        let limit = filter.first || filter.last || 0;

        if (filter.first) {
            sort = {posted: 1};
        } else if (filter.last) {
            sort = {posted: -1};
        }

        if (filter.onlyCount) {
            return (await this.logs.find(find).sort(sort).skip(skip).limit(limit).count());
        }

        if (filter.stream) {
            return (await this.logs.find(find).sort(sort).skip(skip).limit(limit).transformStream());
        } else {
            let resGet = (await this.logs.find(find).sort(sort).skip(skip).limit(limit).toArray());
            return resGet;
        }

    }

    async del(filter) {

        let res = await this._generateRes(true);

        let find = await this._generateFind(filter);
        let resDel = (await this.logs.deleteMany(find));
        return resDel.deletedCount;

    }

    async _generateFind(filter) {

        if (filter.id) {
            return await this._generateFindById(filter.id, filter.exclude);
        } else if (filter.filters) {
            return await this._generateFindByFilters(filter.filters);
        } else if (filter.search) {
            return await this._generateFindBySearch(filter.search);
        }

        return {};

    }

    async _generateFindById(id, exclude) {

        let find = {};

        if (id && typeof id === 'string') {

            if (exclude) {
                find = {id: {$ne: id}};
            } else {
                find = {id};
            }

        } else if (id && Array.isArray(id)) {

            if (exclude) {
                find = {id: {$nin: id}};
            } else {
                find = {id: {$in: id}};
            }

        }

        return find;

    }

    async _generateFindByFilters(filters) {

        let find = {$and: []};

        for (let filter of filters) {
            let filterEl = await this._generateFilterEl(filter);
            find.$and.push(filterEl);
        }

        return find;

    }

    async _generateFilterEl(filter) {

        // =, <=, >=, <>, <, >, in, nin, contain
        let find = {};

        if (filter.compare === '=') {
            find[filter.field] = {$eq: filter.value};
        } else if (filter.compare === '<=') {
            find[filter.field] = {$lte: filter.value};
        } else if (filter.compare === '>=') {
            find[filter.field] = {$gte: filter.value};
        } else if (filter.compare === '<>') {
            find[filter.field] = {$ne: filter.value};
        } else if (filter.compare === '<') {
            find[filter.field] = {$lt: filter.value};
        } else if (filter.compare === '>') {
            find[filter.field] = {$gt: filter.value};
        } else if (filter.compare === 'in') {
            find[filter.field] = {$in: filter.value};
        } else if (filter.compare === 'nin') {
            find[filter.field] = {$nin: filter.value};
        } else if (filter.compare === 'contain') {
            find[filter.field] = {$regex: filter.value};
        }

        return find;

    }

    async _generateFindBySearch(search) {

        let find = {$or: []};

        for (let field of this.fields) {
            let el = {};
            el[field] = {$regex: search};
            find.$or.push(el);
        }

        return find;

    }

    async _generateRes(okay = false, description = '') {
        return {
            okay,
            description,
            output: [],
            error: {}
        }
    }

};