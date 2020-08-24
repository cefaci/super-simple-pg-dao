/*
 * Copyright (c) 2016-present, cefaci <25903524+cefaci@users.noreply.github.com>
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Removal or modification of this copyright notice is prohibited.
 */
const exported =  {
  pgp : null,
  db : null,
  init : function(options = {}){
    if(options.pgp && options.db){
      exported.pgp = options.pgp
      exported.db = options.db
    }
    return exported
  }
}
module.exports = exports = exported