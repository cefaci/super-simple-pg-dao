/**
 * Copyright StarData GmbH 
 * 2016-2020
 */
import { pgp, db} from './init'
import Preparation from './Preparation'
import Sql from './Sql'

export default class DB {
  constructor(){}

  static test(){
    const test = {
      pgp : !pgp ? false : true, 
      db : !db ? false : true,
    }
    console.log('DB: pgp and db imported?', test.pgp, test.db)
    return test
  }
  static all(t, options, values) { return t.any(options, values) }
  static any(t, options, values) { return t.any(options, values) }
  static one(t, options, values) { return t.oneOrNone(options, values) }

  static insert(t, options, values) {
    let qs = Sql.insert(options)
    return t.one(qs, values)
  }

  static insertBatch(t, options, values) {
    let qs = Sql.insertBatch(options)
    return t.one(qs, values)
  }

  static update(t, options, values) {
    let qs = Sql.update(options)
    console.log('SQL:', qs)
    return t.one(qs, options.values)
  }

  static delete(t, options, values) {
    let qs = Sql.delete(options)
    console.log('SQL:', qs)
    return t.one(qs, options.values)
  }

  // -----------------------------------------------------------------
  static timeEnd(name, options, start){
    const timeMS = Number(process.hrtime.bigint() - start) / 1000000
    let out = ''; if(timeMS >= 100){ out = '- '+options.values } 
    console.debug('\tDB->query():', '\x1b[32m'+options.name+'\x1b[0m', '\x1b[33m'+timeMS+'\x1b[0m', 'ms', out)
  }

  /**
   * Simple query, no transaction.
   * 
   * @param {*} query 
   * @param {*} options 
   * @param {*} tables 
   */
  static async query(query, options, values, tables) {
    options = options || {}

    const start = process.hrtime.bigint()
    // console.log('\tDB->query():', query, options)
    return await query(db, options, values)
      .then(data => {
        DB.timeEnd('\tDB->query():', options, start)
        // if(!data){ console.log('\tDB->query():', data, options) }
        return tables ? Preparation.result_object(data, tables): data // Promise.resolve(tables ? Preparation.result_object(data, tables): data)
      }).catch(error => {
        console.error('\tDB->query():', error); return Promise.reject(error)
      })
  }

  /**
   * Simple query, no transaction.
   * 
   * @param {*} query 
   * @param {*} options 
   * @param {*} tables 
   */
  static async task(t, query, options, values, tables) {
    options = options || {}

    const start = process.hrtime.bigint()
    return await query(t, options, values)
      .then(data => {
        DB.timeEnd('\tDB->query():', options, start)
        return tables ? Preparation.result_object(data, tables): data // Promise.resolve(tables ? Preparation.result_object(data, tables): data)
      }).catch(error => {
        console.error('\tDB->query():', error); return Promise.reject(error)
      })
  }

  /**
   * Transaction query
   * 
   * @param {*} query 
   * @param {*} options 
   */
  static async queryTx(query, options) {
    options = options || {}
    const start = process.hrtime.bigint()
    // console.log('\tDB->query():', query, options)
    return await db.tx(async(t) => {
      return query(t, options, options.values)
    }).then(data => { 
      DB.timeEnd('\tDB->queryTx():', options, start)
      return data
    }).catch(error => {
      console.error('\tDB->queryTx():', error); return Promise.reject(error)
    })
  }

  /**
   * Batch queries of all kinds in a transaction.
   * 
   * @param {*} queries 
   * @param {*} options 
   */
  static async queryTxBatch(options) {
    options = options || {}
    const start = process.hrtime.bigint()
    return await db.tx(async(t) => {
      let result = []
      for(let i = 0; i < options.length; i++){
        let sql = options[i].sql
        let query = typeof sql === 'undefined' ? options[i] : Sql[sql](options[i])
        result.push({query : query, values: options[i].values})
      }
      const query = pgp.helpers.concat(result)
      return t.any(query) // t.batch(result)
    }).then(data => { 
      DB.timeEnd('\tDB->queryTxBatch():', options, start)
      return data
    }).catch(error => {
      console.error('\tDB->queryTxBatch():', error); return Promise.reject(error)
    })
  }

  /**
   * Batch inserts in a transaction which takes previous primary keys and sets
   * needed foreign keys for the next queries/tables in the batch (cascade insert).
   * 
   * Only prepared object tables with insert are allowed
   * 
   * @param {*} queries 
   * @param {*} options 
   */
  static async queryTxBatchStepWithReturnFK(options) {
    options = options || {}
    const start = process.hrtime.bigint()
    return await db.tx(async(t) => {
      return DB.queryArray(t, options)
    }).then(data => { 
      DB.timeEnd('\tDB->queryTxBatchStepWithReturnFK():', options, start)
      return data
    }).catch(error => {
      console.error('\tDB->queryTxBatchStepWithReturnFK():', error); return Promise.reject(error)
    })
  }

  /**
   * Prepares foreign keys from previous primary keys inserts
   * for the next queries/tables.
   * 
   * @param {*} t 
   * @param {*} queries 
   * @param {*} options 
   */
  static async queryArray(t, options){
    let option = null
    let element = null

    let option_before = {}
    let results = {}
    for(let i = 0; i < options.length; i++){
      option = options[i]

      // replace keys from previous call
      option.values = { ...option.values, ...option_before} 

      let sql = options[i].sql
      let query = typeof sql === 'undefined' ? DB.any : DB[sql]
      // console.log('queryArray(): element:', option.table._name, option_before, option.values)
      element = await query(t, option, option.values)

      if(element){
        if(typeof results[option.table._name] === 'undefined'){
          results[option.table._name] = []
        }
        results[option.table._name].push(element)
        // console.log('queryTxList(): option.replaceid:', option.replaceid, element)
        if(option.replaceid){
          let option_before_new = Preparation.return_object(option.replaceid, element)
          if(option_before_new) {
            option_before = {...option_before, ...option_before_new}
          }
        }
      }
    }
    return results
  }
}