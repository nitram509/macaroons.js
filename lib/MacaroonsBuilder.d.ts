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
     * @param secretKey  a string this secret will be enhanced, in case it's shorter than {@link MacaroonsConstants.MACAROON_SUGGESTED_SECRET_LENGTH}
     * @param identifier identifier
     */
    constructor(location: string, secretKey: string, identifier: string);
    /**
     * @param location   location
     * @param secretKey  a Buffer, that will be used, a minimum length of {@link MacaroonsConstants.MACAROON_SUGGESTED_SECRET_LENGTH} is highly recommended
     * @param identifier identifier
     */
    constructor(location: string, secretKey: Buffer, identifier: string);
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
     * @param secretKey  a secret string
     * @param identifier identifier
     * @return {@link Macaroon}
     */
    static create(location: string, secretKey: string, identifier: string): Macaroon;
    /**
     * @param location   location
     * @param secretKey  a Buffer containing a secret
     * @param identifier identifier
     * @return {@link Macaroon}
     */
    static create(location: string, secretKey: Buffer, identifier: string): Macaroon;
    /**
     * @param serializedMacaroon serializedMacaroon
     * @return {@link Macaroon}
     * @throws Error when serialized macaroon is not valid base64, length is to short or contains invalid packet data
     */
    static deserialize(serializedMacaroon: string): Macaroon;
    /**
     * @param caveat caveat
     * @return this {@link MacaroonsBuilder}
     * @throws Error if there are more than {@link MacaroonsConstants.MACAROON_MAX_CAVEATS} caveats.
     */
    add_first_party_caveat(caveat: string): MacaroonsBuilder;
    /**
     * @param location   location
     * @param secret     secret
     * @param identifier identifier
     * @return this {@link MacaroonsBuilder}
     * @throws Error if there are more than {@link MacaroonsConstants#MACAROON_MAX_CAVEATS} caveats.
     */
    add_third_party_caveat(location: string, secret: string, identifier: string): MacaroonsBuilder;
    /**
     * @param macaroon macaroon used for preparing a request
     * @return this {@link MacaroonsBuilder}
     * @throws Error
     */
    prepare_for_request(macaroon: Macaroon): MacaroonsBuilder;
    private computeMacaroon(location, secretKey, identifier);
    private computeMacaroon(location, secretKey, identifier);
}
