import { 
  TABLE_USER_CREDENTIAL,
  TABLE_USER,
} from '../tables'

import crypto from 'crypto'
import { Preparation, DB, DBClass } from 'super-simple-pg-dao'
import Helper from 'Helper'

class UserCredentialClass extends DBClass {
  constructor(){ super(TABLE_USER_CREDENTIAL) }

  prepareInsert(data = {}, default_value = true){
    if(typeof data.salt  === 'undefined'){
      data.salt = Helper.getHash(Buffer.concat([Helper.createRandom(32), Helper.createRandom(32)], 64))
    }
    return super.prepareInsert(data, default_value)
  }

  async update_verified(user_credential_id, user_id, data){
    let options = []

    let time = (new Date()).toUTCString()

    data.key = Buffer.from(data.key, 'hex')
    data.salt = Buffer.from(data.salt, 'hex')
    
    options.push(Preparation.update_object(TABLE_USER, {updated : time, _where : {id:user_id}}))
    options.push(Preparation.update_object(TABLE_USER_CREDENTIAL, {key: data.key, salt: data.salt, 
                                                                   type_fk : data.type_fk, type_key_fk : data.type_key_fk, 
                                                                   enabled : true, updated : time, _where : {id:user_credential_id}}))

    return await DB.queryTxBatch(options) 
  }
}

const UserCredential = new UserCredentialClass()
export default UserCredential