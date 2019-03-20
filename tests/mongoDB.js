const {assert} = require('chai');
const {expect} = require('chai');
const MongoDBModel = require('../models/mongoDB');
const {mongoDBConf} = require('./testConf');

module.exports = describe('mongoDB', () => {

    let modelInit = new MongoDBModel(mongoDBConf);

    before(async () => {
        await modelInit.init();
    });

    after(async () => {
        await modelInit.del({});
        await modelInit.disconnect();
    });

    it('constructor', () => {

        const model = new MongoDBModel();
        const fields = ['log', 'comment', 'system', 'user', 'posted', 'type', 'code', 'id'];

        assert.equal(model.server, 'localhost', 'invalid server');
        assert.equal(model.port, 27100, 'invalid port');
        assert.equal(model.db, 'jrflogs', 'invalid db');
        assert.equal(model.collection, 'logs', 'invalid logs');
        assert.equal(model.user, '', 'invalid user');
        assert.equal(model.password, '', 'invalid password');
        expect(model.fields).to.eql(fields, 'invalid fields');

    });

    it('constructor with param', () => {

        const model = new MongoDBModel({
            server: 'server',
            port: 25000,
            db: 'db',
            collection: 'collection',
            user: 'user',
            password: 'password'
        });
        const fields = ['log', 'comment', 'system', 'user', 'posted', 'type', 'code', 'id'];

        assert.equal(model.server, 'server', 'invalid server');
        assert.equal(model.port, 25000, 'invalid port');
        assert.equal(model.db, 'db', 'invalid db');
        assert.equal(model.collection, 'collection', 'invalid logs');
        assert.equal(model.user, 'user', 'invalid user');
        assert.equal(model.password, 'password', 'invalid password');
        expect(model.fields).to.eql(fields, 'invalid fields');

    });

    it('init', async () => {

        const model = new MongoDBModel(mongoDBConf);
        let res = false;

        try {
            await model.init();
            res = true;
            await model.disconnect();
        } catch (e) {
            res = false;
        }

        assert.isTrue(res, 'invalid init');

    });

    it('getConnectStr is valid', async () => {

        const mongoDB = new MongoDBModel({
            server: '127.0.0.1',
            port: 26000,
            db: 'jrflogs_test',
            collection: 'logs',
            user: 'jrflog',
            password: '123456'
        });
        const strCon = await mongoDB.getConnectStr();
        const validStr = 'mongodb://jrflog:123456@127.0.0.1:26000/jrflogs_test';

        assert.equal(strCon, validStr);
    });

    it('_generateFindBySearch', async () => {

        const model = new MongoDBModel(mongoDBConf);
        const search = 'search';
        const validRes = {
            '$or':
                [{log: {'$regex': 'search'}},
                    {comment: {'$regex': 'search'}},
                    {system: {'$regex': 'search'}},
                    {user: {'$regex': 'search'}},
                    {posted: {'$regex': 'search'}},
                    {type: {'$regex': 'search'}},
                    {code: {'$regex': 'search'}},
                    {id: {'$regex': 'search'}}]
        };

        let res = await model._generateFindBySearch(search);

        expect(res).to.eql(validRes, 'invalid _generateFindBySearch');

    });

    it('_generateFilterEl compare = ', async () => {

        const model = new MongoDBModel(mongoDBConf);
        const filter = {field: 'log', compare: '=', value: 'rick'};
        const validRes = {
            log: {$eq: 'rick'}
        };

        let res = await model._generateFilterEl(filter);

        expect(res).to.eql(validRes, 'invalid compare =');

    });

    it('_generateFilterEl compare <= ', async () => {

        const model = new MongoDBModel(mongoDBConf);
        const filter = {field: 'log', compare: '<=', value: 'rick'};
        const validRes = {
            log: {$lte: 'rick'}
        };

        let res = await model._generateFilterEl(filter);

        expect(res).to.eql(validRes, 'invalid compare <=');

    });

    it('_generateFilterEl compare >= ', async () => {

        const model = new MongoDBModel(mongoDBConf);
        const filter = {field: 'log', compare: '>=', value: 'rick'};
        const validRes = {
            log: {$gte: 'rick'}
        };

        let res = await model._generateFilterEl(filter);

        expect(res).to.eql(validRes, 'invalid compare >=');

    });

    it('_generateFilterEl compare <> ', async () => {

        const model = new MongoDBModel(mongoDBConf);
        const filter = {field: 'log', compare: '<>', value: 'rick'};
        const validRes = {
            log: {$ne: 'rick'}
        };

        let res = await model._generateFilterEl(filter);

        expect(res).to.eql(validRes, 'invalid compare <>');

    });

    it('_generateFilterEl compare < ', async () => {

        const model = new MongoDBModel(mongoDBConf);
        const filter = {field: 'log', compare: '<', value: 'rick'};
        const validRes = {
            log: {$lt: 'rick'}
        };

        let res = await model._generateFilterEl(filter);

        expect(res).to.eql(validRes, 'invalid compare <');

    });

    it('_generateFilterEl compare > ', async () => {

        const model = new MongoDBModel(mongoDBConf);
        const filter = {field: 'log', compare: '>', value: 'rick'};
        const validRes = {
            log: {$gt: 'rick'}
        };

        let res = await model._generateFilterEl(filter);

        expect(res).to.eql(validRes, 'invalid compare >');

    });

    it('_generateFilterEl compare in ', async () => {

        const model = new MongoDBModel(mongoDBConf);
        const filter = {field: 'log', compare: 'in', value: ['rick', 'morty']};
        const validRes = {
            log: {$in: ['rick', 'morty']}
        };

        let res = await model._generateFilterEl(filter);

        expect(res).to.eql(validRes, 'invalid compare in');

    });

    it('_generateFilterEl compare nin ', async () => {

        const model = new MongoDBModel(mongoDBConf);
        const filter = {field: 'log', compare: 'nin', value: ['rick', 'morty']};
        const validRes = {
            log: {$nin: ['rick', 'morty']}
        };

        let res = await model._generateFilterEl(filter);

        expect(res).to.eql(validRes, 'invalid compare nin');

    });

    it('_generateFilterEl compare contain ', async () => {

        const model = new MongoDBModel(mongoDBConf);
        const filter = {field: 'log', compare: 'contain', value: 'rick'};
        const validRes = {
            log: {$regex: 'rick'}
        };

        let res = await model._generateFilterEl(filter);

        expect(res).to.eql(validRes, 'invalid compare contain');

    });

    it('_generateFindByFilters', async () => {

        const model = new MongoDBModel(mongoDBConf);
        const filters = [
            {field: 'log', compare: 'nin', value: ['rick', 'morty']},
            {field: 'log', compare: '<', value: 'rick'}
        ];
        const validRes = {
            '$and':
                [{log: {'$nin': ['rick', 'morty']}},
                    {log: {'$lt': 'rick'}}]
        };

        let res = await model._generateFindByFilters(filters);

        expect(res).to.eql(validRes, 'invalid _generateFindByFilters');

    });

    it('_generateFindById id string', async () => {

        const model = new MongoDBModel(mongoDBConf);
        const id = 'rick';
        const validRes = {id: 'rick'};

        let res = await model._generateFindById(id);

        expect(res).to.eql(validRes, 'invalid id string');

    });

    it('_generateFindById id string exclude', async () => {

        const model = new MongoDBModel(mongoDBConf);
        const id = 'rick';
        const exclude = true;
        const validRes = {id: {$ne: 'rick'}};

        let res = await model._generateFindById(id, exclude);

        expect(res).to.eql(validRes, 'invalid id string exclude');

    });

    it('_generateFindById id array', async () => {

        const model = new MongoDBModel(mongoDBConf);
        const id = ['rick', 'morty'];
        const exclude = false;
        const validRes = {id: {$in: ['rick', 'morty']}};

        let res = await model._generateFindById(id, exclude);

        expect(res).to.eql(validRes, 'invalid id array');

    });

    it('_generateFindById id array exclude', async () => {

        const model = new MongoDBModel(mongoDBConf);
        const id = ['rick', 'morty'];
        const exclude = true;
        const validRes = {id: {$nin: ['rick', 'morty']}};

        let res = await model._generateFindById(id, exclude);

        expect(res).to.eql(validRes, 'invalid id array exclude');

    });

    it('_generateFind filter id', async () => {

        const model = new MongoDBModel(mongoDBConf);
        const filter = {id: ['rick', 'morty'], exclude: true};
        const validRes = {id: {$nin: ['rick', 'morty']}};

        let res = await model._generateFind(filter);

        expect(res).to.eql(validRes, 'invalid filter id');

    });

    it('_generateFind filter filters', async () => {

        const model = new MongoDBModel(mongoDBConf);
        const filter = {
            filters: [
                {field: 'log', compare: 'nin', value: ['rick', 'morty']},
                {field: 'log', compare: '<', value: 'rick'}
            ]
        };
        const validRes = {
            '$and':
                [{log: {'$nin': ['rick', 'morty']}},
                    {log: {'$lt': 'rick'}}]
        };

        let res = await model._generateFind(filter);

        expect(res).to.eql(validRes, 'invalid filter filters');

    });

    it('_generateFind filter search', async () => {

        const model = new MongoDBModel(mongoDBConf);
        const filter = {search: 'search'};
        const validRes = {
            '$or':
                [{log: {'$regex': 'search'}},
                    {comment: {'$regex': 'search'}},
                    {system: {'$regex': 'search'}},
                    {user: {'$regex': 'search'}},
                    {posted: {'$regex': 'search'}},
                    {type: {'$regex': 'search'}},
                    {code: {'$regex': 'search'}},
                    {id: {'$regex': 'search'}}]
        };

        let res = await model._generateFind(filter);

        expect(res).to.eql(validRes, 'invalid filter search');

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