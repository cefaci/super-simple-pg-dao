// ----------------------------------------------------------------------
import InitDAO from './InitDAO'

export async function init(){
  await InitDAO.init()

  console.log('\x1b[32mWorker\x1b[0m','\x1b[33m'+process.pid+'\x1b[0m','starting in mode:', process.env.NODE_ENV)
}

init()