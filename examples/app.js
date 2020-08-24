/*
 * Copyright (c) 2016-present, cefaci <25903524+cefaci@users.noreply.github.com>
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Removal or modification of this copyright notice is prohibited.
 */
import InitDAO from './InitDAO'

export async function init(){
  await InitDAO.init()

  console.log('\x1b[32mWorker\x1b[0m','\x1b[33m'+process.pid+'\x1b[0m','starting in mode:', process.env.NODE_ENV)
}

init()