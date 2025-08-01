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
 * Onboard request options.
 * @export
 * @interface OnboardRequestOptions
 */
export interface OnboardRequestOptions {
    /**
     * Server provided state.
     * @type {string}
     * @memberof OnboardRequestOptions
     */
    state: string;
    /**
     * The organization name.
     * @type {string}
     * @memberof OnboardRequestOptions
     */
    organizationName: string;
    /**
     * A verbose organization description.
     * @type {string}
     * @memberof OnboardRequestOptions
     */
    organizationDescription?: string | null;
    /**
     * An initial group name,
     * @type {string}
     * @memberof OnboardRequestOptions
     */
    groupName: string;
    /**
     * A verbose initial group description.
     * @type {string}
     * @memberof OnboardRequestOptions
     */
    groupDescription?: string | null;
    /**
     * A list of roles to grant the user.
     * @type {Array<string>}
     * @memberof OnboardRequestOptions
     */
    roles?: Array<string> | null;
}

/**
 * Check if a given object implements the OnboardRequestOptions interface.
 */
export function instanceOfOnboardRequestOptions(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "state" in value;
    isInstance = isInstance && "organizationName" in value;
    isInstance = isInstance && "groupName" in value;

    return isInstance;
}

export function OnboardRequestOptionsFromJSON(json: any): OnboardRequestOptions {
    return OnboardRequestOptionsFromJSONTyped(json, false);
}

export function OnboardRequestOptionsFromJSONTyped(json: any, ignoreDiscriminator: boolean): OnboardRequestOptions {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'state': json['state'],
        'organizationName': json['organization_name'],
        'organizationDescription': !exists(json, 'organization_description') ? undefined : json['organization_description'],
        'groupName': json['group_name'],
        'groupDescription': !exists(json, 'group_description') ? undefined : json['group_description'],
        'roles': !exists(json, 'roles') ? undefined : json['roles'],
    };
}

export function OnboardRequestOptionsToJSON(value?: OnboardRequestOptions | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'state': value.state,
        'organization_name': value.organizationName,
        'organization_description': value.organizationDescription,
        'group_name': value.groupName,
        'group_description': value.groupDescription,
        'roles': value.roles,
    };
}

