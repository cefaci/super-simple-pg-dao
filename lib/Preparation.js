import Validation from './Validation'

const SELECT = 'SELECT '
const SELECT_ALL = '* '
const FROM = 'FROM '
const WHERE = 'WHERE '
// const ORDDERBY = 'ORDER BY '
const LIMIT = 'LIMIT '
const LIMIT_MAX = 1000

const SELECT_FROM = SELECT + SELECT_ALL + FROM
// const LIMIT_ALL = LIMIT + ' ' + LIMIT_MAX

/**
 * This class implements helpers for direct generic inserts or bulk inserts.
 * db/tables.js defines the ddl of the DB tables 
 * which is used to validate the incoming json to be inserted.
 */
export default class Preparation {

  /**
   * Create the insert object as array and validate incoming json data 
   * against the defined db/tables.js types.
   * 
   * @param {*} table 
   * @param {*} data 
   * @param {*} default_value 
   */
  static insert_array(table, data = {}, default_value = true){
    let columns = []
    let indices = []
    let values = []
    let conflicts = []
    let where = []
    let where_keys = {}
    let returning = '*'
    let replaceid = {}
    if(table && table._name && data){
      let column = null
      let value = null
      let value_validated = null
      let index = 0
      if(table._id){
        returning = table._id
        if(table._id_fk){ replaceid[table._id] = table._id_fk }
      }
      let validated = null
      if(data._where){
        validated = Preparation.validate_object(table, data, 1)
        if(validated){
          where_keys['columns'] = validated.columns
          where_keys['indices'] = validated.indices
          where_keys['values']  = validated.values
        }
      } 
      for (let key in table) {
        value = data[key]
        column = table[key]
        if(typeof column === 'object' && (table._id && key !== table._id)){
          if(!(typeof table[key] === 'undefined' && (default_value || typeof data[key] !== 'undefined'))){
            value_validated = Validation.validate(column, value, default_value)
            if(value_validated && value_validated.valid){
              columns.push(key)
              indices.push('$' + (++index))
              values.push(value_validated.value)
            } else {
              console.error('Preparation->insert_array: unvalid: ', key, column, value)
              throw new Error('Preparation->insert_array: unvalid: ', key, column, value)
            }
          } else {
            console.error('Preparation->insert_object: column UNKOWN: ', key, column, value)
          }
        }
      }
    }
  
    return columns && values && values.length > 0 ? {
      table,
      columns, 
      indices,
      values,
      conflicts,
      where,
      where_keys,
      returning,
      replaceid,
      sql: 'insert',
    } : null
  }
  
  /**
   * Create the insert object as objects and validate incoming json data 
   * against the defined db/tables.js types.
   * 
   * @param {*} table 
   * @param {*} data 
   * @param {*} default_value 
   */
  static insert_object(table, data = {}, default_value = true){
    let columns = []
    let indices = []
    let values = {}
    let conflicts = []
    let where = {}
    let returning = '*'
    let replaceid = {}
    if(table && table._name && data){
      let column = null
      let value = null
      let value_validated = null
      if(table._id){
        returning = table._id
        if(table._id_fk){ replaceid[table._id] = table._id_fk }
      }
      let validated = null
      if(data._where){
        validated = Preparation.validate_object(table, data, 1)
        if(validated){
          where['columns'] = validated.columns
          where['indices'] = validated.indices
          where['values']  = validated.values
        }
      } 
      for (let key in table) {
        value = data[key]
        column = table[key]
        if(typeof column === 'object' && (typeof table._id === 'undefined' || (table._id && key !== table._id))){
          if(!(typeof table[key] === 'undefined' && (default_value || typeof data[key] !== 'undefined'))){
            value_validated = Validation.validate(column, value, default_value)
            if(value_validated && value_validated.valid){
              columns.push(key)
              indices.push('${'+key+'}')
              values[key] = value_validated.value
            } else {
              console.error('Preparation->insert_object: UNVALID: ', key, column, value)
              // only allow this case to pass
              throw new Error('Preparation->insert_object: UNVALID: ', key, column, value)
            }
          } else {
            console.error('Preparation->insert_object: column UNKOWN: ', key, column, value)
          }
        }
      }
    }
      
    return columns && values && columns.length > 0 ? {
      table,
      columns, 
      indices,
      values,
      conflicts,
      where,
      returning,
      replaceid,
      sql: 'insert',
    } : null
  }
  
  /**
   * Create the update object as objects and validate incoming json data 
   * against the defined db/tables.js types.
   * 
   * @param {*} table 
   * @param {*} data 
   * @param {*} default_value 
   */
  static update_object(table, data = {}, sql = 'update', allow_empty = true){
    let columns = []
    let indices = []
    let values = {}
    let where = {}
    let returning = '*'

    if(table && table._name && data){
      if(data._returning){
        returning = data._returning
      } else if(table._id){
        returning = table._id
      }
      let validated = null
      if(data._where || data._where){
        validated = Preparation.validate_object(table, data._where, 1)
        if(validated){
          where['columns'] = validated.columns
          where['indices'] = validated.indices
          where['values']  = validated.values
        }
      } 
      validated = Preparation.validate_object(table, data)
      if(validated){
        columns = validated.columns
        indices = validated.indices
        values = validated.values
      }
    }
      
    return columns && values && (columns.length > 0 || allow_empty) ? {
      table,
      columns, 
      indices,
      values,
      where,
      returning,
      sql: sql,
    } : null
  }

  static validate_object(table, data, i = 0){
    let columns = []
    let indices = []
    let values = {}

    let column = null
    let value = null
    let value_validated = null
    let name = null
    for (let key in data) {
      value = data[key]
      column = table[key]
      
      if(!(typeof table[key] === 'undefined' && typeof data[key] !== 'undefined')){
        value_validated = Validation.validate(column, value, false)
        if(value_validated && value_validated.valid){
          columns.push(key)
          name = key+'_v'+i
          indices.push('${'+name+'}')
          values[name] = value_validated.value
        } else {
          console.error('Preparation->validate_object: UNVALID: ', key, column, value)
          // only allow this case to pass
          throw new Error('Preparation->validate_object: UNVALID: ', key, column, value)
        }
      } else if(key != '_where') {
        console.error('Preparation->validate_object: column UNKOWN: ', key, column, value)
      }
    }

    return columns && values && columns.length > 0 ? {
      columns, 
      indices,
      values,
    } : null
  }

  /**
   * e.g. replace IDs a.k.a in the next coming objects 
   *  option.replaceid: { id: [ 'user_fk', 'created_by_user_fk' ] }
   * @param {*} keys 
   * @param {*} data 
   */
  static return_object(keys, data){
    let values = null
    
    if(keys && data){
      values = {}
  
      let value = null
      let key_target = null
      for (let key in keys) {
        value = data[key]
        key_target = keys[key]
        if(Array.isArray(key_target)){
          for(let i = 0; i < key_target.length; i++){
            if(key_target[i] && typeof value !== 'undefined'){
              values[key_target[i]] = value
            }
          }
        } else if(key_target && typeof value !== 'undefined'){
          values[key_target] = value
        }
      }
    }
  
    return values ? values : null
  }

  static result_object(data, tables){
    let results = []
    if(data && data.length > 0){
      let queried = null
      let element = null
      let elements = null
      let i = 0
      for(let d = 0; d < data.length; d++){
        queried = data[d]
        i = 0
        elements = []
        for (let t in tables) {
          element = {}
          for (let key in tables[t]) {
            if(key !== '_id' && key !== '_id_fk' && key !== '_name'){
              element[key] = queried[i++]
            }
          }
          elements.push(element)
        }
        results.push(elements)
      }
    }
    return results
  }

  /**
   * 
   *  {'iuh':TABLE_ID_USER_HASH,'u':TABLE_USER,'c':TABLE_USER_CREDENTIAL}
   *  {'iuh':{value : 'null'},'c': {key: 'null'}
   * 
   * @param {*} tables 
   * @param {*} columns_extra 
   */
  static select_object(tables, columns_extra = {}, set_from = true){
    let select = ''
    let from = ''
    let table = null
    let columns = null
    if(tables){
      for (let name in tables) {
        table = tables[name]
        columns = columns_extra[name] ? columns_extra[name] : {}
        
        if(from.length > 0) from += ','
        from += '"' + table._name + '" as "' + name + '"'

        for (let key in table) {
          if(key !== '_id' && key !== '_id_fk' && key !== '_name'){
            if(select.length > 0) select += ','
            if(columns[key]){
              select += columns[key]
            } else {
              select += name + '.' + key
            }
          }
        }
      }
      select = SELECT + select + ' ' + (set_from ? FROM + from + ' ' : '')
    }
    return select
  }

  /**
   * Allow complex reads in one table
   * {id: 20, app_fk: 14}
   * {id: {v: [20,21], t:'::bigint[])', c: '= ANY (', 'OR': {id: 20, app_fk: 14}}, app_fk: 14}
   * {id: {v: [20,21], t:'::bigint[])', c: '= ANY (', 'OR': {id: {v: 20, c: '=', 'OR': {id: 20, app_fk: 14}}, app_fk: 14}}, app_fk: 14}
   * 
   * @param {*} table 
   * @param {*} values 
   * @param {*} separator 
   * @param {*} operator 
   */
  static read(table, values, limit = LIMIT_MAX, separator = '=', operator = 'AND'){
    let options = {text : '', values : []} // {name : table._name+'::READ', text : '', values : []}
    let select = SELECT_FROM + '"' + table._name + '" '
    if(values){
      select = select + WHERE 
      let data = Preparation.where(0, options.values, values, separator, operator)
      select += data.select
      
      select += LIMIT + limit
      options.text = select
      options.name = table._name+'::READ' + data.keys

      return options 
    }
    options.text = select + LIMIT + limit
    return options
  }

  static where(i, push, values, separator_default = '=', operator_default = 'AND', operator_set = null){
    let separator = separator_default
    let operator = operator_default
    
    let value = null
    let element = null
    let object = false
    let complex = false
    let type = ''
    let select = (operator_set ? ' ' + operator_set : '') + ' ( '
    let keys = ''
    for (let key in values) {
      separator = separator_default
      operator = operator_default
      element = values[key]
      keys += '::' + key
      if(typeof element === 'object' && !Buffer.isBuffer(element) && !Array.isArray(element)){
        complex = true
        value = element.v
        object = false
        type = ''
        if(element.c) separator = element.c
        if(element.t) type = element.t
        if(element['AND']){
          operator = 'AND'; object = element['AND']
        } else if (element['OR']){
          operator = 'OR';  object = element['OR']
        }
        
        select += key + ' ' + separator + ' $'+ (i+1) +type+' '
        push.push(value)
        i++

        if(object){
          let data = Preparation.where(i, push, object, separator_default, operator_default, operator)
          select += data.select
          i = data.i
          operator_set = null
        }
      } else {
        value = element
        if(operator_set) {operator_set = null}
        else if(i > 0) { select += ' ' + operator + ' ' }
        select += key + ' ' + separator + ' $'+ (i+1) +' '
        push.push(value)
        i++
      }
    }
    if(complex){
      keys += '::' + new Date().getTime() + '::' +  Math.floor(Math.random() * (888889) + 100000)
    }
    select += ') '
    return {select, i, keys}
  }
}