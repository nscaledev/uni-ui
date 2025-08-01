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
import type { ResourceWriteMetadata } from './ResourceWriteMetadata';
import {
    ResourceWriteMetadataFromJSON,
    ResourceWriteMetadataFromJSONTyped,
    ResourceWriteMetadataToJSON,
} from './ResourceWriteMetadata';
import type { SecurityGroupRuleSpec } from './SecurityGroupRuleSpec';
import {
    SecurityGroupRuleSpecFromJSON,
    SecurityGroupRuleSpecFromJSONTyped,
    SecurityGroupRuleSpecToJSON,
} from './SecurityGroupRuleSpec';

/**
 * A security group rule request.
 * @export
 * @interface SecurityGroupRuleWrite
 */
export interface SecurityGroupRuleWrite {
    /**
     * 
     * @type {ResourceWriteMetadata}
     * @memberof SecurityGroupRuleWrite
     */
    metadata: ResourceWriteMetadata;
    /**
     * 
     * @type {SecurityGroupRuleSpec}
     * @memberof SecurityGroupRuleWrite
     */
    spec: SecurityGroupRuleSpec;
}

/**
 * Check if a given object implements the SecurityGroupRuleWrite interface.
 */
export function instanceOfSecurityGroupRuleWrite(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "metadata" in value;
    isInstance = isInstance && "spec" in value;

    return isInstance;
}

export function SecurityGroupRuleWriteFromJSON(json: any): SecurityGroupRuleWrite {
    return SecurityGroupRuleWriteFromJSONTyped(json, false);
}

export function SecurityGroupRuleWriteFromJSONTyped(json: any, ignoreDiscriminator: boolean): SecurityGroupRuleWrite {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'metadata': ResourceWriteMetadataFromJSON(json['metadata']),
        'spec': SecurityGroupRuleSpecFromJSON(json['spec']),
    };
}

export function SecurityGroupRuleWriteToJSON(value?: SecurityGroupRuleWrite | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'metadata': ResourceWriteMetadataToJSON(value.metadata),
        'spec': SecurityGroupRuleSpecToJSON(value.spec),
    };
}

