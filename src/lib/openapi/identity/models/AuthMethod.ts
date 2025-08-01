/* tslint:disable */
/* eslint-disable */
/**
 * Identity API
 * The Identity API provides an OIDC compliant interface for use with all official and 3rd party services and proxies.  As its intended use is for multi-tenant cloud deployments, it acts as an aggregation layer for other 3rd party OIDC services, dispatching login requests to the required OIDC backend.  Token introspection forms the basis of role based access control across all APIs.  For security purposes, access tokens and refresh tokens are limited to a single session per client, thus if they are being consumed by a horizontally scalable platform care must be taken to ensure token rotation is handled atomically by a single process, and the tokens are distributed to each service instance synchronously.
 *
 * The version of the OpenAPI document: 1.4.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


/**
 * Supported authentication methods.
 * @export
 */
export const AuthMethod = {
    ClientSecretPost: 'client_secret_post',
    ClientSecretBasic: 'client_secret_basic',
    TlsClientAuth: 'tls_client_auth'
} as const;
export type AuthMethod = typeof AuthMethod[keyof typeof AuthMethod];


export function AuthMethodFromJSON(json: any): AuthMethod {
    return AuthMethodFromJSONTyped(json, false);
}

export function AuthMethodFromJSONTyped(json: any, ignoreDiscriminator: boolean): AuthMethod {
    return json as AuthMethod;
}

export function AuthMethodToJSON(value?: AuthMethod | null): any {
    return value as any;
}

