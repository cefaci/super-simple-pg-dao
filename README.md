Super Simple PG DAO
===================

---

* [About](#about)

# About
Built on top of [pg-promises] and [node-postgres] for PostgreSQL databases. The main objective is easy direct batch inserts from json data, where json fields are optional and data validation is already performed on the nodejs server. "Cascade" inserts for setting foreign keys automatically.

# Install
Install `npm install super-simple-pg-dao --save` 

To get started check out the `examples/` folder. 

# Init 
Init the `pg-promise` library as documented, e.g. (check out the `examples/index.js`)
```
const initOptions = { 
  // options
}
const pgp = require('pg-promise')(initOptions)
const db = pgp(config_connection)
const dbPool = db.$pool
```
and the initilize `super-simple-pg-dao` like:  
```
require('super-simple-pg-dao').init({pgp, db})

// Test:
import {DB} from 'super-simple-pg-dao'
DB.test()
```
# Init options for pg-promise
Some options I use (check out the `examples/index.js`):
```
  // PostgreSQL jsonb data in converted to a string
  BigInt.prototype.toJSON = function() { 
    return this.toString() 
  }
  // Using PostgreSQL BIGINT in nodejs
  pgp.pg.types.setTypeParser(20, BigInt) // Type Id 20 = BIGINT | BIGSERIAL

  const parseBigIntArray = pgp.pg.types.getTypeParser(1016)
  pgp.pg.types.setTypeParser(1016, a => parseBigIntArray(a).map(BigInt))

  // Timestamp UTC error, if you are using default UTC in the PostgreSQL database
  // https://github.com/knex/knex/issues/2094
  pgp.pg.types.setTypeParser(1114, a => a && new Date(a + '+00')) // TIMESTAMP_OID
```

# TODOs
- Read the database tables meta data for creating `tables.js` 
- Read the database tables for creating `dao/*.js` class files.


```SQL
columns:
  `allow` int(1) DEFAULT NULL COMMENT '0: deny, 1: allow',
  `ipaddr` varchar(60) DEFAULT NULL COMMENT 'IpAddress',
  `username` varchar(100) DEFAULT NULL COMMENT 'Username',
  `clientid` varchar(100) DEFAULT NULL COMMENT 'ClientId',
  `access` int(2) NOT NULL COMMENT '1: subscribe, 2: publish, 3: pubsub',
  `topic` varchar(100) NOT NULL DEFAULT '' COMMENT 'Topic Filter',
  
  INSERT INTO mqtt_acl (id, allow, ipaddr, username, clientid, access, topic)
VALUES
    (1,1,NULL,'$all',NULL,2,'#'),
    (2,0,NULL,'$all',NULL,1,'$SYS/#'),
    (3,0,NULL,'$all',NULL,1,'eq #'),
    (5,1,'127.0.0.1',NULL,NULL,2,'$SYS/#'),
    (6,1,'127.0.0.1',NULL,NULL,2,'#'),
    (7,1,NULL,'dashboard',NULL,1,'$SYS/#');
```


<!-- External Links -->
[pg-promises]:https://github.com/vitaly-t/pg-promise
[node-postgres]:https://github.com/brianc/node-postgres

