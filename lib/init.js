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