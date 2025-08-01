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

import { exists, mapValues } from '../runtime';
/**
 * A single quota.
 * @export
 * @interface QuotaRead
 */
export interface QuotaRead {
    /**
     * The kind of resource.
     * @type {string}
     * @memberof QuotaRead
     */
    kind: string;
    /**
     * The maximum amount of that resource.
     * @type {number}
     * @memberof QuotaRead
     */
    quantity: number;
    /**
     * The amount of that resource that is used.
     * @type {number}
     * @memberof QuotaRead
     */
    used: number;
    /**
     * The amount of that resource that is free.
     * @type {number}
     * @memberof QuotaRead
     */
    free: number;
    /**
     * The amount of that resource always in use.
     * @type {number}
     * @memberof QuotaRead
     */
    committed: number;
    /**
     * The amount of that resource that may be used e.g. autoscaled.
     * @type {number}
     * @memberof QuotaRead
     */
    reserved: number;
    /**
     * The name that should be displayed to end users.
     * @type {string}
     * @memberof QuotaRead
     */
    displayName: string;
    /**
     * A verbose explanation of what the quota limits.
     * @type {string}
     * @memberof QuotaRead
     */
    description: string;
    /**
     * The default value of the quota.
     * @type {number}
     * @memberof QuotaRead
     */
    _default: number;
}

/**
 * Check if a given object implements the QuotaRead interface.
 */
export function instanceOfQuotaRead(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "kind" in value;
    isInstance = isInstance && "quantity" in value;
    isInstance = isInstance && "used" in value;
    isInstance = isInstance && "free" in value;
    isInstance = isInstance && "committed" in value;
    isInstance = isInstance && "reserved" in value;
    isInstance = isInstance && "displayName" in value;
    isInstance = isInstance && "description" in value;
    isInstance = isInstance && "_default" in value;

    return isInstance;
}

export function QuotaReadFromJSON(json: any): QuotaRead {
    return QuotaReadFromJSONTyped(json, false);
}

export function QuotaReadFromJSONTyped(json: any, ignoreDiscriminator: boolean): QuotaRead {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'kind': json['kind'],
        'quantity': json['quantity'],
        'used': json['used'],
        'free': json['free'],
        'committed': json['committed'],
        'reserved': json['reserved'],
        'displayName': json['displayName'],
        'description': json['description'],
        '_default': json['default'],
    };
}

export function QuotaReadToJSON(value?: QuotaRead | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'kind': value.kind,
        'quantity': value.quantity,
        'used': value.used,
        'free': value.free,
        'committed': value.committed,
        'reserved': value.reserved,
        'displayName': value.displayName,
        'description': value.description,
        'default': value._default,
    };
}

