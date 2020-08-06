import crypto from 'crypto'

const MAX_UINTEGER = parseInt( Buffer.from([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]).toString('hex'), 16) // Buffer.from([0xff, 0xff, 0xff, 0xff, 0xff, 0xff]).readUIntBE(0, 6)

export default class Helper {
  constructor(){}

  static getHash(value, type = 'sha256'){
    const hash = crypto.createHash(type)
    hash.update(value)
    return hash.digest()
  }

  static randomInt(min, max) {
    const buf = crypto.randomBytes(8)
    let random = parseInt(buf.toString('hex'), 16)// buf.readUIntLE(0, 6)
    if(random < 0) random = (-1) * random
    if(random > 1) random = random / MAX_UINTEGER
    // console.log('2: ', random, MAX_UINTEGER, Number.MAX_SAFE_INTEGER)
    return Math.floor(random * (max - min + 1)) + min
  }

  static createRandom(length){
    if(!length || length <= 0){
      length = 32
    }
    const buf = Buffer.alloc(length)
    return crypto.randomFillSync(buf)
  }

  static createKey(password, salt){
    return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512')
  }
}