const {assert} = require('chai');
const {expect} = require('chai');
const StdoutModel = require('../models/stdout');

module.exports = describe('stdout model', () => {
    it('constructor', () => {

        let model = new StdoutModel();

        let colors = {
            info: '\x1b[34m',
            warning: '\x1b[33m',
            error: '\x1b[31m',
            debug: '\x1b[36m',
            other: '\x1b[0m'
        };

        let typesOutput = {
            FLAT: 'flat',
            JSON: 'json'
        };

        expect(model._colors).to.eql(colors, 'invalid _colors');
        expect(model.typesOutput).to.eql(typesOutput, 'invalid typesOutput');
        assert.isTrue(model.color, 'invalid color');
        assert.equal(model.typeOutput, typesOutput.FLAT, 'invalid typeOutput');
        assert.isNull(model.separator, 'invalid separator');

    });

    it('init default param', async () => {

        let model = new StdoutModel();
        await model.init();

        let colors = {
            info: '\x1b[34m',
            warning: '\x1b[33m',
            error: '\x1b[31m',
            debug: '\x1b[36m',
            other: '\x1b[0m'
        };

        let typesOutput = {
            FLAT: 'flat',
            JSON: 'json'
        };

        expect(model._colors).to.eql(colors, 'invalid _colors');
        expect(model.typesOutput).to.eql(typesOutput, 'invalid typesOutput');
        assert.isTrue(model.color, 'invalid color');
        assert.equal(model.typeOutput, typesOutput.FLAT, 'invalid typeOutput');
        assert.isNull(model.separator, 'invalid separator');

    });

    it('init set param', async () => {

        let model = new StdoutModel();
        await model.init({typeOutput: 'json', color: false, separator: '|'});

        let colors = {
            info: '\x1b[34m',
            warning: '\x1b[33m',
            error: '\x1b[31m',
            debug: '\x1b[36m',
            other: '\x1b[0m'
        };

        let typesOutput = {
            FLAT: 'flat',
            JSON: 'json'
        };

        expect(model._colors).to.eql(colors, 'invalid _colors');
        expect(model.typesOutput).to.eql(typesOutput, 'invalid typesOutput');
        assert.isFalse(model.color, 'invalid color');
        assert.equal(model.typeOutput, typesOutput.JSON, 'invalid typeOutput');
        assert.equal(model.separator, '|', 'invalid separator');

    });

    it('_createFlatWithSeparator', async () => {

        let model = new StdoutModel();
        await model.init({separator: '|'});
        let log = {
            log: 'log',
            comment: 'comment',
            system: 'system',
            user: 'user',
            posted: 'posted',
            type: 'type',
            code: 'code',
            id: 'id'
        };

        let strLog = await model._createFlatWithSeparator(log);
        let validLog = 'log|comment|system|user|posted|type|code|id';

        assert.equal(strLog, validLog, 'invalid _createFlatWithSeparator');

    });

});