// https://vitaly-t.github.io/pg-promise/module-pg-promise.html
const DURATION_MS = 100
const production = process.env.NODE_ENV === 'production'
const config_db = require('./db.json')
const config_connection = {...config_db.default}

const initOptions = { 
  // pgNative : true,
  query(e) {
    if (e.ctx && e.ctx.finish && e.ctx.duration >= DURATION_MS) {
      console.log('\tPGP::Query::Duration:', e.ctx.duration, 'ms for', e.ctx.tag, 'with', e.ctx.success)
    }
  },
  task(e) {
    if (e.ctx.finish && e.ctx.duration >= DURATION_MS) {
      console.log('\tPGP::Task::Duration:', e.ctx.duration, 'ms for', e.ctx.tag, 'with', e.ctx.success)
    }
  }
}
if(!production){
  // const monitor = require('pg-monitor')
  // monitor.attach(initOptions, ['error'])
}

const pgp = require('pg-promise')(initOptions)
const db = pgp(config_connection)
const dbPool = db.$pool

// const dbPool = new pgp.pg.Pool(config_db.default)
dbPool.on('error', function(error, client) {
  console.error('dbPool:ERROR:', error, client)
  // handle this in the same way you would treat process.on('uncaughtException')
  // it is supplied the error as well as the idle client which received the error
})

/**
 * Init server and test connection:
 */
// INIT types
export const db_init = (pgp) => {
  // JSON 
  BigInt.prototype.toJSON = function() { 
    return this.toString() 
  }
  // BIGINT
  pgp.pg.types.setTypeParser(20, BigInt) // Type Id 20 = BIGINT | BIGSERIAL

  const parseBigIntArray = pgp.pg.types.getTypeParser(1016)
  pgp.pg.types.setTypeParser(1016, a => parseBigIntArray(a).map(BigInt))

  // Timestamp UTC error
  // https://github.com/knex/knex/issues/2094
  pgp.pg.types.setTypeParser(1114, a => a && new Date(a + '+00')) // TIMESTAMP_OID 
}
export const db_check = async(db) => {
  try{
    let data = await db.one('SELECT version()')
    console.info( 'index->db->connect():', data)
    return data ? data.version : null
  } catch(error) { 
    console.error('index->db->connect():', error)
    if(error && (error.code === 'ECONNREFUSED' || error.code === '57P03' || error.code === '57P01')){
      console.log('index->db->connect():RECONNECT:', error, 'Retrying it in', config_db.timeout.connection)
      setTimeout( db_check, config_db.timeout.connection)
    }
  }
}
db_init(pgp)
// db_check(db)
require('super-simple-pg-dao').init({pgp, db})

// let {DB} = require('db')
import {DB} from 'super-simple-pg-dao'
DB.test()

export { 
  pgp, 
  db,
  dbPool,
}



