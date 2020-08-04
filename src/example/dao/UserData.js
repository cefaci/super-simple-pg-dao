import { 
  TABLE_USER_DATA
} from './tables'

import { DBClass } from 'db'

class UserDataClass extends DBClass {
  constructor(){ super(TABLE_USER_DATA) }
}

const UserData = new UserDataClass()
export default UserData