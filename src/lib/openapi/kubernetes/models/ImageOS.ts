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
import type { OsDistro } from './OsDistro';
import {
    OsDistroFromJSON,
    OsDistroFromJSONTyped,
    OsDistroToJSON,
} from './OsDistro';
import type { OsFamily } from './OsFamily';
import {
    OsFamilyFromJSON,
    OsFamilyFromJSONTyped,
    OsFamilyToJSON,
} from './OsFamily';
import type { OsKernel } from './OsKernel';
import {
    OsKernelFromJSON,
    OsKernelFromJSONTyped,
    OsKernelToJSON,
} from './OsKernel';

/**
 * An operating system description.
 * @export
 * @interface ImageOS
 */
export interface ImageOS {
    /**
     * 
     * @type {OsKernel}
     * @memberof ImageOS
     */
    kernel: OsKernel;
    /**
     * 
     * @type {OsFamily}
     * @memberof ImageOS
     */
    family: OsFamily;
    /**
     * 
     * @type {OsDistro}
     * @memberof ImageOS
     */
    distro: OsDistro;
    /**
     * A free form variant e.g. desktop/server.
     * @type {string}
     * @memberof ImageOS
     */
    variant?: string;
    /**
     * A free form code name e.g. warty/bionic.
     * @type {string}
     * @memberof ImageOS
     */
    codename?: string;
    /**
     * Version of the operating system e.g. "24.04".
     * @type {string}
     * @memberof ImageOS
     */
    version: string;
}

/**
 * Check if a given object implements the ImageOS interface.
 */
export function instanceOfImageOS(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "kernel" in value;
    isInstance = isInstance && "family" in value;
    isInstance = isInstance && "distro" in value;
    isInstance = isInstance && "version" in value;

    return isInstance;
}

export function ImageOSFromJSON(json: any): ImageOS {
    return ImageOSFromJSONTyped(json, false);
}

export function ImageOSFromJSONTyped(json: any, ignoreDiscriminator: boolean): ImageOS {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'kernel': OsKernelFromJSON(json['kernel']),
        'family': OsFamilyFromJSON(json['family']),
        'distro': OsDistroFromJSON(json['distro']),
        'variant': !exists(json, 'variant') ? undefined : json['variant'],
        'codename': !exists(json, 'codename') ? undefined : json['codename'],
        'version': json['version'],
    };
}

export function ImageOSToJSON(value?: ImageOS | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'kernel': OsKernelToJSON(value.kernel),
        'family': OsFamilyToJSON(value.family),
        'distro': OsDistroToJSON(value.distro),
        'variant': value.variant,
        'codename': value.codename,
        'version': value.version,
    };
}

