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
 * Describes how to lookup the provider, when "global", use a built in generic provider
 * e.g. Google/Microsoft, when "organization", use an organization scoped provider.
 * @export
 */
export const ProviderScope = {
    Global: 'global',
    Organization: 'organization'
} as const;
export type ProviderScope = typeof ProviderScope[keyof typeof ProviderScope];


export function ProviderScopeFromJSON(json: any): ProviderScope {
    return ProviderScopeFromJSONTyped(json, false);
}

export function ProviderScopeFromJSONTyped(json: any, ignoreDiscriminator: boolean): ProviderScope {
    return json as ProviderScope;
}

export function ProviderScopeToJSON(value?: ProviderScope | null): any {
    return value as any;
}

