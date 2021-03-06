Super Simple PG DAO
===================

---

* [About](#about)
* [Install](#install)
  - [Init](#init)
  - [Init options for pg-promise](#init-options-for-pg-promise)
* [Usage](#usage)
  - [DAO](#dao)
  - [Read](#read)
  - [Insert](#insert)
  - [Insert Conflicts](#insert-conflicts)
  - [Update](#update)
  - [Delete](#delete)
  - [Query](#query)
  - [Batch insert/update/delete/read](#batch-insert-update-delete-read)
  - [Batch insert "cascade"](#batch-insert-cascade)
* [TODOs](#totos)

# About
Built on top of [pg-promises] and [node-postgres] for PostgreSQL databases. The main objective is easy direct batch inserts from json data, where json fields are optional and data validation is already performed on the nodejs server. "Cascade" inserts for setting foreign keys automatically.

# Install
Install `npm install super-simple-pg-dao --save` 

To get started check out the `examples/` folder. 

## Init 
Init the `pg-promise` library as documented, e.g. (check out the `examples/index.js`)
```javascript
const initOptions = { 
  // options
}
const pgp = require('pg-promise')(initOptions)
const db = pgp(config_connection)
const dbPool = db.$pool
```
and the initilize `super-simple-pg-dao` like:  
```javascript
require('super-simple-pg-dao').init({pgp, db})

// Test:
import {DB} from 'super-simple-pg-dao'
DB.test()
```
## Init options for pg-promise
Some options I use (check out the `examples/index.js`):
```javascript
// PostgreSQL jsonb data is converted to a string
BigInt.prototype.toJSON = function() { 
  return this.toString() 
}
// Using PostgreSQL BigInt and BigInt[] in nodejs
pgp.pg.types.setTypeParser(20, BigInt) // Type Id 20 = BIGINT | BIGSERIAL

const parseBigIntArray = pgp.pg.types.getTypeParser(1016)
pgp.pg.types.setTypeParser(1016, a => parseBigIntArray(a).map(BigInt))

// Timestamp UTC error, if you are using default only UTC in the PostgreSQL database
// https://github.com/knex/knex/issues/2094
pgp.pg.types.setTypeParser(1114, a => a && new Date(a + '+00')) // TIMESTAMP_OID
```
# Usage
## DAO
Create a a file were you store the table description e.g. `tables.js`

```javascript
import {
  TYPE_BOOL,
  TYPE_BYTE,
  TYPE_INT2,
  TYPE_INT4,
  TYPE_INT8,
  TYPE_FLOAT4,
  TYPE_FLOAT8,
  TYPE_TIMESTAMP,
  TYPE_VARCHAR,
  TYPE_TEXT,
  TYPE_CHAR,
  TYPE_JSON} from 'super-simple-pg-dao'


// TABLE_USER
export const TABLE_USER = {
  '_name' : 'user', // your table name - MANDATORY
  '_id' : 'id', // your primary key - MANDATORY
  '_id_fk' : 'user_fk',// your foreign key name in the other tables, for batch insert "cascade" - OPTIONAL
  'id' : { 'type' : TYPE_INT8, 'null' : false},
  'role_fk' : { 'type' : TYPE_INT4, 'null' : false, default : 0},
  'type_fk' : { 'type' : TYPE_INT4, 'null' : false, default : 0},
  'name' : { 'type' : TYPE_VARCHAR, 'length' : 255, 'null' : false},
  'comment' : { 'type' : TYPE_VARCHAR, 'length' : 255},
  'activated' : { 'type' : TYPE_BOOL, 'null' : false},
  'enabled' : { 'type' : TYPE_BOOL, 'null' : false},
  'created' : { 'type' : TYPE_TIMESTAMP, 'null' : false},
  'updated' : { 'type' : TYPE_TIMESTAMP},
}
```
and the DAO class
```javascript
import { 
  TABLE_USER
} from '../tables'

import { DBClass } from 'super-simple-pg-dao'

class UserClass extends DBClass {
  constructor(){ super(TABLE_USER) }
}
const User = new UserClass()
export default User
```
That's it!

## Read
Different read examples
```javascript
import User from 'dao/User'
const {db} = require('index')

// by name
let data = await User.read({name: 'test'})
// more parameters
data = await User.read({id: 1, name : 'test'})
// with task
await db.task('read10timesTask', async t => {
  data = await User.readTask(t, {name: 'test'})
}).then(() => {
  // ...
})
// more complex
// SELECT * FROM user WHERE id = ANY([0,1]::bigint[]) OR (id = 1 AND type_fk = 3) AND type_fk = 1;
data = await User.read({id: {v: [0,1], t:'::bigint[])', c: '= ANY (', 'OR': {id: 1, type_fk: 3}}, type_fk: 1})
// more more complex
// SELECT * FROM user WHERE id = ANY([0,1]::bigint[]) OR ((id = 1 OR (id = 1 AND type_fk = 3)) OR type_fk = 3) AND type_fk = 1;
data = await User.read({id: {v: [0,1], t:'::bigint[])', c: '= ANY (', 'OR': {id: {v: 1, c: '=', 'OR': {id: 1, type_fk: 3}}, type_fk: 3}}, type_fk: 3})
    
```

## Insert
Different insert examples
```javascript
import User from 'dao/User'
import {DB} from 'super-simple-pg-dao'

// by name
let data = await User.insert({name: 'test'})
// more parameters
data = await User.insert({name: 'test', updated: 'NOW()'})
```

## Insert Conflicts
Insert ON CONFLICT is possible to

```javascript
import User from 'dao/User'
import {DB} from 'super-simple-pg-dao'

const name = 'test'
let user = {
  comment : 'server500',
  _where : {
    name : name
  }
}

let prepared = User.prepareInsert(user)
prepared.conflicts.push('name')
prepared.where = []
prepared.where.push('enabled IS TRUE AND name IS NOT NULL')

let data = await DB.query(DB.insert, prepared, prepared.values)
```

## Update
Different update examples
```javascript
import User from 'dao/User'
import {DB} from 'super-simple-pg-dao'

// by parameters
let data = await User.update({comment : '1.1', activated : true, enabled : true, _where : {id : 1, name: 'test'}})
// more parameters
data = await User.update({comment : '1.2', name : 'testNEW', activated : true, enabled : true, updated : 'NOW()', _where : {id : data.id, name: 'test'}})

// with prepared
const name = 'test'
let user = {
  comment : 'server500',
  _where : {
    name : name
  }
}

let prepared = User.prepareUpdate(user)
let data = await DB.query(DB.update, prepared, prepared.values)
```

## Delete
Different delete examples
```javascript
import User from 'dao/User'
import {DB} from 'super-simple-pg-dao'

// by name and id
let data = data = await User.delete({_where : {id : 1, name: 'test'}})
```

## Query
You can query as you want, the examples here are prepared statements, which are cached in `DBClass` (be aware with same names!).
`Preparation.select_object` can build your `SELECT` w/ or w/o `FROM` part as you need. It can null or set to different values (e.g. true or 1) for your columns, e.g. to hide keys. For complex queries you need to set `rowMode : 'array'` from [node-postgres] otherwise your same name columns will be overwritten from the return object. Check out the `examples` and `test`.


```javascript
import User from 'dao/User'
import {DB} from 'super-simple-pg-dao'

const name = 'test'
const type_id = 1
const limit = 2

const nameQuery = 'user::readSalt'

let query = User.getQuery(nameQuery)
if (!query){
  query = User.createQuery(nameQuery, {
    name : nameQuery,
    text : 'SELECT u.id, u.name, c.id as c_id, c.salt, c.expire, c.created, c.updated '+
           'FROM "' + TABLE_USER._name + '" as u, "' + TABLE_USER_CREDENTIAL._name + '" as c '+
           'WHERE u.id = c.user_fk AND u.name = $1 AND u.type_fk = $2 AND '+
           '      u.enabled IS TRUE AND u.activated IS TRUE AND c.enabled IS TRUE ORDER BY c.expire DESC NULLS LAST LIMIT $3',
  })
}
let data = await DB.query(DB.one, query, [name, type_id, limit]) 
```

```javascript
import User from 'dao/User'
import {DB} from 'super-simple-pg-dao'

const sample = 100
const name = 'test'
const type_id = 1
const limit = 2

const nameQuery = 'user::readSalt::complex'

let query = User.getQuery(nameQuery)
if (!query){
  query = User.createQuery(nameQuery, {
    name : nameQuery,
    // null the key to not show it
    text : Preparation.select_object({'u':TABLE_USER,'c':TABLE_USER_CREDENTIAL}, {'c': {key: 'null'}}, false) + 
           'FROM "' + TABLE_USER._name + '" as u, "' + TABLE_USER_CREDENTIAL._name + '" as c TABLESAMPLE SYSTEM($1)'+
           'WHERE u.id = c.user_fk AND u.name = $2 AND u.type_fk = $3 AND '+
           '      u.enabled IS TRUE AND u.activated IS TRUE AND c.enabled IS TRUE ORDER BY c.expire DESC NULLS LAST LIMIT $4',
    rowMode : 'array',
  })
}
let data = await DB.query(DB.any, query, [sample, name, type_id, limit], [TABLE_USER, TABLE_USER_CREDENTIAL]) 
```

```javascript
import User from 'dao/User'
import {DB} from 'super-simple-pg-dao'

const name = 'test'
const type_id = 1
const limit = 2

const nameQuery = 'user::readSalt::complex::selectmore'

let query = User.getQuery(nameQuery)
if (!query){
  query = User.createQuery(nameQuery, {
    name : nameQuery,
    text : Preparation.select_object({'u':TABLE_USER,'c':TABLE_USER_CREDENTIAL, 'd': TABLE_USER_DATA}, {}, true) + 
           'WHERE u.id = c.user_fk AND u.id = d.user_fk AND u.name = $1 AND u.type_fk = $2 AND '+
           '      u.enabled IS TRUE AND u.activated IS TRUE AND c.enabled IS TRUE ORDER BY c.expire DESC NULLS LAST LIMIT $3',
    rowMode : 'array',
  })
}
let data = await DB.query(DB.any, query, [name, type_id, limit], [TABLE_USER, TABLE_USER_CREDENTIAL, TABLE_USER_DATA]) 
```

## Batch insert/update/delete/read
Create an array with your object data and use `DB.queryTxBatch()` witch uses [pgp.helpers.concat()]

```javascript
import {DB} from 'super-simple-pg-dao'
import Auth from 'dao/Auth'

// queries, options
let queries = Auth.prepareInsertQueries({})
for(let i = 0; i < 100; i++){
  queries.push(Auth.prepareInsert())
}
data = await DB.queryTxBatch(queries)
```

## Batch insert "cascade"
The foreign keys are step by step overwritten from the defined field `_id_fk` set in table defintion of `tables.js`.
With the method `DB.queryTxBatchStepWithReturnFK()` you can use this functionality otherwise use the method `DB.queryTxBatch()` which doesn't set the previous returned foreign keys and concatenates with [pgp.helpers.concat()]

```javascript
import {DB} from 'super-simple-pg-dao'
import Helper from 'Helper'

const name = 'test cascade'
let salt = Helper.getHash(Buffer.concat([Helper.createRandom(32), Helper.createRandom(32)], 64))
let key = Helper.createKey('balalbalalba', salt) // PBKDF2_SHA512_10000_64

let data = {
  // USER
  user_credential: {
    key : key,
    type_fk : 2,
    type_key_fk : 2, // PBKDF2_SHA512_10000_64
    enabled : true,
  }, 
  user_data: {
    value : {'hello' : 'hello11', 'user' : 'yes11'},
    type_fk : 2,
    enabled : true,
  },  
  auth : {},
  user : {
    name : name,
    type_fk : 2, // SERVER
    role_fk : 90, // SUPERADMIN
    activated : true, 
    enabled : true,
    comment : 'server',
  },
} 

// queries, options
let result_user = User.prepareInsertQueries(data)
for(let i = 0; i < 100; i++){
  result_user.push(Auth.prepareInsert())
}

let queries  = [...result_user]
data = await DB.queryTxBatchStepWithReturnFK(queries)
```

# TODOs
- Read the database tables meta data for creating `tables.js` 
- Read the database tables for creating `dao/*.js` class files.

<!-- External Links -->
[pg-promises]:https://github.com/vitaly-t/pg-promise
[node-postgres]:https://github.com/brianc/node-postgres
[pgp.helpers.concat()]:https://vitaly-t.github.io/pg-promise/helpers.html#.concat

