export default class Sql {
  
  /**
   * 
   * @param {*} options 
   */
  static insert(options) {
    let qs = 'INSERT INTO "' + options.table._name + '"' + '("'+ options.columns.join('","') +'") VALUES'+ '(' + options.indices.join(',') + ') '
    if(options.conflicts && options.conflicts.length > 0){
      qs += Sql.insertConflicts(options)
    }
    if(options.returning) qs += ' RETURNING ' + (Array.isArray(options.returning) ? options.returning.join(',') : options.returning) +' '
    // console.log(qs)
    return qs
  }

  /**
   * 
   * @param {*} options 
   */
  static insertBatch(options) {
    let qs = 'INSERT INTO "' + options.table._name + '"' + '("'+ options.columns.join('","') +'") VALUES'
    let index = null
    qs += '(' + options.indices[0].join(',') + ')'
    for(let i = 1; i < options.indices.length; i++){
      index = options.indices[i]
      qs += ',(' + index.join(',') + ')'
    }
    if(options.conflicts && options.conflicts.length > 0){
      qs += Sql.insertConflicts(options)
    }
    if(options.returning) qs += ' RETURNING ' + (Array.isArray(options.returning) ? options.returning.join(',') : options.returning) +' '
    return qs
  }

  /**
   * Update SQL 
   * 
   * @param {*} options 
   */
  static update(options) {
    let qs = 'UPDATE "' + options.table._name + '" SET '
    qs += options.columns[0] + ' = ' + options.indices[0]
    for(let i = 1; i < options.indices.length; i++){
      qs += ',' + options.columns[i] + ' = ' + options.indices[i]
    }
    if(options.where){
      qs += typeof options.where === 'object' ? Sql.where_exact(options) : Sql.where_list(options)
      options.values = {...options.values, ...options.where.values}
    }
    if(options.returning) qs += ' RETURNING '+ (Array.isArray(options.returning) ? options.returning.join(',') : options.returning) +' '
    // console.log(qs)
    return qs
  }

  /**
   * Delete SQL 
   * 
   * @param {*} options 
   */
  static delete(options) {
    let qs = ''
    if(options.where){
      qs = 'DELETE FROM "' + options.table._name + '" '
      qs += typeof options.where === 'object' ? Sql.where_exact(options) : Sql.where_list(options)
      options.values = {...options.values, ...options.where.values}
    } else {
      throw Error ('Sql->delete: NO DATA!!')
    }
    if(options.returning) qs += ' RETURNING '+ (Array.isArray(options.returning) ? options.returning.join(',') : options.returning) +' '
    // console.log(qs)
    return qs
  }

  /**
   * 
   * @param {*} options 
   * @param {*} operator 
   */
  static where_list(options, operator = 'AND'){
    let qs = ''
    if(options.where && options.where.length > 0){
      qs += ' WHERE (('+ options.where[0] + ') '
      for(let i = 1; i < options.where.length; i++){
        qs += operator + ' ('+ options.where[i] + ') '
      }
      qs += ') '
    }
    return qs
  }

  /**
   * 
   * @param {*} options 
   * @param {*} separator 
   * @param {*} operator 
   */
  static where_exact(options, separator = '=', operator = 'AND'){
    let qs = ''
    if(options.where.columns && options.where.columns.length > 0){
      qs += ' WHERE ( ('+ options.where.columns[0] + ' ' + separator + ' ' + options.where.indices[0] + ' ) '
      for(let i = 1; i < options.where.columns.length; i++){
        qs += operator + ' ('+ options.where.columns[i] + ' ' + separator + ' ' + options.where.indices[i] + ' ) '
      }
      qs += ') '
    }
    return qs
  }

  /**
   * 
   * @param {*} options 
   */
  static insertConflicts(options){
    let qs = 'ON CONFLICT '
    if(options.constraint){
      qs += ' ON CONSTRAINT ' + options.constraint + ' '
    } else if(options.conflicts.length > 0){
      qs += '("'+options.conflicts.join('","')+'")'
    }
    if(options.where && options.where.length > 0){
      qs += !Array.isArray(options.where) ? Sql.where_exact(options) : Sql.where_list(options)
    }
    qs += ' DO UPDATE SET '
    let value = options.columns[0]
    qs += '"'+ value + '" = EXCLUDED."' + value + '" ' 
    for(let i = 1; i < options.columns.length; i++){
      value = options.columns[i]
      qs += ',"'+ value + '" = EXCLUDED."' + value + '" ' 
    }
    return qs
  }
}