# JRFLOG
**jrflog** это async/await пакет логирования. Логи можно выводить в *stdout*, 
хранить в *файле*, в *MongoDB*, или в *PostgreSQL*.  

## installation 
```
$ nmp -i jrflog
```

## Log
Лог состоит из следующих полей

| Name | Type | Default value | Description |
|---|---|---|---|
|log|any|''|Лог может быть любого типа. Всегда приводится к строке|
|comment|any|''|Комментарий может быть любого типа. Всегда приводится к строке|
|system|any|''|Система из которой поступил лог. Может быть любого типа, всегда приводится к строке|
|user|any|''|Пользователь системы из которой поступил лог. Может быть любого типа, всегда приводится к строке|
|posted|date|Текущая дата время|Дата время поступления лога. Формируется автоматически.|
|type|string|'other'|Тип лога. Может быть один из: info, warning, error, debug, other|
|code|any|''|Код может быть любого типа. Всегда приводится к строке|
|id|string|'xxxxx-датавремя'|id лога. Генерируется автоматически при поступлении лога. Состоит из 5 случайно сгенерированных символов, разделителя и даты поступления лога. Например: `Uw9aP-1552994380358`|

## Methods
#### constructor()
Просто создает объект `const jrflog = new JRFLOG();`

#### init(options)
Инициализация `await jrflog.init(options)`

**Options** - настройка `jrflog` состоит из определенных параметров в 
зависимости от того какой режим логирования необходим (stdout, file, mongoDB,
postgreSQL). 

#### add(log, type)
Добавить лог. 

| Name | Type | Default value | Description |
|---|---|---|---|
|log|any|''|Лог. Может быть любого типа. Либо объектом `Log` (описан выше)|
|type|string|'other'|Тип лога. Может быть один из: info, warning, error, debug, other|

#### get(filter)
Получить логи по заданному фильтру. Для режима `stdout` не реализован. 

* filter

  | Name | Type | Description |
  |---|---|---|
  |first|number|получить первые n-логов|
  |last|number|получить последние n-логов|
  |оffset|number|пропустить n-логов|
  |onlyCount|boolean|если `true`, то вернет количество логов|
  |search|string|вернет те логи, у которых хотябы в одном из полей есть вхождение `search`|
  |id|string/array|вернет лог найденный по id (string). вернет логи найденные по массиву id (array of id)|
  |filters|array of filters|массив фильтров по которым отбираются логи, все фильтры объединяются логическим AND|
  |stream|boolean|если `true` то логи возвращаются в виде потока, один `chunk` - один лог. Если `false` то логи возвращаются в виде массива. |
  
* element array of filters
  
  | Name | Type | Description |
  |---|---|---|
  |field|string|имя поля для которого устанавливается условие. Поле объекта `Log` (описан выше)|
  |compare|string|условие сравнения одно из: =, <=, >=, <>, <, >, in, nin, contain|
  |value|any|значение по которому  проверяется условие для поля|

Вернет массив логов или поток логов.

#### del(filter)
Удалить логи по заданному фильтру. Для режимов `stdout` и `file` не реализован. 

* filter

  | Name | Type | Description |
  |---|---|---|
  |first|number|удалить первые n-логов|
  |last|number|удалить последние n-логов|
  |оffset|number|пропустить n-логов|
  |search|string|удалит те логи, у которых хотябы в одном из полей есть вхождение `search`|
  |id|string/array|удалит лог найденный по id (string). удалит логи найденные по массиву id (array of id)|
  |filters|array of filters|массив фильтров по которым отбираются логи, все фильтры объединяются логическим AND|
  
* element array of filters
  
  | Name | Type | Description |
  |---|---|---|
  |field|string|имя поля для которого устанавливается условие. Поле объекта `Log` (описан выше)|
  |compare|string|условие сравнения одно из: =, <=, >=, <>, <, >, in, nin, contain|
  |value|any|значение по которому  проверяется условие для поля|

Вернет количество удаленных логов

## Stdout
В данном режиме поступившие логи выводятся в поток вывода
 
 #### init options
| Name | Type | Default value | Description |
|---|---|---|---|
|typeOutput|string|'flat'|Тип вывода логов. `flat` - выводить одной строкой. `json` - лог выводится в виде форматированого json|
|color|boolean|true|`true` - выводить лог в цветном варианте. `false` - выводить лог без цвета|
|separator|string|null|разделитель полей лога. Действует только во `flat` режиме. Если разделитель не задан, то лог преобразуется в однострочный json| 
 
#### Примеры
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
В данном режиме поступившие логи записываются в файл
 
 #### init options
| Name | Type | Default value | Description |
|---|---|---|---|
|path|string|__dirname|Путь директории в которой создается файл логов|
|name|string|jrflogs.txt|Имя и расширение файла логов|
|typeOutput|string|'flat'|Тип записи логов в файл. `flat` - записывать одной строкой. `json` - лог записывается в виде форматированого json|
|separator|string|null|разделитель полей лога. Действует только во `flat` режиме. Если разделитель не задан, то лог преобразуется в однострочный json|

#### Пример 
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
В данном режиме поступившие логи записываются в MongoDB
 
#### init options
| Name | Type | Default value | Description |
|---|---|---|---|
|server|string|localhost|Имя сервера|
|port|number|27100|Порт сервера|
|db|string|jrflogs|Имя базы данных|
|collection|string|logs|Имя коллекции|
|user|string|''|Имя пользователя|
|password|string|''|Пароль пользователя|

#### Пример 
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
В данном режиме поступившие логи записываются в PostgreSQL
 
#### init options
| Name | Type | Default value | Description |
|---|---|---|---|
|server|string|localhost|Имя сервера|
|port|number|27100|Порт сервера|
|db|string|jrflogs|Имя базы данных|
|user|string|''|Имя пользователя|
|password|string|''|Пароль пользователя|

#### Пример 
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
