/* tslint:disable */
/* eslint-disable */
/**
 * Kubernetes Service API
 * The Kubernetes Service API provides services that allows provisioning and life cycle management of Kubernetes clusters.
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
 * Kubernetes API settings.
 * @export
 * @interface KubernetesClusterAPI
 */
export interface KubernetesClusterAPI {
    /**
     * Set of non-standard X.509 SANs to add to the API certificate.
     * @type {Array<string>}
     * @memberof KubernetesClusterAPI
     */
    subjectAlternativeNames?: Array<string>;
    /**
     * Set of address prefixes to allow access to the Kubernetes API.
     * @type {Array<string>}
     * @memberof KubernetesClusterAPI
     */
    allowedPrefixes?: Array<string>;
}

/**
 * Check if a given object implements the KubernetesClusterAPI interface.
 */
export function instanceOfKubernetesClusterAPI(value: object): boolean {
    let isInstance = true;

    return isInstance;
}

export function KubernetesClusterAPIFromJSON(json: any): KubernetesClusterAPI {
    return KubernetesClusterAPIFromJSONTyped(json, false);
}

export function KubernetesClusterAPIFromJSONTyped(json: any, ignoreDiscriminator: boolean): KubernetesClusterAPI {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'subjectAlternativeNames': !exists(json, 'subjectAlternativeNames') ? undefined : json['subjectAlternativeNames'],
        'allowedPrefixes': !exists(json, 'allowedPrefixes') ? undefined : json['allowedPrefixes'],
    };
}

export function KubernetesClusterAPIToJSON(value?: KubernetesClusterAPI | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'subjectAlternativeNames': value.subjectAlternativeNames,
        'allowedPrefixes': value.allowedPrefixes,
    };
}

