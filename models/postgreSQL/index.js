const {Pool} = require('pg');
const QueryStream = require('pg-query-stream');

module.exports = class PostgreSQL {

    constructor({
                    server = 'localhost',
                    port = 5432,
                    db = 'jrflogs',
                    user = '',
                    password = ''
                } = {}) {

        this.server = server;
        this.port = port;
        this.db = db;
        this.user = user;
        this.password = password;
        this._pool = null;
        this._defaultGet = 'SELECT id, log, comment, system, user, posted, type, code FROM logs';
        this.fields = ['log', 'comment', 'system', 'user', 'posted', 'type', 'code', 'id'];

    }

    async init() {

        let client;
        let res = await this._generateRes(true, 'not connect');
        try {

            this._pool = new Pool({
                host: this.server,
                port: this.port,
                database: this.db,
                user: this.user,
                password: this.password
            });
            client = await this._pool.connect();
            let createRes = await this.createTables();
            if (!createRes.okay) res.okay = false;
            createRes = await this.createIndex();
            if (!createRes.okay) res.okay = false;

        } catch (e) {
            res.okay = false;
        } finally {
            if (client) client.release();
        }

        if (!res.okay) {
            throw Error(`Not init model postgreSQL: ${res.description}`);
        }

    }

    async disconnect() {
        if (this._pool) await this._pool.end();
    }

    async createTables() {

        let resCreate = await this.createLogsTable();
        if (!resCreate.okay) return resCreate;

        return resCreate;
    }

    async createLogsTable() {
        return await this.createTable({
            command: `CREATE TABLE IF NOT EXISTS logs (id text PRIMARY KEY, log text,
             comment text, system text, "user" text, posted timestamp, type text, code text);`,
            description: 'not create logs table'
        });
    }

    async createIndex() {
        return await this.createTable({
            command: `CREATE INDEX IF NOT EXISTS posted_idx ON logs (posted);`,
            description: 'not create posted index'
        });
    }

    async createTable({command, description = 'not create table'} = {}) {

        let res = await this._generateRes(false, description);
        let client;
        try {
            client = await this._pool.connect();
            await client.query(command);
        } catch (e) {
            return res;
        } finally {
            if (client) client.release();
        }

        res.okay = true;
        res.description = "";
        return res;

    }

    async add(log, withTransaction = true) {

        let res = await this._generateRes(false, 'not add');

        let resQuery = await this._convertLogToQuery(log);

        let client;
        let resAdd;
        try {
            client = await this._pool.connect();
            if (withTransaction) await client.query('BEGIN');
            resAdd = await client.query(resQuery);
            if (withTransaction) await client.query('COMMIT');
        } catch (e) {
            if (withTransaction) await client.query('ROLLBACK');
            return res;
        } finally {
            if (client) client.release();
        }

        res.okay = true;
        res.description = '';
        res.output.push(resAdd.rows[0].id);
        return res;

    }

    async get(filter) {

        let query = await this._generateGetQuery(filter);
        if (filter.first) {
            query.text = query.text.replace(';', ` ORDER BY posted LIMIT ${filter.first};`);
        } else if (filter.last) {
            query.text = query.text.replace(';', ` ORDER BY posted DESC LIMIT ${filter.last};`);
        } else {
            query.text = query.text.replace(';', ' ORDER BY posted;');
        }

        if (filter.offset) {
            query.text = query.text.replace(';', ` OFFSET ${filter.offset};`);
        }

        query.text = query.text.replace('user', `"user"`);

        let client;
        try {

            if (filter.onlyCount) {

                query.text = await this._convertQueryTextToQueryCount(query.text);
                const resGet = await this._pool.query(query);
                let count = 0;
                if (resGet.rows.length) {
                    count = resGet.rows[0].count;
                }
                return count;

            } else if (filter.stream) {

                client = await this._pool.connect();
                const queryStream = new QueryStream(query.text, query.values);
                const stream = await client.query(queryStream);
                return stream;

            } else {
                const resGet = await this._pool.query(query);
                return resGet.rows;
            }

        } catch (e) {

        } finally {
            if (client) client.release();
        }

    }

    async del(filter, withTransaction = true) {

        let query = await this._generateGetQuery(filter);
        query.text = query.text.replace('SELECT id, log, comment, system, user, posted, type, code', 'DELETE');
        query.text = query.text.replace(';', ' RETURNING *;');

        let client;
        let resDel;
        try {
            client = await this._pool.connect();
            if (withTransaction) await client.query('BEGIN');
            resDel = await client.query(query);
            if (withTransaction) await client.query('COMMIT');
        } catch (e) {
            if (withTransaction) await client.query('ROLLBACK');
            return 0;
        } finally {
            if (client) client.release();
        }

        return resDel.rows.length;
    }

    async _convertQueryTextToQueryCount(text) {

        let queryCount = '';
        const strFields = 'id, log, comment, system, "user", posted, type, code';

        queryCount = text.replace(strFields, 'COUNT(*)');
        queryCount = queryCount.replace('ORDER BY posted', '');

        return queryCount;

    }

    async _generateGetQuery(filter) {

        let query = {
            text: '',
            values: []
        };

        if (filter.id) {
            return await this._generateGetQueryById(filter.id, filter.exclude);
        } else if (filter.filters) {
            return await this._generateGetQueryByFilters(filter.filters);
        } else if (filter.search) {
            return await this._generateGetQueryBySearch(filter.search);
        }

        query.text = this._defaultGet + ';';
        return query;
    }

    async _generateGetQueryByFilters(filters) {

        let query = {
            text: '',
            values: []
        };
        query.text = this._defaultGet + ' WHERE true';

        for (let filter of filters) {
            let filterEl = await this._generateFilterEl(filter);
            query.text += ` AND ${filterEl}`;
        }

        query.text += ';';
        return query;

    }

    async _generateFilterEl(filter) {

        // =, <=, >=, <>, <, >, in, nin, contain
        let find = 'true';

        if (filter.compare === 'in') {

            let arr = await this._convertArrayToQueryValues(filter.value);
            find = `${filter.field} IN (${arr})`;

        } else if (filter.compare === 'nin') {

            let arr = await this._convertArrayToQueryValues(filter.value);
            find = `${filter.field} NOT IN (${arr})`;

        } else if (filter.compare === 'contain') {
            find = `${filter.field} LIKE '%${filter.value}%'`;
        } else {
            find = `${filter.field} ${filter.compare} '${filter.value}'`;
        }

        return find;

    }

    async _generateGetQueryBySearch(search) {

        let query = {
            text: '',
            values: []
        };
        query.text = this._defaultGet + ' WHERE ';

        let separator = '';
        for (let field of this.fields) {
            query.text += `${separator} CAST(${field} AS text) LIKE '%${search}%'`;
            separator = ' OR'
        }

        query.text += ';';
        return query;

    }

    async _generateGetQueryById(id, exclude) {

        let query = {
            text: '',
            values: []
        };
        query.text = this._defaultGet;

        if (id && typeof id === 'string') {

            if (exclude) {
                query.text = this._defaultGet + ' WHERE id <> $1';
                query.values.push(id);
            } else {
                query.text = this._defaultGet + ' WHERE id = $1';
                query.values.push(id);
            }

        } else if (id && Array.isArray(id)) {

            let ids = await this._convertArrayToQueryValues(id);
            if (exclude) {
                query.text = this._defaultGet + ` WHERE id NOT IN (${ids})`;
            } else {
                query.text = this._defaultGet + ` WHERE id IN (${ids})`;
            }

        }

        query.text += ';';
        return query;

    }

    async _convertArrayToQueryValues(arr, type = 'string') {

        if (type !== 'string') {
            return arr.join(', ');
        }

        let str = '';
        let separator = '';

        for (let el of arr) {
            str += `${separator} '${el}'`;
            separator = ',';
        }

        return str;
    }

    async _convertLogToQuery(log) {

        let query = {
            text: '',
            values: []
        };

        query.text = 'INSERT INTO logs VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;';
        query.values.push(log.id);
        query.values.push(log.log);
        query.values.push(log.comment);
        query.values.push(log.system);
        query.values.push(log.user);
        query.values.push(log.posted);
        query.values.push(log.type);
        query.values.push(log.code);

        return query;
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