import User from 'example/dao/User'
// import UserData from 'example/dao/UserData'
// import UserCredential from 'example/dao/UserCredential'

import crypto from 'crypto'

import { DB, pgp } from 'db'

// const QueryResultError = pgp.errors.QueryResultError
const QueryFile = pgp.QueryFile
const path = require('path')

class InitDAOClass {

  constructor(){}

  createFirstUser = async(value, type_hash_fk = 1, type_key_fk = 1) => {
    try {
      let email = Security.hash('sha512', value.email).toString('hex')
      let email_bytes = Buffer.from(email, 'hex')

      let salt = Security.sha256(Buffer.concat([Security.createRandom(32), Security.createRandom(32)], 64))
      let key = Security.createKey(type_key_fk, value.password, salt) // PBKDF2_SHA512_10000_64

      let data = {
        // USER
        user_credential: {
          key : key,
          type_fk : 213,
          type_key_fk : type_key_fk, // PBKDF2_SHA512_10000_64
          enabled : true,
        },  
        user : {
          type_fk : 99, // SERVER
          role_fk : 90, // SUPERADMIN
          activated : true, 
          enabled : true,
          comment : 'server',
        },
      }

      // queries, options
      let result_user = User.prepareInsertQueries(data)

      let queries  = [...result_user]
      // console.log(values)
      return await DB.queryTxBatchStepWithReturnFK(queries)
      // return await User.create(data)
    } catch (error){
      console.error('InitDAO->createServerUser():', error)
      return Promise.reject(error)
    }
  }

  sql(file) {
    const fullPath = path.join(__dirname, file)
    return new QueryFile(fullPath, {minify: true})
  }

  catchOrInitDB = async(error) => {
    // DB not reachable
    if(error && (error.code === 'ECONNREFUSED' || error.code === '57P03')){
      return Promise.reject(error)
    // EMPTY DB
    } else if(error && error.code === '42P01'){
      console.error('InitDAO->catchAndInitDB(): ERROR: No database! -> Creating DB!') 
      let drop = this.sql('../../00_drop.sql')
      let schema = this.sql('../../00_schema.sql')
      try{
        let queries = []
        queries.push('ABORT;')
        queries.push(drop)
        queries.push(schema)

        await DB.queryTxBatch(queries) 
        console.log('Creating DATABASE success')

      } catch(error) { 
        console.error('InitDAO->catchAndInitDB(): ERROR: SQL_SCRIPT FAILED!!! ', error)
      }
    } else {
      console.error('InitDAO->catchAndInitDB(): ERROR:', error)
      return Promise.reject(error)
    }
  }

  init = async() => {
    let data = null
    let i = 0
    while (i < 10) {
      try{
        data = await User.read({type_fk : 99}, 2)
        break
      } catch(error) { 
        if(error === 'Connection terminated due to connection timeout'){
          i++
        } else {
          await this.catchOrInitDB(error)
          break
        }
      }
    } 
    // process.exit(0)
    try{
      if(!data ||(data && data.length <= 0)){
        let initJson = require('../../config/init.json')
        data = await this.createFirstUser(initJson, data_config).catch(error => { console.error('InitDAO->init(): ERROR:', error) })

        if(data){ 
          console.log('Creating SYSTEMUSER success', data)
        }
        else { console.log('NO SYSTEMUSER in DB', data) }
        initJson = null
      } 
    } catch(error) {
      console.error('InitDAO->init(): ERROR: ', error)
      return Promise.reject(error)
    }
  }
}

const InitDAO = new InitDAOClass()
export default InitDAO
