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
 * Supported signing algorithms.
 * @export
 */
export const SigningAlgorithm = {
    Es512: 'ES512'
} as const;
export type SigningAlgorithm = typeof SigningAlgorithm[keyof typeof SigningAlgorithm];


export function SigningAlgorithmFromJSON(json: any): SigningAlgorithm {
    return SigningAlgorithmFromJSONTyped(json, false);
}

export function SigningAlgorithmFromJSONTyped(json: any, ignoreDiscriminator: boolean): SigningAlgorithm {
    return json as SigningAlgorithm;
}

export function SigningAlgorithmToJSON(value?: SigningAlgorithm | null): any {
    return value as any;
}

