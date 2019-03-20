module.exports = {
    mongoDBConf: {
        server: 'localhost',
        port: 26000,
        db: 'jrflogs',
        collection: 'logs_test',
        user: 'jrflog',
        password: '258456'
    },
    postgreSQLConf: {
        server: 'localhost',
        port: 5432,
        db: 'jrflogs_test',
        user: 'jrflog',
        password: '258456'
    },
    fileConf: {
        name: 'jrflogs_test.txt',
        path: __dirname
    }
};