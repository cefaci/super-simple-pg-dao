// https://vitaly-t.github.io/pg-promise/module-pg-promise.html
const production = process.env.NODE_ENV === 'production'
const config_db = require('db.json')
const initOptions = { 
  // pgNative : true,
  // pg-promise initialization options...
  //
  // receive(data, result, e) {
  //  console.log('data', data)
  //  console.log('result', result)
  // },
  // receive(data, result, e) {
  //  if (result && result.duration && result.duration >= 100) {
  //    console.log('\tPGP::Receive::Duration:', result.duration, 'ms for rows', result.rowCount)
  //  }
  // },
  query(e) {
    if (e.ctx && e.ctx.finish && e.ctx.duration >= 100) {
      console.log('\tPGP::Query::Duration:', e.ctx.duration, 'ms for', e.ctx.tag, 'with', e.ctx.success)
    }
  },
  task(e) {
    if (e.ctx.finish && e.ctx.duration >= 100) {
    //    // this is a task->finish event;
      console.log('\tPGP::Task::Duration:', e.ctx.duration, 'ms for', e.ctx.tag, 'with', e.ctx.success)
    //    if (e.ctx.success) {
    //      // e.ctx.result = resolved data;
    //    } else {
    //      // e.ctx.result = error/rejection reason;
    //    }
    //  } else {
    //    // this is a task->start event;
    //    // console.log('PGP: Start Time:', e.ctx.start)
    }
  }
}

const config_connection = {...config_db.default}
if(typeof process.env.DB_URL !== 'undefined' && process.env.DB_URL.length > 0){
  console.info('ENV: db.host:', process.env.DB_URL)
  config_connection.host = process.env.DB_URL
}
if(typeof process.env.DB_PORT !== 'undefined' && process.env.DB_PORT.length > 0){
  config_connection.port = process.env.DB_PORT
}
if(typeof process.env.DB_DATABASE !== 'undefined' && process.env.DB_DATABASE.length > 0){
  config_connection.database = process.env.DB_DATABASE
}
if(typeof process.env.DB_USER !== 'undefined' && process.env.DB_USER.length > 0){
  config_connection.user = process.env.DB_USER
}
if(typeof process.env.DB_PASSWORD !== 'undefined' && process.env.DB_PASSWORD.length > 0){
  config_connection.password = process.env.DB_PASSWORD
}

if(!production){
  const monitor = require('pg-monitor')
  monitor.attach(initOptions, ['error'])
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
// -----------------------------------------------------------------------
// INIT BigInt and UTC timezone fixes
BigInt.prototype.toJSON = function() { return this.toString() }
pgp.pg.types.setTypeParser(20, BigInt) // Type Id 20 = BIGINT | BIGSERIAL

const parseBigIntArray = pgp.pg.types.getTypeParser(1016)
pgp.pg.types.setTypeParser(1016, a => parseBigIntArray(a).map(BigInt))

// https://github.com/knex/knex/issues/2094
pgp.pg.types.setTypeParser(1114, a => a && new Date(a + '+00')) // TIMESTAMP_OID 
// -----------------------------------------------------------------------

/**
 * Init server and test connection:
 */
const connect_db = async() => {
  try{
    return await db.query('SELECT version()').then( data  => { console.info( 'index->db->connect():', data) })
  } catch(error) { 
    console.error('index->db->connect():', error)
    if(error && (error.code === 'ECONNREFUSED' || error.code === '57P03' || error.code === '57P01')){
      console.log('index->db->connect():RECONNECT:', error, 'Retrying it in', config_db.timeout.connection)
      setTimeout( connect_db, config_db.timeout.connection)
    }
  }
}
connect_db()

export { 
  pgp, 
  db,
  dbPool,
  config_db,
}



