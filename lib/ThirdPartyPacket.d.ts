export = ThirdPartyPacket;
declare class ThirdPartyPacket {
    signature: Buffer;
    vid_data: Buffer;
    constructor(signature: Buffer, vid_data: Buffer);
}
