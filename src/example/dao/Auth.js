import { 
  TABLE_AUTH
} from '../tables'

import { DBClass } from 'db'
import moment from 'moment'
export const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss.SSS'
import crypto from 'crypto'

class AuthClass extends DBClass {
  constructor(){ super(TABLE_AUTH) }

  prepareInsert(data = {}, default_value = true){
    if(typeof data.auth      === 'undefined') data.auth      = AuthClass.randomInt(6, 7) + ''
    if(typeof data.auth_hash === 'undefined') data.auth_hash = AuthClass.getAuthHash(data.auth)
    if(typeof data.timeout   === 'undefined') data.timeout   = 180 // seconds
    if(typeof data.expire    === 'undefined') data.expire    = moment().utc().add(data.timeout, 's').format(DATETIME_FORMAT).toString()
    
    return super.prepareInsert(data, default_value)
  }

  static getAuthHash(value, hash = 'sha256'){
    const hash = crypto.createHash(hash)
    hash.update(input)
    return hash.digest()
  }

  static randomInt(min, max) {
    const buf = crypto.randomBytes(8)
    let random = parseInt(buf.toString('hex'), 16)// buf.readUIntLE(0, 6)
    if(random < 0) random = (-1) * random
    if(random > 1) random = random / MAX_UINTEGER
    // console.log('2: ', random, MAX_UINTEGER, Number.MAX_SAFE_INTEGER)
    return Math.floor(random * (max - min + 1)) + min
  }
}

const Auth = new AuthClass()
export default Auth