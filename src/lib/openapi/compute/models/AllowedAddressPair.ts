/* tslint:disable */
/* eslint-disable */
/**
 * Compute Service API
 * The Compute Service API provides services that allows provisioning and life cycle management of Compute clusters.
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
 * Allow multiple MAC/IP address (range) pairs to pass through this network port.
 * Typically required when the machine is operating as a router.
 * @export
 * @interface AllowedAddressPair
 */
export interface AllowedAddressPair {
    /**
     * The CIDR to allow.
     * @type {string}
     * @memberof AllowedAddressPair
     */
    cidr: string;
    /**
     * The MAC address to allow.
     * @type {string}
     * @memberof AllowedAddressPair
     */
    macAddress?: string;
}

/**
 * Check if a given object implements the AllowedAddressPair interface.
 */
export function instanceOfAllowedAddressPair(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "cidr" in value;

    return isInstance;
}

export function AllowedAddressPairFromJSON(json: any): AllowedAddressPair {
    return AllowedAddressPairFromJSONTyped(json, false);
}

export function AllowedAddressPairFromJSONTyped(json: any, ignoreDiscriminator: boolean): AllowedAddressPair {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'cidr': json['cidr'],
        'macAddress': !exists(json, 'macAddress') ? undefined : json['macAddress'],
    };
}

export function AllowedAddressPairToJSON(value?: AllowedAddressPair | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'cidr': value.cidr,
        'macAddress': value.macAddress,
    };
}

