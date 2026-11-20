import { describe, expect, it } from 'vitest';
import type * as Compute from '#lib/openapi/compute/index.ts';
import {
	decodeUserData,
	editableInstanceImageIDs,
	imageIncompatible,
	selectableInstanceFlavors,
	userDataForUpdate
} from './instanceutil';

function flavor(id: string, disk: number, architecture = 'x86_64'): Compute.Flavor {
	return { metadata: { id }, spec: { disk, architecture } } as Compute.Flavor;
}

function image(sizeGiB: number, architecture = 'x86_64', id = ''): Compute.Image {
	return { metadata: { id }, spec: { sizeGiB, architecture } } as Compute.Image;
}

describe('selectableInstanceFlavors', () => {
	it('requires sufficient disk space and a matching image architecture', () => {
		const valid = flavor('82a9e8c9-1566-441b-a32f-06a0bf830882', 20);
		const undersized = flavor('3ade0a68-7ca3-4917-a7a8-b820409d8781', 5);
		const wrongArchitecture = flavor('c2752e7a-e646-4143-a059-689c6ee9aa16', 20, 'aarch64');

		expect(selectableInstanceFlavors([valid, undersized, wrongArchitecture], [image(10)])).toEqual([
			valid
		]);
	});
});

describe('editableInstanceImageIDs', () => {
	const small = flavor('82a9e8c9-1566-441b-a32f-06a0bf830882', 20);
	const fitting = image(10, 'x86_64', 'fitting');
	const large = image(50, 'x86_64', 'large');

	it('keeps an image the catalog does not list selectable', () => {
		expect(editableInstanceImageIDs([fitting], small, 'uncatalogued')).toEqual([
			'uncatalogued',
			'fitting'
		]);
		expect(imageIncompatible([fitting], small, 'uncatalogued')).toBe(false);
	});

	it('keeps a catalog image that fits the flavor in place', () => {
		expect(editableInstanceImageIDs([large, fitting], small, 'fitting')).toEqual(['fitting']);
	});

	it('marks a catalog image that does not fit the flavor incompatible', () => {
		expect(editableInstanceImageIDs([large, fitting], small, 'large')).toEqual(['fitting']);
		expect(imageIncompatible([large, fitting], small, 'large')).toBe(true);
	});
});

describe('userDataForUpdate', () => {
	// Non-canonical trailing bits: decodes to the same text, but re-encoding
	// would produce IyEvYmluL3NoCg== instead.
	const text = '#!/bin/sh\n';
	const stored = 'IyEvYmluL3NoCh==';
	const gzip = btoa(String.fromCharCode(0x1f, 0x8b, 0x08, 0x00, 0xff));

	it('treats gzip data as undecodable', () => {
		expect(decodeUserData(gzip)).toBeNull();
	});

	it('resends undecodable data unchanged', () => {
		expect(userDataForUpdate(gzip, null)).toBe(gzip);
	});

	it('resends untouched text as the stored bytes', () => {
		expect(decodeUserData(stored)).toBe(text);
		expect(userDataForUpdate(stored, text)).toBe(stored);
	});

	it('encodes changed text', () => {
		expect(userDataForUpdate(stored, '#cloud-config\n')).toBe(btoa('#cloud-config\n'));
		expect(userDataForUpdate(gzip, '#cloud-config\n')).toBe(btoa('#cloud-config\n'));
	});

	it('keeps stored data when the text is emptied', () => {
		expect(userDataForUpdate(stored, '')).toBe(stored);
		expect(userDataForUpdate(gzip, '')).toBe(gzip);
	});

	it('omits user data when there is none', () => {
		expect(userDataForUpdate(undefined, '')).toBeUndefined();
	});
});
