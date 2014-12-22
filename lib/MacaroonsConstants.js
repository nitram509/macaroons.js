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
var MacaroonsConstants = (function () {
    function MacaroonsConstants() {
    }
    /* public constants ... copied from libmacaroons */
    /**
     * All byte strings must be less than this length.
     * Enforced via "assert" internally.
     */
    MacaroonsConstants.MACAROON_MAX_STRLEN = 32768;
    /**
     * Place a sane limit on the number of caveats
     */
    MacaroonsConstants.MACAROON_MAX_CAVEATS = 65536;
    /**
     * Recommended secret length
     */
    MacaroonsConstants.MACAROON_SUGGESTED_SECRET_LENGTH = 32;
    MacaroonsConstants.MACAROON_HASH_BYTES = 32;
    /* ********************************* */
    /* more internal use ... */
    /* ********************************* */
    MacaroonsConstants.PACKET_PREFIX_LENGTH = 4;
    MacaroonsConstants.PACKET_MAX_SIZE = 65535;
    MacaroonsConstants.MACAROON_SECRET_KEY_BYTES = 32;
    MacaroonsConstants.MACAROON_SECRET_NONCE_BYTES = 24;
    /**
     * The number of zero bytes required by crypto_secretbox
     * before the plaintext.
     */
    MacaroonsConstants.MACAROON_SECRET_TEXT_ZERO_BYTES = 32;
    /**
     * The number of zero bytes placed by crypto_secretbox
     * before the ciphertext
     */
    MacaroonsConstants.MACAROON_SECRET_BOX_ZERO_BYTES = 16;
    MacaroonsConstants.SECRET_BOX_OVERHEAD = MacaroonsConstants.MACAROON_SECRET_TEXT_ZERO_BYTES - MacaroonsConstants.MACAROON_SECRET_BOX_ZERO_BYTES;
    MacaroonsConstants.VID_NONCE_KEY_SZ = MacaroonsConstants.MACAROON_SECRET_NONCE_BYTES + MacaroonsConstants.MACAROON_HASH_BYTES + MacaroonsConstants.SECRET_BOX_OVERHEAD;
    MacaroonsConstants.LOCATION = "location";
    MacaroonsConstants.LOCATION_BYTES = new Buffer(MacaroonsConstants.LOCATION, 'ascii');
    MacaroonsConstants.IDENTIFIER = "identifier";
    MacaroonsConstants.IDENTIFIER_BYTES = new Buffer(MacaroonsConstants.IDENTIFIER, 'ascii');
    MacaroonsConstants.SIGNATURE = "signature";
    MacaroonsConstants.SIGNATURE_BYTES = new Buffer(MacaroonsConstants.SIGNATURE, 'ascii');
    MacaroonsConstants.CID = "cid";
    MacaroonsConstants.CID_BYTES = new Buffer(MacaroonsConstants.CID, 'ascii');
    MacaroonsConstants.VID = "vid";
    MacaroonsConstants.VID_BYTES = new Buffer(MacaroonsConstants.VID, 'ascii');
    MacaroonsConstants.CL = "cl";
    MacaroonsConstants.CL_BYTES = new Buffer(MacaroonsConstants.CL, 'ascii');
    MacaroonsConstants.LINE_SEPARATOR_STR = '\n';
    MacaroonsConstants.LINE_SEPARATOR = MacaroonsConstants.LINE_SEPARATOR_STR.charCodeAt(0);
    MacaroonsConstants.LINE_SEPARATOR_LEN = 1;
    MacaroonsConstants.KEY_VALUE_SEPARATOR_STR = ' ';
    MacaroonsConstants.KEY_VALUE_SEPARATOR = MacaroonsConstants.KEY_VALUE_SEPARATOR_STR.charCodeAt(0);
    MacaroonsConstants.KEY_VALUE_SEPARATOR_LEN = 1;
    MacaroonsConstants.IDENTIFIER_CHARSET = "utf8";
    return MacaroonsConstants;
})();
module.exports = MacaroonsConstants;
