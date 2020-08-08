/*
 * Copyright (c) 2016-present, cefaci <25903524+cefaci@users.noreply.github.com>
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Removal or modification of this copyright notice is prohibited.
 */
import { 
  TABLE_USER_DATA
} from '../tables'

import { DBClass } from 'super-simple-pg-dao'

class UserDataClass extends DBClass {
  constructor(){ super(TABLE_USER_DATA) }
}

const UserData = new UserDataClass()
export default UserData