const exported = {
  pgp : null,
  db : null,
  init : function(_pgp, _db) {
    if(!exported.pgp && !exported.db){
      exported.pgp = _pgp
      exported.db = _db
    }
    // console.log('INIT DB', exported.db)
    return exported
  }
}

module.exports = exports = exported