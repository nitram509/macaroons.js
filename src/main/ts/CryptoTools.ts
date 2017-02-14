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
var nacl:any = require('ecma-nacl');
var toBuffer:any = require('typedarray-to-buffer');

import MacaroonsConstants = require('./MacaroonsConstants');
import ThirdPartyPacket = require('./ThirdPartyPacket');

export = CryptoTools;
class CryptoTools {

  public static generate_derived_key(variableKey:string):Buffer {
    var MACAROONS_MAGIC_KEY = "macaroons-key-generator";
    return CryptoTools.macaroon_hmac(new Buffer(MACAROONS_MAGIC_KEY, "utf-8"), new Buffer(variableKey, MacaroonsConstants.IDENTIFIER_CHARSET));
  }

  public static macaroon_hmac(key:Buffer, message:string):Buffer;
  public static macaroon_hmac(key:Buffer, message:Buffer):Buffer;
  public static macaroon_hmac(key:Buffer, message:any):Buffer {
    if (typeof message === 'undefined') throw new Error("Missing second parameter 'message'.");

    var mac = crypto.createHmac('sha256', key);
    if (typeof message === 'string') {
      mac.update(new Buffer(message, MacaroonsConstants.IDENTIFIER_CHARSET));
    } else {
      mac.update(message);
    }
    return mac.digest();
  }

  public static macaroon_hash2(key:Buffer, message1:Buffer, message2:Buffer):Buffer {
    var tmp = new Buffer(2 * MacaroonsConstants.MACAROON_HASH_BYTES);
    CryptoTools.macaroon_hmac(key, message1).copy(tmp, 0, 0, MacaroonsConstants.MACAROON_HASH_BYTES);
    CryptoTools.macaroon_hmac(key, message2).copy(tmp, MacaroonsConstants.MACAROON_HASH_BYTES, 0, MacaroonsConstants.MACAROON_HASH_BYTES);
    return CryptoTools.macaroon_hmac(key, tmp);
  }

  public static macaroon_add_third_party_caveat_raw(old_sig:Buffer, key:string, identifier:string):ThirdPartyPacket {
    var derived_key:Buffer = CryptoTools.generate_derived_key(key);

    var enc_nonce:Buffer = new Buffer(MacaroonsConstants.MACAROON_SECRET_NONCE_BYTES);
    enc_nonce.fill(0);
    /* XXX get some random bytes instead */
    var enc_plaintext:Buffer = new Buffer(MacaroonsConstants.MACAROON_HASH_BYTES);
    enc_plaintext.fill(0);
    /* now encrypt the key to give us vid */
    derived_key.copy(enc_plaintext, 0, 0, MacaroonsConstants.MACAROON_HASH_BYTES);

    var enc_ciphertext = CryptoTools.macaroon_secretbox(old_sig, enc_nonce, enc_plaintext);

    var vid:Buffer = new Buffer(MacaroonsConstants.VID_NONCE_KEY_SZ);
    vid.fill(0);
    enc_nonce.copy(vid, 0, 0, MacaroonsConstants.MACAROON_SECRET_NONCE_BYTES);
    enc_ciphertext.copy(vid, MacaroonsConstants.MACAROON_SECRET_NONCE_BYTES, 0, MacaroonsConstants.VID_NONCE_KEY_SZ - MacaroonsConstants.MACAROON_SECRET_NONCE_BYTES);

    var new_sig:Buffer = CryptoTools.macaroon_hash2(old_sig, vid, new Buffer(identifier, MacaroonsConstants.IDENTIFIER_CHARSET));
    return new ThirdPartyPacket(new_sig, vid);
  }

  public static macaroon_bind(Msig:Buffer, MPsig:Buffer):Buffer {
    var key:Buffer = new Buffer(MacaroonsConstants.MACAROON_HASH_BYTES);
    key.fill(0);
    return CryptoTools.macaroon_hash2(key, Msig, MPsig);
  }

  public static macaroon_secretbox(key:Buffer, nonce:Buffer, plaintext:Buffer):Buffer {
    var cipher_bytes = nacl.secret_box.pack(new Uint8Array(<any>plaintext), new Uint8Array(<any>nonce), new Uint8Array(<any>key));
    return toBuffer(cipher_bytes);
  }

  public static macaroon_secretbox_open(enc_key:Buffer, enc_nonce:Buffer, ciphertext:Buffer):Buffer {
    var plain_bytes = nacl.secret_box.open(new Uint8Array(<any>ciphertext), new Uint8Array(<any>enc_nonce), new Uint8Array(<any>enc_key));
    return toBuffer(plain_bytes);
  }

}