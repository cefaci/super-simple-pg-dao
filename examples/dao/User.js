import { 
  TABLE_USER
} from '../tables'

import UserCredential from './UserCredential'
import UserData from './UserData'
import Auth from './Auth'
import { DBClass } from 'super-simple-pg-dao'

class UserClass extends DBClass {
  constructor(){ super(TABLE_USER) }

  prepareInsertQueries(data = { user: {}}){
    let prepared = super.prepareInsertQueries(data.user) // [queries, options]

    if(data.user_credential){
      prepared.push(UserCredential.prepareInsert(data.user_credential))
    }
    if(data.user_data){
      prepared.push(UserData.prepareInsert(data.user_data))
    }
    if(data.auth){
      prepared.push(Auth.prepareInsert(data.auth))
    }
    
    return prepared
  }

  prepareCreateUser(data, auth, user_data){
    console.log('prepareCreateUser', data)

    data.key = Buffer.from(data.key, 'hex')
    data.salt = Buffer.from(data.salt, 'hex')

    let user = {
      user_credential : data, 
      auth : {auth : auth.auth},
      user_data : {user_data : user_data.user_data},
      user : {role_fk : 1, type_fk : 1, activated : false, enabled : false},
    }
    return user
  }
}

const User = new UserClass()
export default User