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
 * A group.
 * @export
 * @interface GroupSpec
 */
export interface GroupSpec {
    /**
     * A list of strings.
     * @type {Array<string>}
     * @memberof GroupSpec
     */
    userIDs: Array<string>;
    /**
     * A list of strings.
     * @type {Array<string>}
     * @memberof GroupSpec
     */
    serviceAccountIDs: Array<string>;
    /**
     * A list of strings.
     * @type {Array<string>}
     * @memberof GroupSpec
     */
    roleIDs: Array<string>;
}

/**
 * Check if a given object implements the GroupSpec interface.
 */
export function instanceOfGroupSpec(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "userIDs" in value;
    isInstance = isInstance && "serviceAccountIDs" in value;
    isInstance = isInstance && "roleIDs" in value;

    return isInstance;
}

export function GroupSpecFromJSON(json: any): GroupSpec {
    return GroupSpecFromJSONTyped(json, false);
}

export function GroupSpecFromJSONTyped(json: any, ignoreDiscriminator: boolean): GroupSpec {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'userIDs': json['userIDs'],
        'serviceAccountIDs': json['serviceAccountIDs'],
        'roleIDs': json['roleIDs'],
    };
}

export function GroupSpecToJSON(value?: GroupSpec | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'userIDs': value.userIDs,
        'serviceAccountIDs': value.serviceAccountIDs,
        'roleIDs': value.roleIDs,
    };
}

