const {assert} = require('chai');
const {expect} = require('chai');
const FileModel = require('../models/file');
const {fileConf} = require('./testConf');
const fs = require('fs');
const fsPromises = fs.promises;
const os = require('os');

module.exports = describe('file', () => {

    const pathTestFile = `${fileConf.path}/${fileConf.name}`;
    let notClear = false;

    afterEach(async () => {
        if (notClear) {
            return;
        } else {
            await clearLogs(pathTestFile);
        }
    });

    it('constructor', () => {

        const model = new FileModel();
        const typesOutput = {
            FLAT: 'flat',
            JSON: 'json'
        };
        let path = __dirname.toString().replace('tests', 'models/file');
        if (os.type() === 'Windows_NT') {
            path = __dirname.toString().replace('tests', 'models\\file');
        }

        assert.equal(model.path, path, 'invalid path');
        assert.equal(model.name, 'jrflogs.txt', 'invalid name');
        assert.isNull(model.separator, 'invalid separator');
        expect(model.typesOutput).to.eql(typesOutput, 'invalid typesOutput');
        assert.equal(model.typeOutput, typesOutput.FLAT);

    });

    it('init', async () => {

        const model = new FileModel();
        await model.init({
            path: 'path',
            name: 'name',
            separator: '|',
            typeOutput: 'json'
        });

        assert.equal(model.path, 'path', 'invalid path');
        assert.equal(model.name, 'name', 'invalid name');
        assert.equal(model.separator, '|', 'invalid separator');
        assert.equal(model.typeOutput, 'json');

    });

    it('_createFlatWithSeparator', async () => {

        const model = new FileModel();
        await model.init({separator: '|'});
        const rickLog = {
            log: 'Rick log',
            comment: 'Super space',
            system: 'Earth 4',
            user: 'rick',
            posted: 'posted',
            type: 'info',
            id: 'rick-id',
            code: 'r'
        };
        const validRes = 'Rick log|Super space|Earth 4|rick|posted|info|r|rick-id';

        let res = await model._createFlatWithSeparator(rickLog);

        assert.equal(res, validRes, 'invalid res');

    });

    it('_outputFlat with separator', async () => {

        const model = new FileModel();
        let conf = {...fileConf};
        conf.separator = '@';
        await model.init(conf);
        const rickLog = {
            log: 'Rick log',
            comment: 'Super space',
            system: 'Earth 4',
            user: 'rick',
            posted: 'posted',
            type: 'info',
            id: 'rick-id',
            code: 'r'
        };
        const validRes = 'Rick log@Super space@Earth 4@rick@posted@info@r@rick-id';

        await model._outputFlat(rickLog);
        let arrLogs = await readLogs(pathTestFile);
        let log = arrLogs[0];

        assert.equal(arrLogs.length, 2, 'invalid lines count');
        assert.equal(log, validRes, 'invalid line log');

    });

    it('_outputFlat without separator', async () => {

        const model = new FileModel();
        let conf = {...fileConf};
        await model.init(conf);
        const rickLog = {
            log: 'Rick log',
            comment: 'Super space',
            system: 'Earth 4',
            user: 'rick',
            posted: 'posted',
            type: 'info',
            id: 'rick-id',
            code: 'r'
        };
        const validRes = '{"log":"Rick log","comment":"Super space","system":"Earth 4","user":"rick","posted":"posted","type":"info","id":"rick-id","code":"r"}';

        await model._outputFlat(rickLog);
        let arrLogs = await readLogs(pathTestFile);
        let log = arrLogs[0];

        assert.equal(arrLogs.length, 2, 'invalid lines count');
        assert.equal(log, validRes, 'invalid line log');

    });

    it('_outputJSON', async () => {

        const model = new FileModel();
        let conf = {...fileConf};
        await model.init(conf);
        const rickLog = {
            log: 'Rick log',
            comment: 'Super space',
            system: 'Earth 4',
            user: 'rick',
            posted: 'posted',
            type: 'info',
            id: 'rick-id',
            code: 'r'
        };
        const validRes = '{\n    "log": "Rick log",\n    "comment": "Super space",\n    "system": "Earth 4",\n    "user": "rick",\n    "posted": "posted",\n    "type": "info",\n    "id": "rick-id",\n    "code": "r"\n}';

        await model._outputJSON(rickLog);
        let arrLogs = await readLogs(pathTestFile);
        let log = arrLogs[0];

        assert.equal(arrLogs.length, 2, 'invalid lines count');
        assert.equal(log, validRes, 'invalid line log');

    });

    it('_getSeparatorOfLogs', async () => {

        const model = new FileModel();
        await model.init();

        let res = await model._getSeparatorOfLogs();

        assert.equal(res, '\r\n', 'invalid separator');

    });

    it('_getSeparatorOfLogs flat', async () => {

        const model = new FileModel();
        await model.init({typeOutput: 'flat'});

        let res = await model._getSeparatorOfLogs();

        assert.equal(res, '\r\n', 'invalid separator');

    });

    it('_getSeparatorOfLogs json', async () => {

        const model = new FileModel();
        await model.init({typeOutput: 'json'});

        let res = await model._getSeparatorOfLogs();

        assert.equal(res, '}\r\n{', 'invalid separator');

    });

    it('del', async () => {

        const model = new FileModel();
        let conf = {...fileConf};
        await model.init(conf);

        let res = await model.del();

        assert.equal(res, 0, 'invalid count');

    });

    it('add flat', async () => {

        const modelInit = new FileModel();
        let conf = {...fileConf};
        conf.typeOutput = modelInit.typesOutput.FLAT;
        await modelInit.init(conf);
        const resValid = [];

        const rickLog = {
            log: 'Rick log',
            comment: 'Super space',
            system: 'Earth 4',
            user: 'rick',
            posted: new Date().toString(),
            type: 'info',
            id: 'rick-id',
            code: 'r'
        };
        resValid.push(rickLog);

        await wait(10);
        const mortyLog = {
            log: 'Morty log',
            comment: 'Sky fly',
            system: 'Mars 8',
            user: 'morty',
            posted: new Date().toString(),
            type: 'debug',
            id: 'morty-id',
            code: 'm'
        };
        resValid.push(mortyLog);

        await wait(10);
        const finnLog = {
            log: 'Finn log',
            comment: 'Forest',
            system: 'bimo',
            user: 'finn',
            posted: new Date().toString(),
            type: 'other',
            id: 'finn-id',
            code: 'f'
        };
        resValid.push(finnLog);

        await wait(10);
        const jakeLog = {
            log: 'Jake log',
            comment: 'Forest',
            system: 'bimo',
            user: 'jake',
            posted: new Date().toString(),
            type: 'other',
            id: 'jake-id',
            code: 'j'
        };
        resValid.push(jakeLog);

        let res = await modelInit.add(rickLog);
        res = await modelInit.add(mortyLog);
        res = await modelInit.add(finnLog);
        res = await modelInit.add(jakeLog);

        res = await modelInit.get({});

        assert.equal(res.length, 4, 'not add');
        expect(res).to.eql(resValid, 'invalid res');

        notClear = true;

    });

    it('get flat first 2 offset 1', async () => {

        const modelInit = new FileModel();
        let conf = {...fileConf};
        conf.typeOutput = modelInit.typesOutput.FLAT;
        await modelInit.init(conf);

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

    it('get flat last 2', async () => {

        const modelInit = new FileModel();
        let conf = {...fileConf};
        conf.typeOutput = modelInit.typesOutput.FLAT;
        await modelInit.init(conf);

        const filter = {
            last: 2
        };

        let res = await modelInit.get(filter);
        const finn = res[0];
        const jake = res[1];

        assert.equal(res.length, 2, 'invalid last 2');
        assert.equal(finn.user, 'finn', 'invalid finn');
        assert.equal(jake.user, 'jake', 'invalid jake');

    });

    it('get flat last 2 offset 1', async () => {

        const modelInit = new FileModel();
        let conf = {...fileConf};
        conf.typeOutput = modelInit.typesOutput.FLAT;
        await modelInit.init(conf);

        const filter = {
            last: 2,
            offset: 1
        };

        let res = await modelInit.get(filter);
        const morty = res[0];
        const finn = res[1];

        assert.equal(res.length, 2, 'invalid last 2 offset 1');
        assert.equal(morty.user, 'morty', 'invalid morty');
        assert.equal(finn.user, 'finn', 'invalid finn');

    });

    it('get flat onlyCount 4', async () => {

        const modelInit = new FileModel();
        let conf = {...fileConf};
        conf.typeOutput = modelInit.typesOutput.FLAT;
        await modelInit.init(conf);

        const filter = {
            onlyCount: true
        };

        let res = await modelInit.get(filter);

        assert.equal(res, 4, 'invalid count 4');

    });

    it('get flat onlyCount 2', async () => {

        const modelInit = new FileModel();
        let conf = {...fileConf};
        conf.typeOutput = modelInit.typesOutput.FLAT;
        await modelInit.init(conf);

        const filter = {
            filters: [{field: 'type', compare: '=', value: 'other'}],
            onlyCount: true
        };

        let res = await modelInit.get(filter);

        assert.equal(res, 2, 'invalid count 2');

    });

    it('get flat search oth', async () => {

        const modelInit = new FileModel();
        let conf = {...fileConf};
        conf.typeOutput = modelInit.typesOutput.FLAT;
        await modelInit.init(conf);

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

    it('get flat id rick', async () => {

        const modelInit = new FileModel();
        let conf = {...fileConf};
        conf.typeOutput = modelInit.typesOutput.FLAT;
        await modelInit.init(conf);

        const filter = {
            id: 'rick-id'
        };

        let res = await modelInit.get(filter);

        const rick = res[0];

        assert.equal(res.length, 1, 'invalid length 1');
        assert.equal(rick.user, 'rick', 'invalid rick');

    });

    it('get flat id rick & morty', async () => {

        const modelInit = new FileModel();
        let conf = {...fileConf};
        conf.typeOutput = modelInit.typesOutput.FLAT;
        await modelInit.init(conf);

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

    it('get flat filters finn & jake', async () => {

        const modelInit = new FileModel();
        let conf = {...fileConf};
        conf.typeOutput = modelInit.typesOutput.FLAT;
        await modelInit.init(conf);

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

    it('get flat stream', async () => {

        const modelInit = new FileModel();
        let conf = {...fileConf};
        conf.typeOutput = modelInit.typesOutput.FLAT;
        await modelInit.init(conf);

        let filter = {
            first: 2,
            stream: true
        };

        let resStream = await modelInit.get(filter);
        let res = await streamToLogs(resStream);

        const rick = JSON.parse(res[0]);
        const morty = JSON.parse(res[1]);

        assert.equal(res.length, 2, 'invalid length 2');
        assert.equal(rick.user, 'rick', 'invalid rick');
        assert.equal(morty.user, 'morty', 'invalid morty');

        notClear = false;

    });

    it('add flat with separator', async () => {

        const modelInit = new FileModel();
        let conf = {...fileConf};
        conf.typeOutput = modelInit.typesOutput.FLAT;
        conf.separator = '#';
        await modelInit.init(conf);
        const resValid = [];

        const rickLog = {
            log: 'Rick log',
            comment: 'Super space',
            system: 'Earth 4',
            user: 'rick',
            posted: new Date().toString(),
            type: 'info',
            id: 'rick-id',
            code: 'r'
        };
        resValid.push(rickLog);

        await wait(10);
        const mortyLog = {
            log: 'Morty log',
            comment: 'Sky fly',
            system: 'Mars 8',
            user: 'morty',
            posted: new Date().toString(),
            type: 'debug',
            id: 'morty-id',
            code: 'm'
        };
        resValid.push(mortyLog);

        await wait(10);
        const finnLog = {
            log: 'Finn log',
            comment: 'Forest',
            system: 'bimo',
            user: 'finn',
            posted: new Date().toString(),
            type: 'other',
            id: 'finn-id',
            code: 'f'
        };
        resValid.push(finnLog);

        await wait(10);
        const jakeLog = {
            log: 'Jake log',
            comment: 'Forest',
            system: 'bimo',
            user: 'jake',
            posted: new Date().toString(),
            type: 'other',
            id: 'jake-id',
            code: 'j'
        };
        resValid.push(jakeLog);

        let res = await modelInit.add(rickLog);
        res = await modelInit.add(mortyLog);
        res = await modelInit.add(finnLog);
        res = await modelInit.add(jakeLog);

        res = await modelInit.get({});

        assert.equal(res.length, 4, 'not add');
        expect(res).to.eql(resValid, 'invalid res');

        notClear = true;

    });

    it('get flat with separator first 2 offset 1', async () => {

        const modelInit = new FileModel();
        let conf = {...fileConf};
        conf.typeOutput = modelInit.typesOutput.FLAT;
        conf.separator = '#';
        await modelInit.init(conf);

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

    it('get flat with separator last 2', async () => {

        const modelInit = new FileModel();
        let conf = {...fileConf};
        conf.separator = '#';
        conf.typeOutput = modelInit.typesOutput.FLAT;
        await modelInit.init(conf);

        const filter = {
            last: 2
        };

        let res = await modelInit.get(filter);
        const finn = res[0];
        const jake = res[1];

        assert.equal(res.length, 2, 'invalid last 2');
        assert.equal(finn.user, 'finn', 'invalid finn');
        assert.equal(jake.user, 'jake', 'invalid jake');

    });

    it('get flat with separator last 2 offset 1', async () => {

        const modelInit = new FileModel();
        let conf = {...fileConf};
        conf.separator = '#';
        conf.typeOutput = modelInit.typesOutput.FLAT;
        await modelInit.init(conf);

        const filter = {
            last: 2,
            offset: 1
        };

        let res = await modelInit.get(filter);
        const morty = res[0];
        const finn = res[1];

        assert.equal(res.length, 2, 'invalid last 2 offset 1');
        assert.equal(morty.user, 'morty', 'invalid morty');
        assert.equal(finn.user, 'finn', 'invalid finn');

    });

    it('get flat with separator onlyCount 4', async () => {

        const modelInit = new FileModel();
        let conf = {...fileConf};
        conf.separator = '#';
        conf.typeOutput = modelInit.typesOutput.FLAT;
        await modelInit.init(conf);

        const filter = {
            onlyCount: true
        };

        let res = await modelInit.get(filter);

        assert.equal(res, 4, 'invalid count 4');

    });

    it('get flat with separator onlyCount 2', async () => {

        const modelInit = new FileModel();
        let conf = {...fileConf};
        conf.separator = '#';
        conf.typeOutput = modelInit.typesOutput.FLAT;
        await modelInit.init(conf);

        const filter = {
            filters: [{field: 'type', compare: '=', value: 'other'}],
            onlyCount: true
        };

        let res = await modelInit.get(filter);

        assert.equal(res, 2, 'invalid count 2');

    });

    it('get flat with separator search oth', async () => {

        const modelInit = new FileModel();
        let conf = {...fileConf};
        conf.separator = '#';
        conf.typeOutput = modelInit.typesOutput.FLAT;
        await modelInit.init(conf);

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

    it('get flat with separator id rick', async () => {

        const modelInit = new FileModel();
        let conf = {...fileConf};
        conf.separator = '#';
        conf.typeOutput = modelInit.typesOutput.FLAT;
        await modelInit.init(conf);

        const filter = {
            id: 'rick-id'
        };

        let res = await modelInit.get(filter);

        const rick = res[0];

        assert.equal(res.length, 1, 'invalid length 1');
        assert.equal(rick.user, 'rick', 'invalid rick');

    });

    it('get flat with separator id rick & morty', async () => {

        const modelInit = new FileModel();
        let conf = {...fileConf};
        conf.separator = '#';
        conf.typeOutput = modelInit.typesOutput.FLAT;
        await modelInit.init(conf);

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

    it('get flat with separator filters finn & jake', async () => {

        const modelInit = new FileModel();
        let conf = {...fileConf};
        conf.separator = '#';
        conf.typeOutput = modelInit.typesOutput.FLAT;
        await modelInit.init(conf);

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

    it('get flat with separator stream', async () => {

        const modelInit = new FileModel();
        let conf = {...fileConf};
        conf.separator = '#';
        conf.typeOutput = modelInit.typesOutput.FLAT;
        await modelInit.init(conf);

        let filter = {
            first: 2,
            stream: true
        };

        let resStream = await modelInit.get(filter);
        let res = await streamToLogs(resStream);

        const rick = JSON.parse(res[0]);
        const morty = JSON.parse(res[1]);

        assert.equal(res.length, 2, 'invalid length 2');
        assert.equal(rick.user, 'rick', 'invalid rick');
        assert.equal(morty.user, 'morty', 'invalid morty');

        notClear = false;

    });




    it('add json', async () => {

        const modelInit = new FileModel();
        let conf = {...fileConf};
        conf.typeOutput = modelInit.typesOutput.JSON;
        await modelInit.init(conf);
        const resValid = [];

        const rickLog = {
            log: 'Rick log',
            comment: 'Super space',
            system: 'Earth 4',
            user: 'rick',
            posted: new Date().toString(),
            type: 'info',
            id: 'rick-id',
            code: 'r'
        };
        resValid.push(rickLog);

        await wait(10);
        const mortyLog = {
            log: 'Morty log',
            comment: 'Sky fly',
            system: 'Mars 8',
            user: 'morty',
            posted: new Date().toString(),
            type: 'debug',
            id: 'morty-id',
            code: 'm'
        };
        resValid.push(mortyLog);

        await wait(10);
        const finnLog = {
            log: 'Finn log',
            comment: 'Forest',
            system: 'bimo',
            user: 'finn',
            posted: new Date().toString(),
            type: 'other',
            id: 'finn-id',
            code: 'f'
        };
        resValid.push(finnLog);

        await wait(10);
        const jakeLog = {
            log: 'Jake log',
            comment: 'Forest',
            system: 'bimo',
            user: 'jake',
            posted: new Date().toString(),
            type: 'other',
            id: 'jake-id',
            code: 'j'
        };
        resValid.push(jakeLog);

        let res = await modelInit.add(rickLog);
        res = await modelInit.add(mortyLog);
        res = await modelInit.add(finnLog);
        res = await modelInit.add(jakeLog);

        res = await modelInit.get({});

        assert.equal(res.length, 4, 'not add');
        expect(res).to.eql(resValid, 'invalid res');

        notClear = true;

    });

    it('get json first 2 offset 1', async () => {

        const modelInit = new FileModel();
        let conf = {...fileConf};
        conf.typeOutput = modelInit.typesOutput.JSON;
        await modelInit.init(conf);

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

    it('get json last 2', async () => {

        const modelInit = new FileModel();
        let conf = {...fileConf};
        conf.typeOutput = modelInit.typesOutput.JSON;
        await modelInit.init(conf);

        const filter = {
            last: 2
        };

        let res = await modelInit.get(filter);
        const finn = res[0];
        const jake = res[1];

        assert.equal(res.length, 2, 'invalid last 2');
        assert.equal(finn.user, 'finn', 'invalid finn');
        assert.equal(jake.user, 'jake', 'invalid jake');

    });

    it('get json last 2 offset 1', async () => {

        const modelInit = new FileModel();
        let conf = {...fileConf};
        conf.typeOutput = modelInit.typesOutput.JSON;
        await modelInit.init(conf);

        const filter = {
            last: 2,
            offset: 1
        };

        let res = await modelInit.get(filter);
        const morty = res[0];
        const finn = res[1];

        assert.equal(res.length, 2, 'invalid last 2 offset 1');
        assert.equal(morty.user, 'morty', 'invalid morty');
        assert.equal(finn.user, 'finn', 'invalid finn');

    });

    it('get json onlyCount 4', async () => {

        const modelInit = new FileModel();
        let conf = {...fileConf};
        conf.typeOutput = modelInit.typesOutput.JSON;
        await modelInit.init(conf);

        const filter = {
            onlyCount: true
        };

        let res = await modelInit.get(filter);

        assert.equal(res, 4, 'invalid count 4');

    });

    it('get json onlyCount 2', async () => {

        const modelInit = new FileModel();
        let conf = {...fileConf};
        conf.typeOutput = modelInit.typesOutput.JSON;
        await modelInit.init(conf);

        const filter = {
            filters: [{field: 'type', compare: '=', value: 'other'}],
            onlyCount: true
        };

        let res = await modelInit.get(filter);

        assert.equal(res, 2, 'invalid count 2');

    });

    it('get json search oth', async () => {

        const modelInit = new FileModel();
        let conf = {...fileConf};
        conf.typeOutput = modelInit.typesOutput.JSON;
        await modelInit.init(conf);

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

    it('get json id rick', async () => {

        const modelInit = new FileModel();
        let conf = {...fileConf};
        conf.typeOutput = modelInit.typesOutput.JSON;
        await modelInit.init(conf);

        const filter = {
            id: 'rick-id'
        };

        let res = await modelInit.get(filter);

        const rick = res[0];

        assert.equal(res.length, 1, 'invalid length 1');
        assert.equal(rick.user, 'rick', 'invalid rick');

    });

    it('get json id rick & morty', async () => {

        const modelInit = new FileModel();
        let conf = {...fileConf};
        conf.typeOutput = modelInit.typesOutput.JSON;
        await modelInit.init(conf);

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

    it('get json filters finn & jake', async () => {

        const modelInit = new FileModel();
        let conf = {...fileConf};
        conf.typeOutput = modelInit.typesOutput.JSON;
        await modelInit.init(conf);

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

    it('get json stream', async () => {

        const modelInit = new FileModel();
        let conf = {...fileConf};
        conf.typeOutput = modelInit.typesOutput.JSON;
        await modelInit.init(conf);

        let filter = {
            first: 2,
            stream: true
        };

        let resStream = await modelInit.get(filter);
        let res = await streamToLogs(resStream);

        const rick = JSON.parse(res[0]);
        const morty = JSON.parse(res[1]);

        assert.equal(res.length, 2, 'invalid length 2');
        assert.equal(rick.user, 'rick', 'invalid rick');
        assert.equal(morty.user, 'morty', 'invalid morty');

        notClear = false;

    });


});

async function readLogs(path) {
    // return new Promise(resolve => {
    //     fs.readFile(path, (err, data) => {
    //         let logs = data.toString().split('\r\n');
    //         resolve(logs);
    //     });
    // });
    const logs = await fsPromises.readFile(path);
    return logs.toString().split('\r\n');
}

async function clearLogs(path) {
    // return new Promise(resolve => {
    //     fs.writeFile(path, '', () => {
    //         resolve();
    //     });
    // });
    await fsPromises.writeFile(path, '');
}

function streamToLogs(streamLogs) {

    return new Promise(resolve => {

        let logs = [];
        streamLogs.on('data', chunk => logs.push(chunk));
        streamLogs.on('end', () => resolve(logs));

    });

}

function wait(ms = 1000) {
    return new Promise(resolve => setTimeout(() => resolve(), ms));
}