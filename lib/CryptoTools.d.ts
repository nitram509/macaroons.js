/// <reference path="../../typings/tsd.d.ts" />
import ThirdPartyPacket = require('./ThirdPartyPacket');
export = CryptoTools;
declare class CryptoTools {
    static generate_derived_key(variableKey: string): Buffer;
    static macaroon_hmac(key: Buffer, message: string): Buffer;
    static macaroon_hmac(key: Buffer, message: Buffer): Buffer;
    static macaroon_hash2(key: Buffer, message1: Buffer, message2: Buffer): Buffer;
    static macaroon_add_third_party_caveat_raw(old_sig: Buffer, key: string, identifier: string): ThirdPartyPacket;
    static macaroon_bind(Msig: Buffer, MPsig: Buffer): Buffer;
    static macaroon_secretbox(key: Buffer, nonce: Buffer, plaintext: Buffer): Buffer;
    static macaroon_secretbox_open(enc_key: Buffer, enc_nonce: Buffer, ciphertext: Buffer): Buffer;
}
