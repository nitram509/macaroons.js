import Macaroon = require('./Macaroon');
export = MacaroonsSerializer;
declare class MacaroonsSerializer {
    "use strict": any;
    private static HEX;
    static serialize(macaroon: Macaroon): string;
    private static serialize_packet;
    private static serialize_packet_buf;
    private static packet_header;
    private static flattenByteArray;
}
