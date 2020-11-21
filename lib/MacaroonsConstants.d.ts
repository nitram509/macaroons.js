/// <reference types="node" />
export = MacaroonsConstants;
declare class MacaroonsConstants {
    static MACAROON_MAX_STRLEN: number;
    static MACAROON_MAX_CAVEATS: number;
    static MACAROON_SUGGESTED_SECRET_LENGTH: number;
    static MACAROON_HASH_BYTES: number;
    static PACKET_PREFIX_LENGTH: number;
    static PACKET_MAX_SIZE: number;
    static MACAROON_SECRET_KEY_BYTES: number;
    static MACAROON_SECRET_NONCE_BYTES: number;
    static MACAROON_SECRET_TEXT_ZERO_BYTES: number;
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
    static IDENTIFIER_CHARSET: BufferEncoding;
}
