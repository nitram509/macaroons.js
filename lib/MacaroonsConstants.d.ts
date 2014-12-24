export = MacaroonsConstants;
declare class MacaroonsConstants {
    /**
     * All byte strings must be less than this length.
     * Enforced via "assert" internally.
     */
    static MACAROON_MAX_STRLEN: number;
    /**
     * Place a sane limit on the number of caveats
     */
    static MACAROON_MAX_CAVEATS: number;
    /**
     * Recommended secret length
     */
    static MACAROON_SUGGESTED_SECRET_LENGTH: number;
    static MACAROON_HASH_BYTES: number;
    static PACKET_PREFIX_LENGTH: number;
    static PACKET_MAX_SIZE: number;
    static MACAROON_SECRET_KEY_BYTES: number;
    static MACAROON_SECRET_NONCE_BYTES: number;
    /**
     * The number of zero bytes required by crypto_secretbox
     * before the plaintext.
     */
    static MACAROON_SECRET_TEXT_ZERO_BYTES: number;
    /**
     * The number of zero bytes placed by crypto_secretbox
     * before the ciphertext
     */
    static MACAROON_SECRET_BOX_ZERO_BYTES: number;
    static SECRET_BOX_OVERHEAD: number;
    static VID_NONCE_KEY_SZ: number;
    static LOCATION: string;
    static LOCATION_BYTES: Buffer;
    static IDENTIFIER: string;
    static IDENTIFIER_BYTES: Buffer;
    static SIGNATURE: string;
    static SIGNATURE_BYTES: Buffer;
    static CID: string;
    static CID_BYTES: Buffer;
    static VID: string;
    static VID_BYTES: Buffer;
    static CL: string;
    static CL_BYTES: Buffer;
    static LINE_SEPARATOR_STR: string;
    static LINE_SEPARATOR: number;
    static LINE_SEPARATOR_LEN: number;
    static KEY_VALUE_SEPARATOR_STR: string;
    static KEY_VALUE_SEPARATOR: number;
    static KEY_VALUE_SEPARATOR_LEN: number;
    static IDENTIFIER_CHARSET: string;
}
