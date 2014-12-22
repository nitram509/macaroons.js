/*
 * Copyright 2014 Martin W. Kirst
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/// <reference path="../../typings/tsd.d.ts" />

declare var require; // TODO: bad hack to make TSC compile, possible reason https://github.com/Microsoft/TypeScript/issues/954
var crypto = require('crypto');

import MacaroonsContants = require('./MacaroonsConstants');

export = CryptoTools;
class CryptoTools {

  public static generate_derived_key(variableKey:string):Buffer {
    var MACAROONS_MAGIC_KEY = "macaroons-key-generator";
    return CryptoTools.macaroon_hmac(new Buffer(MACAROONS_MAGIC_KEY, "utf-8"), new Buffer(variableKey, MacaroonsContants.IDENTIFIER_CHARSET));
  }

  public static macaroon_hmac(key:Buffer, message:string):Buffer;
  public static macaroon_hmac(key:Buffer, message:Buffer):Buffer;
  public static macaroon_hmac(key:Buffer, message:any):Buffer {
    if (typeof message === 'undefined') throw "Missing second parameter 'message'.";

    var mac = crypto.createHmac('sha256', key);
    if (typeof message === 'string') {
      mac.update(new Buffer(message, MacaroonsContants.IDENTIFIER_CHARSET));
    } else {
      mac.update(message);
    }
    return mac.digest();
  }

  public static macaroon_hash2(key:Buffer, message1:Buffer, message2:Buffer):Buffer {
    var tmp = new Buffer(2 * MacaroonsContants.MACAROON_HASH_BYTES);
    CryptoTools.macaroon_hmac(key, message1).copy(tmp, 0, 0, MacaroonsContants.MACAROON_HASH_BYTES);
    CryptoTools.macaroon_hmac(key, message2).copy(tmp, 0, MacaroonsContants.MACAROON_HASH_BYTES, MacaroonsContants.MACAROON_HASH_BYTES + MacaroonsContants.MACAROON_HASH_BYTES);
    return CryptoTools.macaroon_hmac(key, tmp);
  }

}