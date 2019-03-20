const {assert} = require('chai');
const {expect} = require('chai');
const PostgreSQLModel = require('../models/postgreSQL');
const {postgreSQLConf} = require('./testConf');

module.exports = describe('postgreSQL', () => {

    let modelInit = new PostgreSQLModel(postgreSQLConf);

    before(async () => {
        await modelInit.init();
    });

    after(async () => {
        await modelInit.del({});
        await modelInit.disconnect();
    });

    it('constructor', () => {

        const model = new PostgreSQLModel();
        const fields = ['log', 'comment', 'system', 'user', 'posted', 'type', 'code', 'id'];
        const defaultGet = 'SELECT id, log, comment, system, user, posted, type, code FROM logs';

        assert.equal(model.server, 'localhost', 'invalid server');
        assert.equal(model.port, 5432, 'invalid port');
        assert.equal(model.db, 'jrflogs', 'invalid db');
        assert.equal(model.user, '', 'invalid user');
        assert.equal(model.password, '', 'invalid password');
        assert.equal(model._defaultGet, defaultGet, 'invalid defaultGet');
        assert.isNull(model._pool, 'invalid _pool');
        expect(model.fields).to.eql(fields, 'invalid fields');

    });

    it('constructor with param', () => {

        const model = new PostgreSQLModel({
            server: 'server',
            port: 25000,
            db: 'db',
            user: 'user',
            password: 'password'
        });
        const fields = ['log', 'comment', 'system', 'user', 'posted', 'type', 'code', 'id'];
        const defaultGet = 'SELECT id, log, comment, system, user, posted, type, code FROM logs';

        assert.equal(model.server, 'server', 'invalid server');
        assert.equal(model.port, 25000, 'invalid port');
        assert.equal(model.db, 'db', 'invalid db');
        assert.equal(model.user, 'user', 'invalid user');
        assert.equal(model.password, 'password', 'invalid password');
        assert.equal(model._defaultGet, defaultGet, 'invalid defaultGet');
        assert.isNull(model._pool, 'invalid _pool');
        expect(model.fields).to.eql(fields, 'invalid fields');

    });

    it('_convertLogToQuery', async () => {

        const model = new PostgreSQLModel();

        const query = {
            text: 'INSERT INTO logs VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;',
            values: []
        };

        const log = {
            log: 'log',
            comment: 'comment',
            system: 'system',
            user: 'user',
            posted: '2019-01-01 00:00:00',
            type: 'type',
            id: 'id'
        };

        query.values.push(log.id);
        query.values.push(log.log);
        query.values.push(log.comment);
        query.values.push(log.system);
        query.values.push(log.user);
        query.values.push(log.posted);
        query.values.push(log.type);
        query.values.push(log.code);

        let res = await model._convertLogToQuery(log);

        expect(res).to.eql(query, 'invalid res');

    });

    it('_convertArrayToQueryValues type = string', async () => {

        const model = new PostgreSQLModel();
        const arr = ['rick', 'morty'];
        const validRes = ` 'rick', 'morty'`;

        let res = await model._convertArrayToQueryValues(arr);

        assert.equal(res, validRes, 'invalid res');

    });

    it('_convertArrayToQueryValues type not string', async () => {

        const model = new PostgreSQLModel();
        const arr = [1, 2];
        const validRes = '1, 2';

        let res = await model._convertArrayToQueryValues(arr, 'number');

        assert.equal(res, validRes, 'invalid res');

    });

    it('_generateGetQueryById id string', async () => {

        const model = new PostgreSQLModel();
        const id = 'id';
        const validRes = {
            text: 'SELECT id, log, comment, system, user, posted, type, code FROM logs WHERE id = $1;',
            values: ['id']
        };

        let res = await model._generateGetQueryById(id);

        expect(res).to.eql(validRes, 'invalid res');

    });

    it('_generateGetQueryById id string exclude', async () => {

        const model = new PostgreSQLModel();
        const id = 'id';
        const exclude = true;
        const validRes = {
            text: 'SELECT id, log, comment, system, user, posted, type, code FROM logs WHERE id <> $1;',
            values: ['id']
        };

        let res = await model._generateGetQueryById(id, exclude);

        expect(res).to.eql(validRes, 'invalid res');

    });

    it('_generateGetQueryById id array', async () => {

        const model = new PostgreSQLModel();
        const id = ['id', 'id1'];
        const validRes = {
            text: "SELECT id, log, comment, system, user, posted, type, code FROM logs WHERE id IN ( 'id', 'id1');",
            values: []
        };

        let res = await model._generateGetQueryById(id);

        expect(res).to.eql(validRes, 'invalid res');

    });

    it('_generateGetQueryById id array exclude', async () => {

        const model = new PostgreSQLModel();
        const id = ['id', 'id1'];
        const exclude = true;
        const validRes = {
            text: "SELECT id, log, comment, system, user, posted, type, code FROM logs WHERE id NOT IN ( 'id', 'id1');",
            values: []
        };

        let res = await model._generateGetQueryById(id, exclude);

        expect(res).to.eql(validRes, 'invalid res');

    });

    it('_generateGetQueryBySearch', async () => {

        const model = new PostgreSQLModel();
        const search = 'rick';
        const validRes = {
            text: "SELECT id, log, comment, system, user, posted, type, code FROM logs WHERE  CAST(log AS text) LIKE '%rick%' OR CAST(comment AS text) LIKE '%rick%' OR CAST(system AS text) LIKE '%rick%' OR CAST(user AS text) LIKE '%rick%' OR CAST(posted AS text) LIKE '%rick%' OR CAST(type AS text) LIKE '%rick%' OR CAST(code AS text) LIKE '%rick%' OR CAST(id AS text) LIKE '%rick%';",
            values: []
        };

        let res = await model._generateGetQueryBySearch(search);

        expect(res).to.eql(validRes, 'invalid res');

    });

    it('_generateFilterEl in', async () => {

        const model = new PostgreSQLModel();
        const filter = {
            field: 'log',
            compare: 'in',
            value: ['rick', 'morty']
        };
        const validRes = `log IN ( 'rick', 'morty')`;

        let res = await model._generateFilterEl(filter);

        assert.equal(res, validRes, 'invalid res');

    });

    it('_generateFilterEl nin', async () => {

        const model = new PostgreSQLModel();
        const filter = {
            field: 'log',
            compare: 'nin',
            value: ['rick', 'morty']
        };
        const validRes = `log NOT IN ( 'rick', 'morty')`;

        let res = await model._generateFilterEl(filter);

        assert.equal(res, validRes, 'invalid res');

    });

    it('_generateFilterEl contain', async () => {

        const model = new PostgreSQLModel();
        const filter = {
            field: 'log',
            compare: 'contain',
            value: 'rick'
        };
        const validRes = `log LIKE '%rick%'`;

        let res = await model._generateFilterEl(filter);

        assert.equal(res, validRes, 'invalid res');

    });

    it('_generateFilterEl other compare', async () => {

        const model = new PostgreSQLModel();
        const filter = {
            field: 'log',
            compare: '=',
            value: 'rick'
        };
        const validRes = `log = 'rick'`;

        let res = await model._generateFilterEl(filter);

        assert.equal(res, validRes, 'invalid res');

    });

    it('_generateGetQueryByFilters', async () => {

        const model = new PostgreSQLModel();
        const filters = [
            {field: 'log', compare: 'nin', value: ['rick', 'morty']},
            {field: 'log', compare: '<', value: 'rick'},
            {field: 'log', compare: 'contain', value: 'rick'}
        ];
        const validRes = {
            text: "SELECT id, log, comment, system, user, posted, type, code FROM logs WHERE true AND log NOT IN ( 'rick', 'morty') AND log < 'rick' AND log LIKE '%rick%';",
            values: []
        };

        let res = await model._generateGetQueryByFilters(filters);

        expect(res).to.eql(validRes, 'invalid res');

    });

    it('_generateGetQuery filter id', async () => {

        const model = new PostgreSQLModel();
        const filter = {id: ['rick', 'morty'], exclude: true};
        const validRes = {
            text: "SELECT id, log, comment, system, user, posted, type, code FROM logs WHERE id NOT IN ( 'rick', 'morty');",
            values: []
        };

        let res = await model._generateGetQuery(filter);

        expect(res).to.eql(validRes, 'invalid res');

    });

    it('_generateGetQuery filter filters', async () => {

        const model = new PostgreSQLModel();
        const filter = {
            filters: [
                {field: 'log', compare: 'nin', value: ['rick', 'morty']},
                {field: 'log', compare: '<', value: 'rick'}
            ]
        };
        const validRes = {
            text: "SELECT id, log, comment, system, user, posted, type, code FROM logs WHERE true AND log NOT IN ( 'rick', 'morty') AND log < 'rick';",
            values: []
        };

        let res = await model._generateGetQuery(filter);

        expect(res).to.eql(validRes, 'invalid res');

    });

    it('_generateGetQuery filter search', async () => {

        const model = new PostgreSQLModel();
        const filter = {search: 'search'};
        const validRes = {
            text: "SELECT id, log, comment, system, user, posted, type, code FROM logs WHERE  CAST(log AS text) LIKE '%search%' OR CAST(comment AS text) LIKE '%search%' OR CAST(system AS text) LIKE '%search%' OR CAST(user AS text) LIKE '%search%' OR CAST(posted AS text) LIKE '%search%' OR CAST(type AS text) LIKE '%search%' OR CAST(code AS text) LIKE '%search%' OR CAST(id AS text) LIKE '%search%';",
            values: []
        };

        let res = await model._generateGetQuery(filter);

        expect(res).to.eql(validRes, 'invalid res');

    });

    it('_convertQueryTextToQueryCount', async () => {

        const model = new PostgreSQLModel();
        const text = 'SELECT id, log, comment, system, "user", posted, type, code FROM logs WHERE id = $1 ORDER BY posted;';
        const validRes = 'SELECT COUNT(*) FROM logs WHERE id = $1 ;';

        let res = await model._convertQueryTextToQueryCount(text);

        assert.equal(res, validRes, 'invalid res');

    });

    it('empty base', async () => {

        let res = await modelInit.get({});

        assert.isArray(res, 'not array');
        assert.equal(res.length, 0, 'not empty');

    });

    it('add', async () => {

        const rickLog = {
            log: 'Rick log',
            comment: 'Super space',
            system: 'Earth 4',
            user: 'rick',
            posted: new Date(),
            type: 'info',
            id: 'rick-id',
            code: 'r'
        };

        await wait(10);
        const mortyLog = {
            log: 'Morty log',
            comment: 'Sky fly',
            system: 'Mars 8',
            user: 'morty',
            posted: new Date(),
            type: 'debug',
            id: 'morty-id',
            code: 'm'
        };

        await wait(10);
        const finnLog = {
            log: 'Finn log',
            comment: 'Forest',
            system: 'bimo',
            user: 'finn',
            posted: new Date(),
            type: 'other',
            id: 'finn-id',
            code: 'f'
        };

        await wait(10);
        const jakeLog = {
            log: 'Jake log',
            comment: 'Forest',
            system: 'bimo',
            user: 'jake',
            posted: new Date(),
            type: 'other',
            id: 'jake-id',
            code: 'j'
        };

        let res = await modelInit.add(rickLog);
        res = await modelInit.add(mortyLog);
        res = await modelInit.add(finnLog);
        res = await modelInit.add(jakeLog);

        res = await modelInit.get({});
        assert.equal(res.length, 4, 'not add');

    });

    it('get first 2', async () => {

        const filter = {
            first: 2
        };

        let res = await modelInit.get(filter);
        const rick = res[0];
        const morty = res[1];

        assert.equal(res.length, 2, 'invalid frist 2');
        assert.equal(rick.user, 'rick', 'invalid rick');
        assert.equal(morty.user, 'morty', 'invalid morty');

    });

    it('get first 2 offset 1', async () => {

        const filter = {
            first: 2,
            offset: 1
        };

        let res = await modelInit.get(filter);
        const morty = res[0];
        const finn = res[1];

        assert.equal(res.length, 2, 'invalid frist 2');
        assert.equal(morty.user, 'morty', 'invalid morty');
        assert.equal(finn.user, 'finn', 'invalid finn');

    });

    it('get last 2', async () => {

        const filter = {
            last: 2
        };

        let res = await modelInit.get(filter);
        const jake = res[0];
        const finn = res[1];

        assert.equal(res.length, 2, 'invalid last 2');
        assert.equal(jake.user, 'jake', 'invalid jake');
        assert.equal(finn.user, 'finn', 'invalid finn');

    });

    it('get last 2 offset 1', async () => {

        const filter = {
            last: 2,
            offset: 1
        };

        let res = await modelInit.get(filter);
        const finn = res[0];
        const morty = res[1];

        assert.equal(res.length, 2, 'invalid last 2 offset 1');
        assert.equal(finn.user, 'finn', 'invalid finn');
        assert.equal(morty.user, 'morty', 'invalid morty');

    });

    it('get onlyCount 4', async () => {

        const filter = {
            onlyCount: true
        };

        let res = await modelInit.get(filter);

        assert.equal(res, 4, 'invalid count 4');

    });

    it('get onlyCount 2', async () => {

        const filter = {
            filters: [{field: 'type', compare: '=', value: 'other'}],
            onlyCount: true
        };

        let res = await modelInit.get(filter);

        assert.equal(res, 2, 'invalid count 2');

    });

    it('get search oth', async () => {

        const filter = {
            search: 'oth'
        };

        let res = await modelInit.get(filter);

        const finn = res[0];
        const jake = res[1];

        assert.equal(res.length, 2, 'invalid length 2');
        assert.equal(finn.user, 'finn', 'invalid finn');
        assert.equal(jake.user, 'jake', 'invalid jake');

    });

    it('get id rick', async () => {

        const filter = {
            id: 'rick-id'
        };

        let res = await modelInit.get(filter);

        const rick = res[0];

        assert.equal(res.length, 1, 'invalid length 1');
        assert.equal(rick.user, 'rick', 'invalid rick');

    });

    it('get id rick & morty', async () => {

        const filter = {
            id: ['rick-id', 'morty-id']
        };

        let res = await modelInit.get(filter);

        const rick = res[0];
        const morty = res[1];

        assert.equal(res.length, 2, 'invalid length 2');
        assert.equal(rick.user, 'rick', 'invalid rick');
        assert.equal(morty.user, 'morty', 'invalid morty');

    });

    it('get filters finn & jake', async () => {

        const filter = {
            filters: [
                {field: 'type', compare: 'nin', value: ['debug', 'info']},
                {field: 'system', compare: '=', value: 'bimo'}
            ]
        };

        let res = await modelInit.get(filter);

        const finn = res[0];
        const jake = res[1];

        assert.equal(res.length, 2, 'invalid length 2');
        assert.equal(finn.user, 'finn', 'invalid finn');
        assert.equal(jake.user, 'jake', 'invalid jake');

    });

    it('get stream', async () => {

        let filter = {
            first: 2,
            stream: true
        };

        let resStream = await modelInit.get(filter);
        let res = await streamToLogs(resStream);

        const rick = res[0];
        const morty = res[1];

        assert.equal(res.length, 2, 'invalid length 2');
        assert.equal(rick.user, 'rick', 'invalid rick');
        assert.equal(morty.user, 'morty', 'invalid morty');

    });

    it('del finn & jake', async ()=> {

        const filter = {
            id: ['finn-id', 'jake-id']
        };

        let res = await modelInit.del(filter);
        assert.equal(res, 2, 'invalid count del 2');

        res = await modelInit.get({});
        const rick = res[0];
        const morty = res[1];

        assert.equal(res.length, 2, 'invalid length 2');
        assert.equal(rick.user, 'rick', 'invalid rick');
        assert.equal(morty.user, 'morty', 'invalid morty');

    });

    it('del all', async ()=> {

        let res = await modelInit.del({});
        assert.equal(res, 2, 'invalid count del 2');

        res = await modelInit.get({});
        assert.equal(res.length, 0, 'invalid length 0');

    });

});

function streamToLogs(streamLogs) {

    return new Promise(resolve => {

        let logs = [];
        streamLogs.on('data', chunk => logs.push(chunk));
        streamLogs.on('end', ()=> resolve(logs));

    });

}

function wait(ms = 1000) {
    return new Promise(resolve => setTimeout(() => resolve(), ms));
}