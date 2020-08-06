import Auth from 'dao/Auth'
import User from 'dao/User'
import UserData from 'dao/UserData'
import UserCredential from 'dao/UserCredential'
import Helper from 'Helper'

import { pgp } from 'index'

const QueryResultError = pgp.errors.QueryResultError

async function test() {
  let data = null
  
  data = await User.read({id: 20, app_fk: 14}); console.log(data)
  
  // let email = Security.hash('sha256', 'test@gmail.com').toString('hex')
  // let email_bytes = Buffer.from(email, 'hex')
  
  // data = await UserDAO.createUserAll(email_bytes); console.log(data)
  // data = await User.readByHash(email); console.log(data)
    
  let app = await User.createAppAll(); console.log('app', app)
  let app_version = await User.insert({app_fk: app.app[0].id}); console.log('app_version', app_version) // app[0].id
  let app_version2 = await User.insert({app_fk: app.app[0].id}); console.log('app_version', app_version) // app[0].id
  
  app = await User.read({id: app.app[0].id}); console.log(app)
  
  // Get app
  data = await User.read({uid: app[0].uid}); console.log(data, data[0].aid.toString('hex'), Buffer.from(data[0].aid.toString('hex'), 'hex'))
  data = await User.read({aid: Buffer.from(data[0].aid.toString('hex'), 'hex')}); console.log(data)
  
  data = await User.update({app_version : '1.1', os_type : 1, init : null, _where : {id : app_version.id, app_fk: app[0].id}}); console.log(data)
  data = await User.update({app_version : '1.1', os_type : 1, init : null, _where : {id : app_version.id, app_fk: app[0].id}}); console.log(data)
  
  data = await User.read({id: {v: [app_version.id,app_version2.id], t:'::bigint[])', c: '= ANY (', 'OR': {id: app_version.id, app_fk: app[0].id}}, app_fk: app[0].id}); console.log(data)
  data = await User.read({id: {v: [app_version.id,app_version2.id], t:'::bigint[])', c: '= ANY (', 'OR': {id: {v: app_version.id, c: '=', 'OR': {id: app_version.id, app_fk: app[0].id}}, app_fk: app[0].id}}, app_fk: app[0].id}); console.log(data)
}

describe('tests: ', () => {
  it('random db tests', (done) => {
    test()
      .then(() =>{
        done()
      }).catch(error => {
        if(error && error instanceof QueryResultError){
          console.error('EMPTY:', error.received)
        } else {
          console.error('app->test(): ERROR:', error)
        }
      
      })
  })
})