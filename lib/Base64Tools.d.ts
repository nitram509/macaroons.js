export = Base64Tools;
declare class Base64Tools {
    private static BASE64_PADDING;
    static transformBase64UrlSafe2Base64(base64: string): string;
    static encodeBase64UrlSafe(base64: string): string;
}
