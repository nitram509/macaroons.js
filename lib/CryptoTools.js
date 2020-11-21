"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var crypto = __importStar(require("crypto"));
var nacl = __importStar(require("ecma-nacl"));
var typedarray_to_buffer_1 = __importDefault(require("typedarray-to-buffer"));
var MacaroonsConstants = require("./MacaroonsConstants");
var ThirdPartyPacket = require("./ThirdPartyPacket");
var CryptoTools = (function () {
    function CryptoTools() {
    }
    CryptoTools.generate_derived_key = function (variableKey) {
        var MACAROONS_MAGIC_KEY = "macaroons-key-generator";
        var magic_key = Buffer.from(MACAROONS_MAGIC_KEY, "utf-8");
        var variable_key = Buffer.from(variableKey, MacaroonsConstants.IDENTIFIER_CHARSET);
        return CryptoTools.macaroon_hmac(magic_key, variable_key);
    };
    CryptoTools.macaroon_hmac = function (key, message) {
        if (typeof message === 'undefined')
            throw new Error("Missing second parameter 'message'.");
        var mac = crypto.createHmac('sha256', key);
        if (typeof message === 'string') {
            mac.update(Buffer.from(message, MacaroonsConstants.IDENTIFIER_CHARSET));
        }
        else {
            mac.update(message);
        }
        return mac.digest();
    };
    CryptoTools.macaroon_hash2 = function (key, message1, message2) {
        var tmp = Buffer.alloc(2 * MacaroonsConstants.MACAROON_HASH_BYTES);
        CryptoTools.macaroon_hmac(key, message1).copy(tmp, 0, 0, MacaroonsConstants.MACAROON_HASH_BYTES);
        CryptoTools.macaroon_hmac(key, message2).copy(tmp, MacaroonsConstants.MACAROON_HASH_BYTES, 0, MacaroonsConstants.MACAROON_HASH_BYTES);
        return CryptoTools.macaroon_hmac(key, tmp);
    };
    CryptoTools.macaroon_add_third_party_caveat_raw = function (old_sig, key, identifier) {
        var derived_key = CryptoTools.generate_derived_key(key);
        var enc_nonce = Buffer.alloc(MacaroonsConstants.MACAROON_SECRET_NONCE_BYTES);
        enc_nonce.fill(0);
        var enc_plaintext = Buffer.alloc(MacaroonsConstants.MACAROON_HASH_BYTES);
        crypto.randomFill(enc_plaintext, function (err, buf) {
            if (err)
                throw err;
        });
        derived_key.copy(enc_plaintext, 0, 0, MacaroonsConstants.MACAROON_HASH_BYTES);
        var enc_ciphertext = CryptoTools.macaroon_secretbox(old_sig, enc_nonce, enc_plaintext);
        var vid = Buffer.alloc(MacaroonsConstants.VID_NONCE_KEY_SZ);
        vid.fill(0);
        enc_nonce.copy(vid, 0, 0, MacaroonsConstants.MACAROON_SECRET_NONCE_BYTES);
        enc_ciphertext.copy(vid, MacaroonsConstants.MACAROON_SECRET_NONCE_BYTES, 0, MacaroonsConstants.VID_NONCE_KEY_SZ - MacaroonsConstants.MACAROON_SECRET_NONCE_BYTES);
        var new_sig = CryptoTools.macaroon_hash2(old_sig, vid, Buffer.from(identifier, MacaroonsConstants.IDENTIFIER_CHARSET));
        return new ThirdPartyPacket(new_sig, vid);
    };
    CryptoTools.macaroon_bind = function (Msig, MPsig) {
        var key = Buffer.alloc(MacaroonsConstants.MACAROON_HASH_BYTES);
        key.fill(0);
        return CryptoTools.macaroon_hash2(key, Msig, MPsig);
    };
    CryptoTools.macaroon_secretbox = function (key, nonce, plaintext) {
        var cipher_bytes = nacl.secret_box.pack(new Uint8Array(plaintext), new Uint8Array(nonce), new Uint8Array(key));
        return typedarray_to_buffer_1.default(cipher_bytes);
    };
    CryptoTools.macaroon_secretbox_open = function (enc_key, enc_nonce, ciphertext) {
        var plain_bytes = nacl.secret_box.open(new Uint8Array(ciphertext), new Uint8Array(enc_nonce), new Uint8Array(enc_key));
        return typedarray_to_buffer_1.default(plain_bytes);
    };
    return CryptoTools;
}());
module.exports = CryptoTools;
