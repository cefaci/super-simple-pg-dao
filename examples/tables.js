/*
 * Copyright (c) 2016-present, cefaci <25903524+cefaci@users.noreply.github.com>
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Removal or modification of this copyright notice is prohibited.
 */
import {
  TYPE_BOOL,
  TYPE_BYTE,
  // TYPE_INT2,
  TYPE_INT4,
  TYPE_INT8,
  // TYPE_FLOAT4,
  // TYPE_FLOAT8,
  TYPE_TIMESTAMP,
  TYPE_VARCHAR,
  // TYPE_TEXT,
  // TYPE_CHAR,
  TYPE_JSON} from 'super-simple-pg-dao'

// -----------------------------------------
// TABLES
// -----------------------------------------
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

export const TABLE_USER_CREDENTIAL = {
  '_name' : 'user_credential',
  '_id' : 'id',
  '_id_fk' : 'user_credential_fk',
  'id' : { 'type' : TYPE_INT8, 'null' : false},
  'user_fk' : { 'type' : TYPE_INT8, 'null' : false},
  'type_fk' : { 'type' : TYPE_INT4, 'null' : false, default : 0},
  'type_key_fk' : { 'type' : TYPE_INT4, 'null' : false, default : 0},
  'key' : { 'type' : TYPE_BYTE},
  'salt' : { 'type' : TYPE_BYTE},
  'enabled' : { 'type' : TYPE_BOOL, 'null' : false},
  'timeout' : { 'type' : TYPE_INT4},
  'expire' : { 'type' : TYPE_TIMESTAMP},
  'created' : { 'type' : TYPE_TIMESTAMP, 'null' : false},
  'updated' : { 'type' : TYPE_TIMESTAMP},
}

export const TABLE_USER_DATA = {
  '_name' : 'user_data',
  '_id' : 'id',
  'id' : { 'type' : TYPE_INT8, 'null' : false},
  'user_fk' : { 'type' : TYPE_INT8, 'null' : false},
  'type_fk' : { 'type' : TYPE_INT4},
  'value' : { 'type' : TYPE_JSON},
  'enabled' : { 'type' : TYPE_BOOL, 'null' : false},
  'created' : { 'type' : TYPE_TIMESTAMP, 'null' : false},
  'updated' : { 'type' : TYPE_TIMESTAMP},
}

export const TABLE_AUTH = {
  '_name' : 'auth',
  '_id' : 'id',
  '_id_fk' : 'auth_fk',
  'id' : { 'type' : TYPE_INT8, 'null' : false},
  'user_fk' : { 'type' : TYPE_INT8, 'null' : false},
  'user_credential_fk' : { 'type' : TYPE_INT8, 'null' : false},
  'auth' : { 'type' : TYPE_VARCHAR, 'length' : 255},
  'auth_hash' : { 'type' : TYPE_BYTE},
  'timeout' : { 'type' : TYPE_INT4},
  'expire' : { 'type' : TYPE_TIMESTAMP},
  'used' : { 'type' : TYPE_TIMESTAMP},
  'updated' : { 'type' : TYPE_TIMESTAMP},
}