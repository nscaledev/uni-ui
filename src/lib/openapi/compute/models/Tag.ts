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
 * A tag mapping arbitrary names to values.  These have no special meaning
 * for any component are are intended for use by end users to add additional
 * context to a resource, for example to categorize it.
 * @export
 * @interface Tag
 */
export interface Tag {
    /**
     * A unique tag name.
     * @type {string}
     * @memberof Tag
     */
    name: string;
    /**
     * The value of the tag.
     * @type {string}
     * @memberof Tag
     */
    value: string;
}

/**
 * Check if a given object implements the Tag interface.
 */
export function instanceOfTag(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "name" in value;
    isInstance = isInstance && "value" in value;

    return isInstance;
}

export function TagFromJSON(json: any): Tag {
    return TagFromJSONTyped(json, false);
}

export function TagFromJSONTyped(json: any, ignoreDiscriminator: boolean): Tag {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'name': json['name'],
        'value': json['value'],
    };
}

export function TagToJSON(value?: Tag | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'name': value.name,
        'value': value.value,
    };
}

