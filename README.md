# JRFLOG
**jrflog** is an async / await logging package. Logs can be output to *stdout*,
stored in *file*, *MongoDB*, or *PostgreSQL*.

## installation 
```
$ nmp -i jrflog
```

## Log
The log consists of the following fields

| Name | Type | Default value | Description |
|---|---|---|---|
|log|any|''|Log can be of any type. Always cast to string|
|comment|any|''|The comment can be of any type. Always cast to string|
|system|any|''|The system from which the log came. Can be of any type, always string|
|user|any|''|User of the system from which the log entered. Can be of any type, always string|
|posted|date|Current date time | Date the arrival time of the log. Formed automatically.|
|type|string|'other'|Log type Maybe one of: info, warning, error, debug, other|
|code|any|''|The code can be of any type. Always cast to string|
|id|string|'xxxxx-datetime'|log id Generated automatically when a log is received. It consists of 5 randomly generated characters, a separator and a log arrival date. For example: `Uw9aP-1552994380358`|

## Methods
#### constructor()
Just creates an object `const jrflog = new JRFLOG();`

#### init(options)
Initialization `await jrflog.init(options)`

**Options** - the `jrflog` setting consists of certain parameters in
depending on which logging mode is needed (stdout, file, mongoDB,
postgreSQL).

#### add(log, type)
Add log. 

| Name | Type | Default value | Description |
|---|---|---|---|
|log|any|''|Log Maybe any type. Either the object `Log` (described above)|
|type|string|'other'|Log type Maybe one of: info, warning, error, debug, other|

#### get(filter)
Get logs for a given filter. For `stdout` mode not implemented. 

* filter

  | Name | Type | Description |
  |---|---|---|
  |first|number|get the first n-logs|
  |last|number|get the latest n-logs|
  |оffset|number|skip n-logs|
  |onlyCount|boolean|if `true`, will return the number of logs|
  |search|string|returns those logs that have at least one of the fields an entry `search`|
  |id|string/array|returns the log found by id (string). will return logs found by id (array of id)|
  |filters|array of filters|an array of filters for which logs are selected, all filters are combined by logical AND|
  |stream|boolean|if `true` then the logs are returned as a stream, one `chunk` is one log. If `false` then the logs are returned as an array.|
 
* element array of filters
   
  | Name | Type | Description |
  |---|---|---|
  |field|string|the name of the field for which the condition is being set. The object field `Log` (described above)|
  |compare|string|comparison condition one of: =, <=,> =, <>, <,>, in, nin, contain|
  |value|any|the value by which the condition for the field is checked|
 
Returns an array of logs or a stream of logs.

#### del(filter)
Delete logs for a given filter. For `stdout` and` file` modes not implemented. 

* filter

  | Name | Type | Description |
  |---|---|---|
  |first|number|delete first n-logs|
  |last|number|delete the last n-logs|
  |оffset|number|skip n-logs|
  |search|string|remove those logs that have the entry `search` in at least one of the fields|
  |id|string/array|remove the log found by id (string). remove logs found by id (array of id)|
  |filters|array of filters|an array of filters for which logs are selected, all filters are combined by logical AND|
  
* element array of filters
  
  | Name | Type | Description |
  |---|---|---|
  |field|string|the name of the field for which the condition is being set. The object field `Log` (described above)|
  |compare|string|an array of filters for which logs are selected, all filters are combined by logical AND|
  |value|any|the value by which the condition for the field is checked|

Returns the number of deleted logs

## Stdout
In this mode, the incoming logs are output to the output stream.
 
 #### init options
| Name | Type | Default value | Description |
|---|---|---|---|
|typeOutput|string|'flat'|The type of log output. `flat` - output as one line. `json` - the log is displayed as formatted json|
|color|boolean|true|`true` - display the log in color. `false` - show log without color|
|separator|string|null|log field separator. Only valid in `flat` mode. If the delimiter is not specified, the log is converted to single-line json| 
  
#### Example
```js
const jrflog = new JRFLOG();
await jrflog.init();
await jrflog.info('test log');
//{"log":"\"test log\"","comment":"","system":"","user":"","posted":"2019-03-19T11:34:27.272Z","type":"info","code":"","id":"DC0Tq-1552995267272"}
await jrflog.add('test log', 'info');
//{"log":"\"test log\"","comment":"","system":"","user":"","posted":"2019-03-19T11:34:27.273Z","type":"info","code":"","id":"Qa7If-1552995267273"} 
```

```js
const jrflog = new JRFLOG();
await jrflog.init({color: true, typeOutput: 'flat', separator: '|'});
await jrflog.info('test log');
//"test log"||||Tue Mar 19 2019 14:36:12 GMT+0300 (GMT+03:00)|info||515a1-1552995372438
await jrflog.add('test log', 'info');
//"test log"||||Tue Mar 19 2019 14:36:12 GMT+0300 (GMT+03:00)|info||niNm2-1552995372439
```

```js
const jrflog = new JRFLOG();
await jrflog.init({color: true, typeOutput: 'json'});
await jrflog.info('test log');
//{
//     "log": "\"test log\"",
//     "comment": "",
//     "system": "",
//     "user": "",
//     "posted": "2019-03-19T11:38:04.009Z",
//     "type": "info",
//     "code": "",
//     "id": "OKofI-1552995484009"
// }

await jrflog.add('test log', 'info');
// {
//     "log": "\"test log\"",
//     "comment": "",
//     "system": "",
//     "user": "",
//     "posted": "2019-03-19T11:38:04.010Z",
//     "type": "info",
//     "code": "",
//     "id": "p3F6k-1552995484010"
// }
```

## File
In this mode, the incoming logs are written to the file.
 
 #### init options
| Name | Type | Default value | Description |
|---|---|---|---|
|path|string|__dirname|Path of the directory in which the log file is created|
|name|string|jrflogs.txt|Log file name and extension|
|typeOutput|string|'flat'|Type of logging to file. `flat` - write in one line. `json` - the log is written as formatted json|
|separator|string|null|log field separator. Only valid in `flat` mode. If the delimiter is not specified, the log is converted to single-line json|

#### Example 
```js
    const jrflog = new JRFLOG();
    await jrflog.init({
        type: jrflog.types.File,
        typeOutput: 'flat',
        separator: '|'
    });
    
    for (let i = 0; i < 15; i++) {
        await jrflog.add(`file ${i} log test ffffff zzzzzzzzz test test`);
    }
    
    let logs = await jrflog.get({last: 2});
    for (let log of logs) {
        console.log(log);
    }
    
    let count = await jrflog.del({
        filters: [{field: 'log', compare: 'contain', value: 'test'}]
    });
```

```js
    const jrflog = new JRFLOG();
    await jrflog.init({
        type: jrflog.types.File,
        typeOutput: 'flat',
        separator: '|'
    });
    
    for (let i = 0; i < 15; i++) {
        await jrflog.add(`file ${i} log test ffffff zzzzzzzzz test test`);
    }
    
    let logs = await jrflog.get({last: 2, stream: true});
    for (let log of logs) {
        console.log(log);
    }
    
    let body = [];
    logs.on('data', (chunk) => {
        console.log(JSON.parse(chunk));
        console.log('----------');
        body.push(JSON.parse(chunk));          
    });
    logs.on('end', async () => {
        console.log(body);
    });
    logs.on('error', async (e) => {
        console.log(e);
    });
```

## MongoDB
In this mode, the incoming logs are recorded in MongoDB
 
#### init options
| Name | Type | Default value | Description |
|---|---|---|---|
|server|string|localhost|Server name|
|port|number|27100|Server port|
|db|string|jrflogs|Database name|
|collection|string|logs|Collection name|
|user|string|''|Username|
|password|string|''|User password|

#### Example 
```js
    const jrflog = new JRFLOG();
    await jrflog.init({
        type: jrflog.types.MongoDB,
        stream: false,
        port: 26000,
        user: 'jrflog',
        password: '258456'
    });
    
    for (let i = 0; i < 15; i++) {
        await jrflog.add(`file ${i} log test ffffff zzzzzzzzz test test`);
    }
    
    let logs = await jrflog.get({last: 2});
    for (let log of logs) {
        console.log(log);
    }
    
    let count = await jrflog.del({
        filters: [{field: 'log', compare: 'contain', value: 'test'}]
    });
```

```js
    const jrflog = new JRFLOG();
    await jrflog.init({
        type: jrflog.types.MongoDB,
        stream: false,
        port: 26000,
        user: 'jrflog',
        password: '258456'
    });
    
    for (let i = 0; i < 15; i++) {
        await jrflog.add(`file ${i} log test ffffff zzzzzzzzz test test`);
    }
    
    let logs = await jrflog.get({last: 2, stream: true});
    for (let log of logs) {
        console.log(log);
    }
    
    let body = [];
    logs.on('data', (chunk) => {
        console.log(chunk);
        console.log('----------');
        body.push(chunk);
    });
    logs.on('end', async () => {
        console.log(body);      
    });
```  

## PostgreSQL
In this mode, the incoming logs are recorded in PostgreSQL
 
#### init options
| Name | Type | Default value | Description |
|---|---|---|---|
|server|string|localhost|Server name|
|port|number|27100|Server port|
|db|string|jrflogs|Database name|
|user|string|''|Username|
|password|string|''|User password|

#### Example 
```js
    const jrflog = new JRFLOG();
    await jrflog.init({
        type: jrflog.types.PosgreSQL,
        user: 'jrflog',
        password: '258456'
    });
    
    for (let i = 0; i < 15; i++) {
        await jrflog.add(`file ${i} log test ffffff zzzzzzzzz test test`);
    }
    
    let logs = await jrflog.get({last: 2});
    for (let log of logs) {
        console.log(log);
    }
    
    let count = await jrflog.del({
        filters: [{field: 'log', compare: 'contain', value: 'test'}]
    });
```

```js
    const jrflog = new JRFLOG();
    await jrflog.init({
        type: jrflog.types.PosgreSQL,
        user: 'jrflog',
        password: '258456'
    });
    
    for (let i = 0; i < 15; i++) {
        await jrflog.add(`file ${i} log test ffffff zzzzzzzzz test test`);
    }
    
    let logs = await jrflog.get({last: 2, stream: true});
    for (let log of logs) {
        console.log(log);
    }
    
    let body = [];
    logs.on('data', (chunk) => {
        console.log(chunk);
        console.log('----------');
        body.push(chunk);
    });
    logs.on('end', async () => {
        console.log(body);       
    });
```