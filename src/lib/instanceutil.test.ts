import { describe, expect, it } from 'vitest';
import type * as Compute from '$lib/openapi/compute';
import { selectableInstanceFlavors } from './instanceutil';

function flavor(id: string, disk: number, architecture = 'x86_64'): Compute.Flavor {
	return { metadata: { id }, spec: { disk, architecture } } as Compute.Flavor;
}

function image(sizeGiB: number, architecture = 'x86_64'): Compute.Image {
	return { spec: { sizeGiB, architecture } } as Compute.Image;
}

describe('selectableInstanceFlavors', () => {
	it('requires a UUID and a compatible image', () => {
		const valid = flavor('82a9e8c9-1566-441b-a32f-06a0bf830882', 20);
		const invalidID = flavor('not-a-uuid', 20);
		const undersized = flavor('3ade0a68-7ca3-4917-a7a8-b820409d8781', 5);
		const wrongArchitecture = flavor('c2752e7a-e646-4143-a059-689c6ee9aa16', 20, 'aarch64');

		expect(
			selectableInstanceFlavors([valid, invalidID, undersized, wrongArchitecture], [image(10)])
		).toEqual([valid]);
	});
});
