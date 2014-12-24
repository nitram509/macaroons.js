/// <reference path="../../typings/tsd.d.ts" />
import Macaroon = require('./Macaroon');
export = MacaroonsVerifier;
/**
 * Used to verify Macaroons
 */
declare class MacaroonsVerifier {
    "use strict": any;
    private predicates;
    private boundMacaroons;
    private generalCaveatVerifiers;
    private macaroon;
    constructor(macaroon: Macaroon);
    assertIsValid(secret: string): void;
    /**
     * @param secret secret this secret will be enhanced, in case it's shorter than {@link MacaroonsConstants.MACAROON_SUGGESTED_SECRET_LENGTH}
     * @return true/false if the macaroon is valid
     */
    isValid(secret: string): boolean;
    /**
     * Caveats like these are called "exact caveats" because there is exactly one way
     * to satisfy them.  Either the given caveat matches, or it doesn't.  At
     * verification time, the verifier will check each caveat in the macaroon against
     * the list of satisfied caveats provided to satisfyExact(String).
     * When it finds a match, it knows that the caveat holds and it can move onto the next caveat in
     * the macaroon.
     *
     * @param caveat caveat
     * @return this {@link MacaroonsVerifier}
     */
    satisfyExact(caveat: string): MacaroonsVerifier;
    /**
     * Another technique for informing the verifier that a caveat is satisfied
     * allows for expressive caveats. Whereas exact caveats are checked
     * by simple byte-wise equality, general caveats are checked using
     * an application-provided callback that returns true if and only if the caveat
     * is true within the context of the request.
     * There's no limit on the contents of a general caveat,
     * so long as the callback understands how to determine whether it is satisfied.
     * This technique is called "general caveats".
     *
     * @param generalVerifier generalVerifier a function(caveat:string):boolean which does the verification
     * @return this {@link MacaroonsVerifier}
     */
    satisfyGeneral(generalVerifier: (caveat: string) => boolean): MacaroonsVerifier;
    private isValid_verify_raw(M, secret);
    private macaroon_verify_inner(M, key);
    private findBoundMacaroon(identifier);
    private verifiesGeneral(caveat);
    private static containsElement(elements, anElement);
}
