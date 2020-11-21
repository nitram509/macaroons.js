/// <reference types="node" />
import Macaroon = require('./Macaroon');
export = MacaroonsBuilder;
declare class MacaroonsBuilder {
    "use strict": any;
    private macaroon;
    constructor(location: string, secretKey: string, identifier: string);
    constructor(location: string, secretKey: Buffer, identifier: string);
    constructor(macaroon: Macaroon);
    static modify(macaroon: Macaroon): MacaroonsBuilder;
    getMacaroon(): Macaroon;
    static create(location: string, secretKey: string, identifier: string): Macaroon;
    static create(location: string, secretKey: Buffer, identifier: string): Macaroon;
    static deserialize(serializedMacaroon: string): Macaroon;
    add_first_party_caveat(caveat: string): MacaroonsBuilder;
    add_third_party_caveat(location: string, secret: string, identifier: string): MacaroonsBuilder;
    prepare_for_request(macaroon: Macaroon): MacaroonsBuilder;
    private computeMacaroon;
}
