/// <reference path="../../typings/tsd.d.ts" />
import Macaroon = require('./Macaroon');
export = MacaroonsSerializer;
declare class MacaroonsSerializer {
    "use strict": any;
    private static HEX;
    static serialize(macaroon: Macaroon): string;
    private static serialize_packet(type, data);
    private static serialize_packet_buf(type, data);
    private static packet_header(size);
    private static flattenByteArray(bufs);
}
