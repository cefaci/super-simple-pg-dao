import { 
  TABLE_USER_DATA
} from '../tables'

import { DBClass } from 'super-simple-pg-dao'

class UserDataClass extends DBClass {
  constructor(){ super(TABLE_USER_DATA) }
}

const UserData = new UserDataClass()
export default UserData