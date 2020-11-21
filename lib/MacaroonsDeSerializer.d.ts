import Macaroon = require('./Macaroon');
export = MacaroonsDeSerializer;
declare class MacaroonsDeSerializer {
    static deserialize(serializedMacaroon: string): Macaroon;
    private static deserializeStream;
    private static parseSignature;
    private static parsePacket;
    private static parseRawPacket;
    private static bytesStartWith;
    private static readPacket;
}
