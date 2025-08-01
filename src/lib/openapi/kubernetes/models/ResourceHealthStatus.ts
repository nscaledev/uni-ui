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


/**
 * The health state of a resource.
 * @export
 */
export const ResourceHealthStatus = {
    Unknown: 'unknown',
    Healthy: 'healthy',
    Degraded: 'degraded',
    Error: 'error'
} as const;
export type ResourceHealthStatus = typeof ResourceHealthStatus[keyof typeof ResourceHealthStatus];


export function ResourceHealthStatusFromJSON(json: any): ResourceHealthStatus {
    return ResourceHealthStatusFromJSONTyped(json, false);
}

export function ResourceHealthStatusFromJSONTyped(json: any, ignoreDiscriminator: boolean): ResourceHealthStatus {
    return json as ResourceHealthStatus;
}

export function ResourceHealthStatusToJSON(value?: ResourceHealthStatus | null): any {
    return value as any;
}

