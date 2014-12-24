/// <reference path="../../typings/tsd.d.ts" />
import Macaroon = require('./Macaroon');
export = MacaroonsBuilder;
/**
 * Used to build and modify Macaroons
 */
declare class MacaroonsBuilder {
    "use strict": any;
    private macaroon;
    /**
     * @param location   location
     * @param secretKey  secretKey this secret will be enhanced, in case it's shorter than {@link MacaroonsConstants.MACAROON_SUGGESTED_SECRET_LENGTH}
     * @param identifier identifier
     */
    constructor(location: string, secretKey: string, identifier: string);
    /**
     * @param macaroon macaroon to modify
     */
    constructor(macaroon: Macaroon);
    /**
     * @param macaroon macaroon
     * @return {@link MacaroonsBuilder}
     */
    static modify(macaroon: Macaroon): MacaroonsBuilder;
    /**
     * @return a {@link Macaroon}
     */
    getMacaroon(): Macaroon;
    /**
     * @param location   location
     * @param secretKey  secretKey
     * @param identifier identifier
     * @return {@link Macaroon}
     */
    static create(location: string, secretKey: string, identifier: string): Macaroon;
    /**
     * @param serializedMacaroon serializedMacaroon
     * @return {@link Macaroon}
     * @throws Exception when serialized macaroon is not valid base64, length is to short or contains invalid packet data
     */
    static deserialize(serializedMacaroon: string): Macaroon;
    /**
     * @param caveat caveat
     * @return this {@link MacaroonsBuilder}
     * @throws exception if there are more than {@link MacaroonsConstants.MACAROON_MAX_CAVEATS} caveats.
     */
    add_first_party_caveat(caveat: string): MacaroonsBuilder;
    /**
     * @param location   location
     * @param secret     secret
     * @param identifier identifier
     * @return this {@link MacaroonsBuilder}
     * @throws exception if there are more than {@link MacaroonsConstants#MACAROON_MAX_CAVEATS} caveats.
     */
    add_third_party_caveat(location: string, secret: string, identifier: string): MacaroonsBuilder;
    /**
     * @param macaroon macaroon used for preparing a request
     * @return this {@link MacaroonsBuilder}
     * @throws com.github.nitram509.jmacaroons.GeneralSecurityRuntimeException
     */
    prepare_for_request(macaroon: Macaroon): MacaroonsBuilder;
    private computeMacaroon_with_keystring(location, secretKey, identifier);
    private computeMacaroon(location, secretKey, identifier);
}
