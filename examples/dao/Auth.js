/*
 * Copyright (c) 2016-present, cefaci <25903524+cefaci@users.noreply.github.com>
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Removal or modification of this copyright notice is prohibited.
 */
import { 
  TABLE_AUTH
} from '../tables'

import { DBClass } from 'super-simple-pg-dao'
import moment from 'moment'
export const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss.SSS'
import Helper from 'Helper'

class AuthClass extends DBClass {
  constructor(){ super(TABLE_AUTH) }

  prepareInsert(data = {}, default_value = true){
    // let time = (new Date()).toUTCString()
    if(typeof data.auth      === 'undefined') data.auth      = Helper.randomInt(100000, 999999) + ''
    if(typeof data.auth_hash === 'undefined') data.auth_hash = Helper.getHash(data.auth)
    if(typeof data.timeout   === 'undefined') data.timeout   = 180 // seconds
    if(typeof data.expire    === 'undefined') data.expire    = moment().utc().add(data.timeout, 's').format(DATETIME_FORMAT).toString()
    data.updated = 'NOW()'
    return super.prepareInsert(data, default_value)
  }
}

const Auth = new AuthClass()
export default Auth