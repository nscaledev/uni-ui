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
import type { AclEndpoint } from './AclEndpoint';
import {
    AclEndpointFromJSON,
    AclEndpointFromJSONTyped,
    AclEndpointToJSON,
} from './AclEndpoint';
import type { AclScopedEndpoints } from './AclScopedEndpoints';
import {
    AclScopedEndpointsFromJSON,
    AclScopedEndpointsFromJSONTyped,
    AclScopedEndpointsToJSON,
} from './AclScopedEndpoints';

/**
 * A list of access control scopes and permissions.
 * @export
 * @interface Acl
 */
export interface Acl {
    /**
     * A list of access control scopes.
     * @type {Array<AclEndpoint>}
     * @memberof Acl
     */
    global?: Array<AclEndpoint>;
    /**
     * 
     * @type {AclScopedEndpoints}
     * @memberof Acl
     */
    organization?: AclScopedEndpoints;
    /**
     * A list of resource scoped endpoint permissions.
     * @type {Array<AclScopedEndpoints>}
     * @memberof Acl
     */
    projects?: Array<AclScopedEndpoints>;
}

/**
 * Check if a given object implements the Acl interface.
 */
export function instanceOfAcl(value: object): boolean {
    let isInstance = true;

    return isInstance;
}

export function AclFromJSON(json: any): Acl {
    return AclFromJSONTyped(json, false);
}

export function AclFromJSONTyped(json: any, ignoreDiscriminator: boolean): Acl {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'global': !exists(json, 'global') ? undefined : ((json['global'] as Array<any>).map(AclEndpointFromJSON)),
        'organization': !exists(json, 'organization') ? undefined : AclScopedEndpointsFromJSON(json['organization']),
        'projects': !exists(json, 'projects') ? undefined : ((json['projects'] as Array<any>).map(AclScopedEndpointsFromJSON)),
    };
}

export function AclToJSON(value?: Acl | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'global': value.global === undefined ? undefined : ((value.global as Array<any>).map(AclEndpointToJSON)),
        'organization': AclScopedEndpointsToJSON(value.organization),
        'projects': value.projects === undefined ? undefined : ((value.projects as Array<any>).map(AclScopedEndpointsToJSON)),
    };
}

