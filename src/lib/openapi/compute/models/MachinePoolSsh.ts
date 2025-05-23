/* tslint:disable */
/* eslint-disable */
/**
 * Compute Service API
 * The Compute Service API provides services that allows provisioning and life cycle management of Compute clusters. Requests must specify the HTML content type header.
 *
 * The version of the OpenAPI document: 0.1.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { exists, mapValues } from '../runtime';
/**
 * SSH settings.
 * @export
 * @interface MachinePoolSsh
 */
export interface MachinePoolSsh {
    /**
     * A list of public SSH keys to allow access to the machine.
     * @type {Array<string>}
     * @memberof MachinePoolSsh
     */
    publicKeys?: Array<string>;
}

/**
 * Check if a given object implements the MachinePoolSsh interface.
 */
export function instanceOfMachinePoolSsh(value: object): boolean {
    let isInstance = true;

    return isInstance;
}

export function MachinePoolSshFromJSON(json: any): MachinePoolSsh {
    return MachinePoolSshFromJSONTyped(json, false);
}

export function MachinePoolSshFromJSONTyped(json: any, ignoreDiscriminator: boolean): MachinePoolSsh {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'publicKeys': !exists(json, 'publicKeys') ? undefined : json['publicKeys'],
    };
}

export function MachinePoolSshToJSON(value?: MachinePoolSsh | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'publicKeys': value.publicKeys,
    };
}

