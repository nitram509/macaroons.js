/// <reference types="node" />
import Macaroon = require('./Macaroon');
export = MacaroonsVerifier;
declare class MacaroonsVerifier {
    "use strict": any;
    private predicates;
    private boundMacaroons;
    private generalCaveatVerifiers;
    private macaroon;
    constructor(macaroon: Macaroon);
    assertIsValid(secret: string): void;
    assertIsValid(secret: Buffer): void;
    isValid(secret: string): boolean;
    isValid(secret: Buffer): boolean;
    satisfyExact(caveat: string): MacaroonsVerifier;
    satisfy3rdParty(preparedMacaroon: Macaroon): MacaroonsVerifier;
    satisfyGeneral(generalVerifier: (caveat: string) => boolean): MacaroonsVerifier;
    private isValid_verify_raw;
    private macaroon_verify_inner;
    private macaroon_verify_inner_3rd;
    private findBoundMacaroon;
    private verifiesGeneral;
    private static containsElement;
}
