export = Macaroon;
import CaveatPacket = require('./CaveatPacket');
/**
 * <p>
 * Macaroons: Cookies with Contextual Caveats for Decentralized Authorization in the Cloud
 * </p>
 * This is an immutable and serializable object.
 * Use {@link MacaroonsBuilder} to modify it.
 * Use {@link MacaroonsVerifier} to verify it.
 *
 * @see <a href="http://research.google.com/pubs/pub41892.html">http://research.google.com/pubs/pub41892.html</a>
 */
declare class Macaroon {
    location: string;
    identifier: string;
    signature: string;
    signatureBuffer: Buffer;
    caveatPackets: CaveatPacket[];
    constructor(location: string, identifier: string, signature: Buffer, caveats?: CaveatPacket[]);
    serialize(): string;
    inspect(): string;
    private createKeyValuePacket(type, value);
    private createCaveatsPackets(caveats);
}
