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
  TYPE_JSON,
} from './Constants'

/**
 * This class implements helpers for direct generic inserts or bulk inserts.
 * db/tables.js defines the ddl of the DB tables 
 * which is used to validate the incoming json to be inserted.
 */
export default class Validation {

  /**
   * Validate the columns against the data if they match the types before inserting.
   * 
   * @param {*} column 
   * @param {*} value 
   * @param {*} default_value 
   */
  static validate(column, value, default_value = true){
    if(column) {
      if(typeof value !== 'undefined'){
        if(Validation.validate_nullable(column, value)){
          return { valid : true, value }
        } else if(Validation.validate_type(column, value)){
          return { valid : true, value }
        }
      } else if (default_value){
        if(typeof column.default !== 'undefined'){
          return { valid : true, value : column.default }
        } else if (typeof column.null === 'undefined' || column.null){
          return { valid : true, value : null }
        } else if(column.type) {
          switch(column.type){
            case TYPE_BOOL: return { valid : true, value : false } // TYPE_BOOL
            case TYPE_BYTE: return { valid : true, value : '' } // TYPE_BYTE
            case TYPE_INT2: // TYPE_INT2
            case TYPE_INT4: // TYPE_INT4
            case TYPE_INT8: return { valid : true, value : 0 } // TYPE_INT8
            case TYPE_FLOAT4: // TYPE_FLOAT4
            case TYPE_FLOAT8: return { valid : true, value : 0.0 } // TYPE_FLOAT8
            case TYPE_TIMESTAMP: return { valid : true, value : (new Date()).toUTCString() } // TYPE_TIMESTAMP
            case TYPE_VARCHAR: // TYPE_VARCHAR
            case TYPE_TEXT: // TYPE_TEXT
            case TYPE_CHAR: return { valid : true, value : '' } // TYPE_CHAR
            case TYPE_JSON: return { valid : true, value : '{}' } // TYPE_JSON
          }
        }
      }
    }
    console.error('Validation->validate FAILED: ', column, value)
    return { valid : false, value }
  }

  /**
   * Validate against column type.
   * 
   * @param {*} column 
   * @param {*} value 
   */
  static validate_type(column, value){
    let type = typeof value
    if((type === 'number' || type === 'bigint') && column.type > TYPE_BOOL && column.type < TYPE_VARCHAR){
      return true
    } else if(type === 'boolean' && column.type === TYPE_BOOL){
      return true
    } else if(type === 'string'){
      if((column.type === TYPE_TIMESTAMP || column.type === TYPE_VARCHAR || column.type === TYPE_TEXT || column.type === TYPE_CHAR)){
        if(column.length && column.length < value.length){
          console.error('Validation->validate_type: string length wrong: ', column.length, '<', value.length)
          return false
        }
        return true
      } else if(column.type === TYPE_BYTE){
        console.error('Validation->validate_type: Buffer as string: ', column, value)
        return false
      }
    } else if(type === 'object'){
      if(column.type === TYPE_BYTE && Buffer.isBuffer(value)){ return true } 
      else if(column.type === TYPE_JSON) {      return true }
      else if(column.type === TYPE_TIMESTAMP) { return true }
    }
    console.error('Validation->validate_type: type FALSE: ', type, column, value)
    return false
  }
  
  /**
   * Validate against column nullable.
   * 
   * @param {*} column 
   * @param {*} value 
   */
  static validate_nullable(column, value){
    let value_null = (typeof value === 'undefined' || value === null) ? true : false
    // is null column
    if(typeof column.null === 'undefined' || column.null === true){
      if(!value_null){
        return false // check type THEN no error
      } // else true
    } else if(value_null){
      console.error('Validation->validate_nullable: ', column, value)
      return false
    }
    return true
  }
}