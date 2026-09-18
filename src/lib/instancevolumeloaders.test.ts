import { beforeEach, describe, expect, it, vi } from 'vitest';

const api = vi.hoisted(() => ({
	images: vi.fn(),
	flavors: vi.fn(),
	securityGroups: vi.fn(),
	sshCertificateAuthorities: vi.fn(),
	volumes: vi.fn(),
	volumeClasses: vi.fn()
}));

vi.mock('$lib/clients', () => ({
	compute: () => ({
		apiV1OrganizationsOrganizationIDRegionsRegionIDImagesGet: api.images,
		apiV1OrganizationsOrganizationIDRegionsRegionIDFlavorsGet: api.flavors
	}),
	region: () => ({
		apiV2SecuritygroupsGet: api.securityGroups,
		apiV2SshcertificateauthoritiesGet: api.sshCertificateAuthorities,
		apiV2VolumesGet: api.volumes,
		apiV2VolumeclassesGet: api.volumeClasses
	})
}));

vi.mock('$lib/loadutil', () => ({ assertNonEmptyList: <T>(value: Promise<T>) => value }));
vi.mock('@sveltejs/kit', () => ({ error: vi.fn(), redirect: vi.fn() }));

import { load as createLoad } from '../routes/(shell)/compute/instances/create/+page';
import { load as editLoad } from '../routes/(shell)/compute/instances/edit/[id]/+page';

beforeEach(() => {
	Object.values(api).forEach((mock) => mock.mockResolvedValue([{}]));
});

describe('instance volume loaders', () => {
	it('limits create volumes to the selected network and loads its classes', async () => {
		await createLoad({
			fetch: vi.fn(),
			parent: async () => ({ organizationID: 'organization' }),
			url: new URL(
				'http://localhost/compute/instances/create?projectID=project&regionID=region&networkID=network'
			)
		} as never);

		expect(api.volumes).toHaveBeenCalledWith({
			organizationID: ['organization'],
			projectID: ['project'],
			regionID: ['region'],
			networkID: ['network']
		});
		expect(api.volumeClasses).toHaveBeenCalledWith({ regionID: ['region'] });
	});

	it('limits edit volumes to the instance network and loads its classes', async () => {
		await editLoad({
			fetch: vi.fn(),
			parent: async () => ({
				organizationID: 'organization',
				instances: [
					{
						metadata: { id: 'instance', projectId: 'project' },
						status: { regionId: 'region', networkId: 'network' }
					}
				]
			}),
			params: { id: 'instance' },
			url: new URL('http://localhost/compute/instances/edit/instance')
		} as never);

		expect(api.volumes).toHaveBeenCalledWith({
			organizationID: ['organization'],
			projectID: ['project'],
			regionID: ['region'],
			networkID: ['network']
		});
		expect(api.volumeClasses).toHaveBeenCalledWith({ regionID: ['region'] });
	});
});
