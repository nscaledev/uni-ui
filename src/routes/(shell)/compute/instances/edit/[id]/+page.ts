export const ssr = false;

import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';

import * as Clients from '$lib/clients';
import { assertNonEmptyList } from '$lib/loadutil';

export const load: PageLoad = async ({ fetch, parent, url, params }) => {
	const { organizationID, instances } = await parent();

	const instance = instances.find((x) => params['id'] == x.metadata.id);
	if (!instance) {
		redirect(307, url.pathname.split('/').slice(0, -2).join('/'));
	}

	// Find all instances on this network that aren't the one we care about and
	// extract the names so we can prevent reuse.
	const otherInstances = instances.filter(
		(x) => x.status.networkId == instance.status.networkId && x.metadata.id != params['id']
	);

	const names = otherInstances.map((x) => x.metadata.name);

	const images = Clients.compute(fetch).apiV1OrganizationsOrganizationIDRegionsRegionIDImagesGet({
		organizationID: organizationID,
		regionID: instance.status.regionId
	});

	const flavors = Clients.compute(fetch).apiV1OrganizationsOrganizationIDRegionsRegionIDFlavorsGet({
		organizationID: organizationID,
		regionID: instance.status.regionId
	});

	const securityGroups = Clients.region(fetch).apiV2SecuritygroupsGet({
		organizationID: [organizationID],
		projectID: [instance.metadata.projectId],
		networkID: [instance.status.networkId]
	});

	return {
		instance: instance,
		names: names,
		images: await assertNonEmptyList(images),
		flavors: await assertNonEmptyList(flavors),
		securityGroups: await securityGroups
	};
};
