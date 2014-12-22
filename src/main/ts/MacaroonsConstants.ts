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

export = MacaroonsConstants;

class MacaroonsConstants {
  /* public constants ... copied from libmacaroons */

  /**
   * All byte strings must be less than this length.
   * Enforced via "assert" internally.
   */
  public static MACAROON_MAX_STRLEN:number = 32768;
  /**
   * Place a sane limit on the number of caveats
   */
  public static MACAROON_MAX_CAVEATS:number = 65536;
  /**
   * Recommended secret length
   */
  public static MACAROON_SUGGESTED_SECRET_LENGTH:number = 32;
  public static MACAROON_HASH_BYTES:number = 32;

  /* ********************************* */
  /* more internal use ... */
  /* ********************************* */

  public static PACKET_PREFIX_LENGTH:number = 4;
  public static PACKET_MAX_SIZE:number = 65535;

  public static MACAROON_SECRET_KEY_BYTES:number = 32;
  public static MACAROON_SECRET_NONCE_BYTES:number = 24;

  /**
   * The number of zero bytes required by crypto_secretbox
   * before the plaintext.
   */
  public static MACAROON_SECRET_TEXT_ZERO_BYTES:number = 32;
  /**
   * The number of zero bytes placed by crypto_secretbox
   * before the ciphertext
   */
  public static MACAROON_SECRET_BOX_ZERO_BYTES:number = 16;

  public static SECRET_BOX_OVERHEAD:number = MacaroonsConstants.MACAROON_SECRET_TEXT_ZERO_BYTES - MacaroonsConstants.MACAROON_SECRET_BOX_ZERO_BYTES;
  public static VID_NONCE_KEY_SZ:number = MacaroonsConstants.MACAROON_SECRET_NONCE_BYTES + MacaroonsConstants.MACAROON_HASH_BYTES + MacaroonsConstants.SECRET_BOX_OVERHEAD;

  public static LOCATION:string = "location";
  public static LOCATION_BYTES:Buffer = new Buffer(MacaroonsConstants.LOCATION, 'ascii');

  public static IDENTIFIER:string = "identifier";
  public static IDENTIFIER_BYTES:Buffer = new Buffer(MacaroonsConstants.IDENTIFIER, 'ascii');

  public static SIGNATURE:string = "signature";
  public static SIGNATURE_BYTES:Buffer = new Buffer(MacaroonsConstants.SIGNATURE, 'ascii');

  public static CID:string = "cid";
  public static CID_BYTES:Buffer = new Buffer(MacaroonsConstants.CID, 'ascii');

  public static VID:string = "vid";
  public static VID_BYTES:Buffer = new Buffer(MacaroonsConstants.VID, 'ascii');

  public static CL:string = "cl";
  public static CL_BYTES:Buffer = new Buffer(MacaroonsConstants.CL, 'ascii');

  public static LINE_SEPARATOR_STR:string = '\n';
  public static LINE_SEPARATOR:number = MacaroonsConstants.LINE_SEPARATOR_STR.charCodeAt(0);
  public static LINE_SEPARATOR_LEN:number = 1;

  public static KEY_VALUE_SEPARATOR_STR:string = ' ';
  public static KEY_VALUE_SEPARATOR:number = MacaroonsConstants.KEY_VALUE_SEPARATOR_STR.charCodeAt(0);
  public static KEY_VALUE_SEPARATOR_LEN:number = 1;

  public static IDENTIFIER_CHARSET:string = "utf8";
}