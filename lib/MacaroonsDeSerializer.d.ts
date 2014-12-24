import Macaroon = require('./Macaroon');
export = MacaroonsDeSerializer;
declare class MacaroonsDeSerializer {
    static deserialize(serializedMacaroon: string): Macaroon;
    private static deserializeStream(packetReader);
    private static parseSignature(packet, signaturePacketData);
    private static parsePacket(packet, header);
    private static parseRawPacket(packet, header);
    private static bytesStartWith(bytes, startBytes);
    private static readPacket(stream);
}
