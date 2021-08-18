/*
 * Copyright (c) 2016-present, cefaci <25903524+cefaci@users.noreply.github.com>
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Removal or modification of this copyright notice is prohibited.
 */
const DROP_DATABASE = false // set to true to recreate all

import Auth from 'dao/Auth'
import User from 'dao/User'
// import UserData from 'dao/UserData'
import UserCredential from 'dao/UserCredential'
import Helper from 'Helper'
import { 
  TABLE_USER, 
  TABLE_USER_CREDENTIAL,
  TABLE_USER_DATA,
} from 'tables'

const { db, pgp, db_check} = require('index')
import {DB, Preparation} from 'super-simple-pg-dao'
import InitDAO from 'InitDAO'

describe('DB tests: ', () => {
  beforeAll(async() => {
    let version = await db_check(db)

    expect(version).not.toBeNull()
    return true
  })
  afterAll(done => {
    done(pgp.end())
  })

  test('DB connected', async() => {
    // const {DB} = require('super-simple-pg-dao')
    const result = DB.test()

    expect(result.pgp).toBe(true)
    expect(result.db).toBe(true)
  })

  test('DB init check', async() => {
    let data = await InitDAO.init(DROP_DATABASE)

    expect(data).toBeTruthy()
    expect(data[0].name).toBe('test')
  }, 30000)

  test('DB init drop & create', async() => {
    let data = await InitDAO.init(true)

    expect(data).toBeTruthy()
    expect(data.user).toBeTruthy()
    expect(data.user[0].id).toBeGreaterThanOrEqual(1)
  }, 30000)

  test('DB read user test', async() => {
    let data = await User.read({name: 'test'})

    expect(data).toBeTruthy()
    expect(data[0]).toBeTruthy()
    expect(data[0].id).toBeGreaterThanOrEqual(1)
    expect(data[0].name).toBe('test')
  })

  test('DB read user test and different attributes', async() => {
    let data = await User.read({name: 'test'})

    expect(data).toBeTruthy()
    expect(data[0]).toBeTruthy()
    expect(data[0].id).toBeGreaterThanOrEqual(1)
    expect(data[0].name).toBe('test')

    data = await User.read({id: data[0].id, enabled : data[0].enabled, comment : data[0].comment, role_fk : data[0].role_fk})

    expect(data).toBeTruthy()
    expect(data[0]).toBeTruthy()
    expect(data[0].id).toBeGreaterThanOrEqual(1)
    expect(data[0].name).toBe('test')
  })

  test('DB read user test 10 times', async() => {
    let data = null
    
    for(let i = 0; i < 10; i++){
      data = await User.read({name: 'test'})

      expect(data).toBeTruthy()
      expect(data[0]).toBeTruthy()
      expect(data[0].id).toBeGreaterThanOrEqual(1)
      expect(data[0].name).toBe('test')
    }
  }, 30000)

  test('DB read user test 10 times TASK', async() => {
    return await db.task('read10timesTask', async t => {
      let data = null
    
      for(let i = 0; i < 10; i++){
        data = await User.readTask(t, {name: 'test'})

        expect(data).toBeTruthy()
        expect(data[0]).toBeTruthy()
        expect(data[0].id).toBeGreaterThanOrEqual(1)
        expect(data[0].name).toBe('test')
      }
      return data
    })
  }, 30000)

  test('DB read user complex', async() => {
    let data = await User.read({name: 'test'})
    
    expect(data).toBeTruthy()
    expect(data[0]).toBeTruthy()
    expect(data[0].id).toBeGreaterThanOrEqual(1)
    expect(data[0].name).toBe('test')

    data = await User.read({id: {v: [0,data[0].id], t:'::bigint[])', c: '= ANY (', 'OR': {id: data[0].id, type_fk: data[0].type_fk}}, type_fk: 1})
    // console.log(data)

    expect(data).toBeTruthy()
    expect(data[0]).toBeTruthy()
    expect(data[0].id).toBeGreaterThanOrEqual(1)
    expect(data[0].name).toBe('test')

    data = await User.read({id: {v: [0,data[0].id], t:'::bigint[])', c: '= ANY (', 'OR': {id: {v: data[0].id, c: '=', 'OR': {id: data[0].id, type_fk: data[0].type_fk}}, type_fk: data[0].type_fk}}, type_fk: data[0].type_fk})
    // console.log(data)

    expect(data).toBeTruthy()
    expect(data[0]).toBeTruthy()
    expect(data[0].id).toBeGreaterThanOrEqual(1)
    expect(data[0].name).toBe('test')
    
    return true
  })

  test('DB read user complex TASK', async() => {
    return await db.task('read10timesTask', async t => {
      let data = await User.readTask(t, {name: 'test'})
      
      expect(data).toBeTruthy()
      expect(data[0]).toBeTruthy()
      expect(data[0].id).toBeGreaterThanOrEqual(1)
      expect(data[0].name).toBe('test')

      data = await User.readTask(t, {id: {v: [0,data[0].id], t:'::bigint[])', c: '= ANY (', 'OR': {id: data[0].id, type_fk: data[0].type_fk}}, type_fk: 1})
      // console.log(data)

      expect(data).toBeTruthy()
      expect(data[0]).toBeTruthy()
      expect(data[0].id).toBeGreaterThanOrEqual(1)
      expect(data[0].name).toBe('test')

      data = await User.readTask(t, {id: {v: [0,data[0].id], t:'::bigint[])', c: '= ANY (', 'OR': {id: {v: data[0].id, c: '=', 'OR': {id: data[0].id, type_fk: data[0].type_fk}}, type_fk: data[0].type_fk}}, type_fk: data[0].type_fk})
      // console.log(data)

      expect(data).toBeTruthy()
      expect(data[0]).toBeTruthy()
      expect(data[0].id).toBeGreaterThanOrEqual(1)
      expect(data[0].name).toBe('test')
      
      return true
    })
  }, 30000)

  test('DB insert user', async() => {
    const name = 'test::' + new Date().getTime() + '::' +  Math.floor(Math.random() * (888889) + 100000)
    let data = await User.insert({name: name})

    expect(data).toBeTruthy()
    expect(data.id).toBeGreaterThanOrEqual(1)

    let id = data.id
    data = await User.read({name: name})
      
    expect(data).toBeTruthy()
    expect(data[0]).toBeTruthy()
    expect(data[0].id).toEqual(id)
    expect(data[0].name).toBe(name)
  })

  test('DB insert then update', async() => {
    const name = 'test::' + new Date().getTime() + '::' +  Math.floor(Math.random() * (888889) + 100000)
    let data = await User.insert({name: name})

    expect(data).toBeTruthy()
    expect(data.id).toBeGreaterThanOrEqual(1)

    console.log('insert', data)

    let id = data.id
    
    data = await User.update({comment : '1.1', activated : true, enabled : true, _where : {id : data.id, name: name}})
    expect(data).toBeTruthy()
    expect(data.id).toEqual(id)
    
    const nameNEW = 'testNEW::' + new Date().getTime() + '::' +  Math.floor(Math.random() * (888889) + 100000)
    data = await User.update({comment : '1.2', name : nameNEW, activated : true, enabled : true, updated : 'NOW()', _where : {id : data.id, name: name}})
    expect(data).toBeTruthy()
    expect(data.id).toEqual(id)

    data = await User.read({name: nameNEW})
    expect(data).toBeTruthy()
    expect(data[0].id).toEqual(id)
    expect(data[0].name).toBe(nameNEW)
  })

  test('DB insert then delete', async() => {
    const name = 'testDELETE::' + new Date().getTime() + '::' +  Math.floor(Math.random() * (888889) + 100000)
    let data = await User.insert({name: name})

    expect(data).toBeTruthy()
    expect(data.id).toBeGreaterThanOrEqual(1)

    let id = data.id

    console.log('insert/delete 0', data)

    data = await User.read({name: name})
    expect(data).toBeTruthy()
    expect(data[0].id).toEqual(id)
    expect(data[0].name).toBe(name)

    console.log('insert/delete 1', data)
    
    data = await User.delete({_where : {id : data[0].id, name: name}})
    expect(data).toBeTruthy()
    expect(data.id).toEqual(id)

    console.log('insert/delete 2', data)
  }, 30000)

  test('DB insert conflict same UNIQUE user FAIL', async() => {
    const name = 'test'
    let user = {
      name : name,
      type_fk : 1, // SERVER
      role_fk : 90, // SUPERADMIN
      activated : true, 
      enabled : true,
      comment : 'server',
    }
    await expect(User.insert(user)).rejects.toThrow()
  }, 10000)

  test('DB insert conflict same UNIQUE user SUCCESS', async() => {
    const name = 'test'
    let user = {
      name : name,
      type_fk : 100, // SERVER
      role_fk : 200, // SUPERADMIN
      activated : true, 
      enabled : true,
      comment : 'server300',
    }

    let prepared = User.prepareInsert(user)
    prepared.conflicts.push('name')
    prepared.where = []
    prepared.where.push('enabled IS TRUE AND name IS NOT NULL')

    let data = await DB.query(DB.insert, prepared, prepared.values)
    console.log(data)
    expect(data).toBeTruthy()

    let dataRead = await User.read({name: name})
    expect(dataRead).toBeTruthy()
    expect(dataRead[0].name).toBe(name)

    expect(dataRead[0].id).toBe(data.id)
  }, 10000)


  test('DB update same UNIQUE user SUCCESS', async() => {
    const name = 'test'
    let user = {
      type_fk : 1, // SERVER
      role_fk : 300, // SUPERADMIN
      activated : true, 
      enabled : true,
      comment : 'server500',
      _where : {
        name : name
      }
    }

    let prepared = User.prepareUpdate(user)
    let data = await DB.query(DB.update, prepared, prepared.values)
    console.log(data)
    expect(data).toBeTruthy()

    let dataRead = await User.read({name: name})
    expect(dataRead).toBeTruthy()
    expect(dataRead[0].name).toBe(name)

    expect(dataRead[0].id).toBe(data.id)
  }, 10000)

  test('DB insert "cascade"', async() => {
    const name = 'testINSERTCASCADE::' + new Date().getTime() + '::' +  Math.floor(Math.random() * (888889) + 100000)
    let salt = Helper.getHash(Buffer.concat([Helper.createRandom(32), Helper.createRandom(32)], 64))
    let key = Helper.createKey('balalbalalba', salt) // PBKDF2_SHA512_10000_64

    let data = {
      // USER
      user_credential: {
        key : key,
        type_fk : 2,
        type_key_fk : 2, // PBKDF2_SHA512_10000_64
        enabled : true,
      }, 
      user_data: {
        value : {'hello' : 'hello11', 'user' : 'yes11'},
        type_fk : 2,
        enabled : true,
      },  
      auth : {},
      user : {
        name : name,
        type_fk : 2, // SERVER
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
    data = await DB.queryTxBatchStepWithReturnFK(queries)
    console.log('insert "cascade" 1', data)
    expect(data).toBeTruthy()
    expect(data.user[0].id).toBeGreaterThanOrEqual(1)
    let id = data.user[0].id

    data = await User.read({name: name})
    expect(data).toBeTruthy()
    expect(data[0].id).toEqual(id)
    expect(data[0].name).toBe(name)

    console.log('insert "cascade" 1', data)
  }, 30000)

  test('DB create "cascade"', async() => {
    const name = 'testINSERTCASCADE::' + new Date().getTime() + '::' +  Math.floor(Math.random() * (888889) + 100000)
    let salt = Helper.getHash(Buffer.concat([Helper.createRandom(32), Helper.createRandom(32)], 64))
    let key = Helper.createKey('balalbalalba', salt) // PBKDF2_SHA512_10000_64

    let data = {
      // USER
      user_credential: {
        key : key,
        type_fk : 2,
        type_key_fk : 2, // PBKDF2_SHA512_10000_64
        enabled : true,
      }, 
      user_data: {
        value : {'hello' : 'hello11', 'user' : 'yes11'},
        type_fk : 2,
        enabled : true,
      },  
      auth : {},
      user : {
        name : name,
        type_fk : 2, // SERVER
        role_fk : 90, // SUPERADMIN
        activated : true, 
        enabled : true,
        comment : 'server',
      },
    } 

    data = await User.create(data)
    console.log('insert "cascade" 1', data)
    expect(data).toBeTruthy()
    expect(data.user[0].id).toBeGreaterThanOrEqual(1)
    let id = data.user[0].id

    data = await User.read({name: name})
    expect(data).toBeTruthy()
    expect(data[0].id).toEqual(id)
    expect(data[0].name).toBe(name)

    console.log('insert "cascade" 1', data)
  }, 30000)

  test('DB read PS', async() => {
    const name = 'test'
    const type_id = 1
    const limit = 2

    const nameQuery = 'user::readSalt'

    let query = User.getQuery(nameQuery)
    if (!query){
      query = User.createQuery(nameQuery, {
        name : nameQuery,
        text : 'SELECT u.id, u.name, c.id as c_id, c.salt, c.expire, c.created, c.updated '+
              'FROM "' + TABLE_USER._name + '" as u, "' + TABLE_USER_CREDENTIAL._name + '" as c '+
              'WHERE u.id = c.user_fk AND u.name = $1 AND u.type_fk = $2 '+
              ' AND u.enabled IS TRUE AND u.activated IS TRUE AND c.enabled IS TRUE ORDER BY c.expire DESC NULLS LAST LIMIT $3',
      })
    }
    let data = await DB.query(DB.one, query, [name, type_id, limit]) 

    console.log('DB read PS', data)

    expect(data).toBeTruthy()
    expect(data.id).toBeGreaterThanOrEqual(1)
    expect(data.name).toBe(name)
  })

  test('DB read PS complex array', async() => {
    const sample = 100
    const name = 'test'
    const type_id = 1
    const limit = 2

    const nameQuery = 'user::readSalt::complex'

    let query = User.getQuery(nameQuery)
    if (!query){
      query = User.createQuery(nameQuery, {
        name : nameQuery,
        // null the key to not show it
        text : Preparation.select_object({'u':TABLE_USER,'c':TABLE_USER_CREDENTIAL}, {'c': {key: 'null'}}, false) + 
              'FROM "' + TABLE_USER._name + '" as u, "' + TABLE_USER_CREDENTIAL._name + '" as c TABLESAMPLE SYSTEM($1)'+
              'WHERE u.id = c.user_fk AND u.name = $2 AND u.type_fk = $3 '+
              ' AND u.enabled IS TRUE AND u.activated IS TRUE AND c.enabled IS TRUE ORDER BY c.expire DESC NULLS LAST LIMIT $4',
        rowMode : 'array',
      })
    }
    let data = await DB.query(DB.any, query, [sample, name, type_id, limit], [TABLE_USER, TABLE_USER_CREDENTIAL]) 

    console.log('DB read PS', data)

    expect(data).toBeTruthy()
    expect(data[0][0].id).toBeGreaterThanOrEqual(1)
    expect(data[0][0].name).toBe(name)
  })

  test('DB read PS complex array auto select creation', async() => {
    const name = 'test'
    const type_id = 1
    const limit = 2

    const nameQuery = 'user::readSalt::complex::select'

    let query = User.getQuery(nameQuery)
    if (!query){
      query = User.createQuery(nameQuery, {
        name : nameQuery,
        // null the key to not show it
        text : Preparation.select_object({'u':TABLE_USER,'c':TABLE_USER_CREDENTIAL}, {'c': {key: 'null'}}, true) + 
              'WHERE u.id = c.user_fk AND u.name = $1 AND u.type_fk = $2 '+
              ' AND u.enabled IS TRUE AND u.activated IS TRUE AND c.enabled IS TRUE ORDER BY c.expire DESC NULLS LAST LIMIT $3',
        rowMode : 'array',
      })
    }
    let data = await DB.query(DB.any, query, [name, type_id, limit], [TABLE_USER, TABLE_USER_CREDENTIAL]) 

    console.log('DB read PS', data)

    expect(data).toBeTruthy()
    expect(data[0][0].id).toBeGreaterThanOrEqual(1)
    expect(data[0][0].name).toBe(name)
  }, 30000)

  test('DB read PS complex array auto select creation more', async() => {
    const name = 'test'
    const type_id = 1
    const limit = 2

    const nameQuery = 'user::readSalt::complex::select more'

    let query = User.getQuery(nameQuery)
    if (!query){
      query = User.createQuery(nameQuery, {
        name : nameQuery,
        // null the key to not show it
        text : Preparation.select_object({'u':TABLE_USER,'c':TABLE_USER_CREDENTIAL, 'd': TABLE_USER_DATA}, {}, true) + 
              'WHERE u.id = c.user_fk AND u.id = d.user_fk AND u.name = $1 AND u.type_fk = $2 '+
              ' AND u.enabled IS TRUE AND u.activated IS TRUE AND c.enabled IS TRUE ORDER BY c.expire DESC NULLS LAST LIMIT $3',
        rowMode : 'array',
      })
    }
    let data = await DB.query(DB.any, query, [name, type_id, limit], [TABLE_USER, TABLE_USER_CREDENTIAL, TABLE_USER_DATA]) 

    console.log('DB read PS', data)

    expect(data).toBeTruthy()
    expect(data[0][0].id).toBeGreaterThanOrEqual(1)
    expect(data[0][0].name).toBe(name)
  })

  test('DB read PS complex array auto select creation more AND update', async() => {
    const name = 'test'
    const type_id = 1
    const limit = 2

    const nameQuery = 'user::readSalt::complex::select more'

    let query = User.getQuery(nameQuery)
    if (!query){
      query = User.createQuery(nameQuery, {
        name : nameQuery,
        // null the key to not show it
        text : Preparation.select_object({'u':TABLE_USER,'c':TABLE_USER_CREDENTIAL, 'd': TABLE_USER_DATA}, {}, true) + 
              'WHERE u.id = c.user_fk AND u.id = d.user_fk AND u.name = $1 AND u.type_fk = $2 '+
              ' AND u.enabled IS TRUE AND u.activated IS TRUE AND c.enabled IS TRUE ORDER BY c.expire DESC NULLS LAST LIMIT $3',
        rowMode : 'array',
      })
    }
    let data = await DB.query(DB.any, query, [name, type_id, limit], [TABLE_USER, TABLE_USER_CREDENTIAL, TABLE_USER_DATA]) 

    console.log('DB read PS', data)

    expect(data).toBeTruthy()
    expect(data[0][0].id).toBeGreaterThanOrEqual(1)
    expect(data[0][0].name).toBe(name)

    // update keys
    let user_credential_id = data[0][1].id
    let salt = Helper.getHash(Buffer.concat([Helper.createRandom(32), Helper.createRandom(32)], 64))
    let newdata = {
      key : Helper.createKey('newkey', salt),
      salt : salt,
      type_fk : 1,
      type_key_fk : 1,
    }
    data = await UserCredential.update_verified(user_credential_id, data[0][0].id, newdata)

    expect(data).toBeTruthy()
    expect(data[0].id).toEqual(user_credential_id)

    // Re-read and compare key
    query = User.getQuery(nameQuery)
    data = await DB.query(DB.any, query, [name, type_id, limit], [TABLE_USER, TABLE_USER_CREDENTIAL, TABLE_USER_DATA]) 
    expect(data).toBeTruthy()
    expect(data[0][0].id).toBeGreaterThanOrEqual(1)
    expect(data[0][0].name).toBe(name)

    expect(newdata.key.equals(data[0][1].key)).toBe(true)

    console.log(data) 
  })
})