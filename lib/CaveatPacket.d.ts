import CaveatPacketType = require('./CaveatPacketType');
export = CaveatPacket;
declare class CaveatPacket {
    type: CaveatPacketType;
    rawValue: Buffer;
    private valueAsText;
    constructor(type: CaveatPacketType, valueAsText: string);
    constructor(type: CaveatPacketType, valueAsBuffer: Buffer);
    getRawValue(): Buffer;
    getValueAsText(): string;
}
