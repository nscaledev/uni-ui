/* tslint:disable */
/* eslint-disable */
/**
 * Region Service API
 * Cloud region discovery and routing service.  This is service not intended for direct access by end users.  Region related functionality is typically exposed by higher level services e.g. Compute and Kubernetes, that provide subsets of resources that are compatible with that service.
 *
 * The version of the OpenAPI document: 1.4.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { exists, mapValues } from '../runtime';
import type { RegionDetailKubernetes } from './RegionDetailKubernetes';
import {
    RegionDetailKubernetesFromJSON,
    RegionDetailKubernetesFromJSONTyped,
    RegionDetailKubernetesToJSON,
} from './RegionDetailKubernetes';
import type { RegionFeatures } from './RegionFeatures';
import {
    RegionFeaturesFromJSON,
    RegionFeaturesFromJSONTyped,
    RegionFeaturesToJSON,
} from './RegionFeatures';
import type { RegionType } from './RegionType';
import {
    RegionTypeFromJSON,
    RegionTypeFromJSONTyped,
    RegionTypeToJSON,
} from './RegionType';

/**
 * Information about the region.
 * @export
 * @interface RegionDetailSpec
 */
export interface RegionDetailSpec {
    /**
     * 
     * @type {RegionType}
     * @memberof RegionDetailSpec
     */
    type: RegionType;
    /**
     * 
     * @type {RegionDetailKubernetes}
     * @memberof RegionDetailSpec
     */
    kubernetes?: RegionDetailKubernetes;
    /**
     * 
     * @type {RegionFeatures}
     * @memberof RegionDetailSpec
     */
    features: RegionFeatures;
}

/**
 * Check if a given object implements the RegionDetailSpec interface.
 */
export function instanceOfRegionDetailSpec(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "type" in value;
    isInstance = isInstance && "features" in value;

    return isInstance;
}

export function RegionDetailSpecFromJSON(json: any): RegionDetailSpec {
    return RegionDetailSpecFromJSONTyped(json, false);
}

export function RegionDetailSpecFromJSONTyped(json: any, ignoreDiscriminator: boolean): RegionDetailSpec {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'type': RegionTypeFromJSON(json['type']),
        'kubernetes': !exists(json, 'kubernetes') ? undefined : RegionDetailKubernetesFromJSON(json['kubernetes']),
        'features': RegionFeaturesFromJSON(json['features']),
    };
}

export function RegionDetailSpecToJSON(value?: RegionDetailSpec | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'type': RegionTypeToJSON(value.type),
        'kubernetes': RegionDetailKubernetesToJSON(value.kubernetes),
        'features': RegionFeaturesToJSON(value.features),
    };
}

