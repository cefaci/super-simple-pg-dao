Super Simple PG DAO
===================

---

* [About](#about)
* [Install](#install)
  - [Init](##init)
  - [Init options for pg-promise](#init-options-for-pg-promise)

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
## tables.js
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
  '_name' : 'user',
  '_id' : 'id',
  '_id_fk' : 'user_fk',
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

# TODOs
- Read the database tables meta data for creating `tables.js` 
- Read the database tables for creating `dao/*.js` class files.

<!-- External Links -->
[pg-promises]:https://github.com/vitaly-t/pg-promise
[node-postgres]:https://github.com/brianc/node-postgres

