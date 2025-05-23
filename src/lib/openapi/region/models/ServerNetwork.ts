/* tslint:disable */
/* eslint-disable */
/**
 * Kubernetes Region Service API
 * Cloud region discovery and routing service.
 *
 * The version of the OpenAPI document: 0.1.1
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { exists, mapValues } from '../runtime';
import type { ServerNetworkAllowedAddressPair } from './ServerNetworkAllowedAddressPair';
import {
    ServerNetworkAllowedAddressPairFromJSON,
    ServerNetworkAllowedAddressPairFromJSONTyped,
    ServerNetworkAllowedAddressPairToJSON,
} from './ServerNetworkAllowedAddressPair';

/**
 * The server's network.
 * @export
 * @interface ServerNetwork
 */
export interface ServerNetwork {
    /**
     * Network to attach the server to
     * @type {string}
     * @memberof ServerNetwork
     */
    id: string;
    /**
     * A list of allowed address pairs.
     * @type {Array<ServerNetworkAllowedAddressPair>}
     * @memberof ServerNetwork
     */
    allowedAddressPairs?: Array<ServerNetworkAllowedAddressPair>;
}

/**
 * Check if a given object implements the ServerNetwork interface.
 */
export function instanceOfServerNetwork(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "id" in value;

    return isInstance;
}

export function ServerNetworkFromJSON(json: any): ServerNetwork {
    return ServerNetworkFromJSONTyped(json, false);
}

export function ServerNetworkFromJSONTyped(json: any, ignoreDiscriminator: boolean): ServerNetwork {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'id': json['id'],
        'allowedAddressPairs': !exists(json, 'allowedAddressPairs') ? undefined : ((json['allowedAddressPairs'] as Array<any>).map(ServerNetworkAllowedAddressPairFromJSON)),
    };
}

export function ServerNetworkToJSON(value?: ServerNetwork | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'id': value.id,
        'allowedAddressPairs': value.allowedAddressPairs === undefined ? undefined : ((value.allowedAddressPairs as Array<any>).map(ServerNetworkAllowedAddressPairToJSON)),
    };
}

