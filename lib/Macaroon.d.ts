/// <reference types="node" />
export = Macaroon;
import CaveatPacket = require('./CaveatPacket');
declare class Macaroon {
    location: string;
    identifier: string;
    signature: string;
    signatureBuffer: Buffer;
    caveatPackets: CaveatPacket[];
    constructor(location: string, identifier: string, signature: Buffer, caveats?: CaveatPacket[]);
    serialize(): string;
    inspect(): string;
    private createKeyValuePacket;
    private createCaveatsPackets;
}
