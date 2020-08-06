import Preparation from './Preparation'
import DB from './DB'
const {PreparedStatement: PS} = require('pg-promise')
const QUERIES_PS = {}

export default class DBClass {
  // #queries_ps = {}
  constructor(table){ this._table = table}
  
  /**
   * @return tablename
   */
  getName(){
    return  this._table._name
  }

  getQuery(name){
    let query = QUERIES_PS[name]
    return typeof query !== 'undefined' ? query : null
  }

  createQuery(name, options){
    if (typeof options !== 'undefined'){
      QUERIES_PS[name] = new PS(options)
      return QUERIES_PS[name]
    } 
    throw new Error('DBClass.getQuery(): No options for:', name)
  }

  getCreateQuery(name, options){
    let query = QUERIES_PS[name]
    if(typeof query !== 'undefined'){
      console.log('DBClass.getQuery(): Cached keys:', name, Object.keys(QUERIES_PS))
      return query
    } else if (typeof options !== 'undefined'){
      QUERIES_PS[name] = new PS(options)
      return QUERIES_PS[name]
    } 
    throw new Error('DBClass.getQuery(): No options for:', name)
  }

  deleteQuery(name){
    if(typeof QUERIES_PS[name] !== 'undefined'){
      delete QUERIES_PS[name]
    }
  }

  /**
   * Prepare and validate the table object
   * 
   * @param {*} data 
   * @param {*} default_value 
   */
  prepareInsert(data = {}, default_value = true){
    return Preparation.insert_object(this._table, data, default_value)
  }

  /**
   * Prepare query for batch insert
   * 
   * @param {*} data 
   */
  prepareInsertQueries(data = {}){
    return [this.prepareInsert(data)]
  }

  /**
   * Create object and transaction batch with optional using/setting return FKs
   * 
   * @param {*} data 
   */
  async create(data){
    return await DB.queryTxBatchStepWithReturnFK(this.prepareInsertQueries(data))
  }
  
  /**
   * Transaction batch direct w/o using/setting return FKs
   * 
   * @param {*} queries 
   * @param {*} options 
   */
  async createBatch(options){
    return await DB.queryTxBatch(options) 
  }

  /**
   * Transaction one
   * 
   * @param {*} data 
   */
  async insert(data){
    let result = Preparation.insert_array(this._table, data)
    return await DB.queryTx(DB.insert, result)
  }

  /**
   * Transaction update
   * 
   * @param {*} data 
   */
  async update(data){
    let options = Preparation.update_object(this._table, data)
    return await DB.queryTx(DB.update, options, options.values) 
  }

  /**
   * Direct query
   * 
   * @param {*} options 
   */
  async one(options){
    return await DB.query(DB.one, options) 
  }

  /**
   * Direct query
   * 
   * @param {*} t 
   * @param {*} options 
   */
  async oneTask(t, options){
    return await DB.task(t, DB.one, options) 
  }

  /**
   * Direct query
   * 
   * @param {*} options 
   */
  async all(options){
    return await DB.query(DB.any, options) 
  }

  /**
   * Direct query
   * 
   * @param {*} options 
   */
  async allTask(t, options){
    return await DB.task(t, DB.any, options) 
  }

  /**
   * Direct read with limit.
   * 
   * @param {*} options 
   * @param {*} limit 
   */
  async read(options, limit = 1000){
    options = Preparation.read(this._table, options, limit)
    return await DB.query(DB.any, options, options.values) 
  }

  /**
   * Direct read with limit.
   * 
   * @param {*} t 
   * @param {*} options 
   * @param {*} limit 
   */
  async readTask(t, options, limit = 1000){
    options = Preparation.read(this._table, options, limit)
    return await DB.task(t, DB.any, options, options.values) 
  }
}
