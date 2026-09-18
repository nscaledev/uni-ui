import { describe, expect, it } from 'vitest';
import type * as Region from '$lib/openapi/region';
import { attachableVolumes, changedVolumeSelection, volumeCompatible } from './volumeutil';

function volume(
	id: string,
	volumeClassId: string,
	options: { attached?: boolean; deprovisioning?: boolean } = {}
): Region.VolumeV2Read {
	return {
		metadata: {
			id,
			name: id,
			provisioningStatus: options.deprovisioning ? 'deprovisioning' : 'provisioned'
		},
		spec: { volumeClassId },
		status: { regionId: 'region', attachedAt: options.attached ? new Date() : undefined }
	} as Region.VolumeV2Read;
}

function volumeClass(id: string, supportedFlavorIds?: Set<string>): Region.VolumeClassV2Read {
	return { metadata: { id }, spec: { supportedFlavorIds } } as Region.VolumeClassV2Read;
}

describe('attachableVolumes', () => {
	it('excludes attached, deprovisioning, unknown-class, and incompatible volumes', () => {
		const volumes = [
			volume('available', 'unrestricted'),
			volume('attached', 'unrestricted', { attached: true }),
			volume('deprovisioning', 'unrestricted', { deprovisioning: true }),
			volume('incompatible', 'restricted'),
			volume('unknown-class', 'missing')
		];
		const classes = [
			volumeClass('unrestricted', new Set(['flavor'])),
			volumeClass('restricted', new Set(['other-flavor']))
		];

		expect(attachableVolumes(volumes, classes, 'flavor')).toEqual([volumes[0]]);
	});

	it('allows a matching array-backed flavor allowlist', () => {
		const volumes = [volume('array', 'array')];
		const classes = [volumeClass('array', ['flavor'] as unknown as Set<string>)];

		expect(attachableVolumes(volumes, classes, 'flavor')).toEqual(volumes);
	});

	it('retains selected volumes after a flavor change even when incompatible', () => {
		const retained = volume('retained', 'restricted');
		const classes = [volumeClass('restricted', new Set(['flavor-a']))];

		expect(attachableVolumes([retained], classes, 'flavor-a')).toEqual([retained]);
		expect(attachableVolumes([retained], classes, 'flavor-b', ['retained'])).toEqual([retained]);
		expect(volumeCompatible(retained, classes, 'flavor-b')).toBe(false);
	});
});

describe('volumeCompatible', () => {
	it('fails closed for missing classes and omitted or empty allowlists', () => {
		expect(volumeCompatible(volume('missing', 'missing'), [], 'flavor')).toBe(false);
		expect(volumeCompatible(volume('omitted', 'omitted'), [volumeClass('omitted')], 'flavor')).toBe(
			false
		);
		expect(
			volumeCompatible(volume('empty', 'empty'), [volumeClass('empty', new Set())], 'flavor')
		).toBe(false);
	});

	it('requires a populated allowlist to contain the selected flavor', () => {
		const classes = [volumeClass('restricted', new Set(['flavor-a']))];

		expect(volumeCompatible(volume('matching', 'restricted'), classes, 'flavor-a')).toBe(true);
		expect(volumeCompatible(volume('mismatched', 'restricted'), classes, 'flavor-b')).toBe(false);
	});
});

describe('changedVolumeSelection', () => {
	it('omits an unchanged selection', () => {
		expect(changedVolumeSelection(['one', 'two'], ['two', 'one'])).toBeUndefined();
	});

	it('returns an empty selection to detach all volumes', () => {
		expect(changedVolumeSelection([], ['one'])).toEqual([]);
	});

	it('returns the complete replacement selection', () => {
		expect(changedVolumeSelection(['two', 'three'], ['one'])).toEqual(['two', 'three']);
	});
});
