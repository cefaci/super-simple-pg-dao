import Auth from 'dao/Auth'
import User from 'dao/User'
import UserData from 'dao/UserData'
import UserCredential from 'dao/UserCredential'
import Helper from 'Helper'

const { db, pgp, db_check} = require('index')
import {DB} from 'super-simple-pg-dao'
import InitDAO from 'InitDAO'

describe('DB tests: ', () => {
  beforeAll(async(done) => {
    let version = await db_check(db)

    expect(version).not.toBeNull()
    done()
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
    let data = await InitDAO.init()

    expect(data).toBeTruthy()
    expect(data[0].name).toBe('test')
  }, 30000)

  test.skip('DB init drop & create', async() => {
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
  })

  test('DB read user test 10 times TASK', async(done) => {
    await db.task('read10timesTask', async t => {
      let data = null
    
      for(let i = 0; i < 10; i++){
        data = await User.readTask(t, {name: 'test'})

        expect(data).toBeTruthy()
        expect(data[0]).toBeTruthy()
        expect(data[0].id).toBeGreaterThanOrEqual(1)
        expect(data[0].name).toBe('test')
      }
      return data
    }).then(() => {
      done()
    })
  })

  test('DB read user complex', async(done) => {
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
    
    done()
  })

  test('DB read user complex TASK', async(done) => {
    await db.task('read10timesTask', async t => {
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
    
    }).then(() => {
      done()
    })
  })
})