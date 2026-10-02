import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import type { PageData } from './$types';
import InstanceEditPage from './+page.svelte';

vi.mock('$lib/clients', () => ({}));
vi.mock('$lib/loadutil', () => ({ startPolling: vi.fn() }));

function pageData(disk: number | undefined): PageData {
	return {
		instance: {
			metadata: { id: 'instance', name: 'instance', projectId: 'project' },
			spec: { flavorId: 'current-flavor', imageId: 'current-image' },
			status: { regionId: 'region', networkId: 'network' }
		},
		flavors:
			disk === undefined
				? []
				: [
						{
							metadata: { id: 'current-flavor' },
							spec: { disk, architecture: 'x86_64', cpus: 2, memory: 4 }
						}
					],
		images: [
			{
				metadata: { id: 'current-image' },
				spec: { sizeGiB: 10, architecture: 'x86_64', os: { distro: 'ubuntu', version: '24.04' } }
			}
		],
		projects: [],
		regions: [],
		networks: [],
		names: [],
		volumes: [],
		volumeClasses: [],
		securityGroups: [],
		sshCertificateAuthorities: []
	} as unknown as PageData;
}

describe('instance edit flavor feedback', () => {
	it.each([
		['missing from inventory', undefined],
		['filtered out by image compatibility', 5]
	] as const)('explains a flavor %s without replacing it', (_reason, disk) => {
		const data = pageData(disk);
		const { body } = render(InstanceEditPage, { props: { data } });

		expect(body).toContain('Unavailable flavor: current-flavor');
		expect(body).toContain('role="alert"');
		expect(body.replace(/\s+/g, ' ')).toContain('Select an available flavor before saving.');
		expect(body).toContain('Changing the flavor rebuilds the instance.');
		expect(body).toMatch(/<button[^>]*disabled[^>]*>.*?<span>Save Changes<\/span>.*?<\/button>/s);
		expect(data.instance.spec.flavorId).toBe('current-flavor');
	});

	it('renders an available flavor without the warning', () => {
		const { body } = render(InstanceEditPage, { props: { data: pageData(20) } });

		expect(body).not.toContain('Unavailable flavor:');
		expect(body).not.toContain('role="alert"');
		expect(body).toContain('RAM');
	});
});
