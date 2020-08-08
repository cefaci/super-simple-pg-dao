import User from 'dao/User'
import Auth from 'dao/Auth'
// import UserData from 'example/dao/UserData'
// import UserCredential from 'example/dao/UserCredential'
import Helper from 'Helper'

import { pgp } from '.'
import { DB } from 'super-simple-pg-dao'

const SQL_DROP = '00_drop.sql'
const SQL_SCHEMA = '00_schema.sql'
const CONFIG_DB = './db.json'
const TYPE_USER_INIT = 1
// const QueryResultError = pgp.errors.QueryResultError
const QueryFile = pgp.QueryFile
const path = require('path')

class InitDAOClass {

  constructor(){}

  createFirstUser = async(init, type_key_fk = 1) => {
    try {
      // console.log(init)
      let salt = Helper.getHash(Buffer.concat([Helper.createRandom(32), Helper.createRandom(32)], 64))
      let key = Helper.createKey(init.password, salt) // PBKDF2_SHA512_10000_64

      let data = {
        // USER
        user_credential: {
          key : key,
          type_fk : TYPE_USER_INIT,
          type_key_fk : type_key_fk, // PBKDF2_SHA512_10000_64
          enabled : true,
        }, 
        user_data: {
          value : {'hello' : 'hello', 'user' : 'yes'},
          type_fk : TYPE_USER_INIT,
          enabled : true,
        },  
        auth : {},
        user : {
          name : init.username,
          type_fk : TYPE_USER_INIT, // SERVER
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
      return await DB.queryTxBatchStepWithReturnFK(queries)
      // return await User.create(data)
    } catch (error){
      console.error('InitDAO->createServerUser():', error)
      return Promise.reject(error)
    }
  }

  sql(file) {
    return new QueryFile(path.join(__dirname, file), {minify: true})
  }

  catchOrInitDB = async(error, drop = false) => {
    // DB not reachable
    if(error && (error.code === 'ECONNREFUSED' || error.code === '57P03')){
      return Promise.reject(error)
    // EMPTY DB
    } else if(error && error.code === '42P01'){
      if(drop) {
        console.info('InitDAO->catchAndInitDB(): Drop and creating DB!') 
      } else {
        console.error('InitDAO->catchAndInitDB(): ERROR: No database! -> Creating DB!') 
      }

      try{
        let queries = []
        queries.push('ABORT;')
        if(drop){
          queries.push(this.sql(SQL_DROP))
        }
        queries.push(this.sql(SQL_SCHEMA))

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

  init = async(drop = false) => {
    let data = null
    if(drop){
      await this.catchOrInitDB({code : '42P01'}, drop)
    } else {
      let i = 0
      while (i < 10) {
        try{
          data = await User.read({type_fk : TYPE_USER_INIT}, 2)
          break
        } catch(error) { 
          if(error === 'Connection terminated due to connection timeout'){
            i++
          } else {
            await this.catchOrInitDB(error, drop)
            break
          }
        }
      }
    }
    // process.exit(0)
    try{
      if(!data ||(data && data.length <= 0)){
        console.log('NO SYSTEMUSER in DB - creating') 
        let config = require(CONFIG_DB)
        data = await this.createFirstUser(config.init)
          .catch(error => { 
            console.error('InitDAO->init(): ERROR:', error) 
          })

        if(data){ 
          console.log('Creating SYSTEMUSER success', data)
        } else { 
          console.log('NO SYSTEMUSER in DB', data) 
        }
      } 
    } catch(error) {
      console.error('InitDAO->init(): ERROR: ', error)
      return Promise.reject(error)
    }
    return data
  }
}

const InitDAO = new InitDAOClass()
export default InitDAO
