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
 * The region type. "physical" means a full Kubernetes cluster deployment, "virtual" is a virtual
 * Kubernetes cluster hosted by another one.
 * @export
 */
export const RegionTypeParameter = {
    Physical: 'physical',
    Virtual: 'virtual'
} as const;
export type RegionTypeParameter = typeof RegionTypeParameter[keyof typeof RegionTypeParameter];


export function RegionTypeParameterFromJSON(json: any): RegionTypeParameter {
    return RegionTypeParameterFromJSONTyped(json, false);
}

export function RegionTypeParameterFromJSONTyped(json: any, ignoreDiscriminator: boolean): RegionTypeParameter {
    return json as RegionTypeParameter;
}

export function RegionTypeParameterToJSON(value?: RegionTypeParameter | null): any {
    return value as any;
}

