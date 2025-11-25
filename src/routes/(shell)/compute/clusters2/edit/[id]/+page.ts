export const ssr = false;

import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';

import * as Clients from '$lib/clients';
import { assertNonEmptyList } from '$lib/loadutil';

export const load: PageLoad = async ({ fetch, parent, url, params }) => {
	const { organizationID, clusters } = await parent();

	const cluster = clusters.find((x) => params['id'] == x.metadata.id);
	if (!cluster) {
		redirect(307, url.pathname.split('/').slice(0, -2).join('/'));
	}

	const otherClusters = clusters.filter(
		(x) => x.status.networkId == cluster.status.networkId && x.metadata.id != params['id']
	);

	const names = otherClusters.map((x) => x.metadata.name);

	const images = Clients.compute(fetch).apiV1OrganizationsOrganizationIDRegionsRegionIDImagesGet({
		organizationID: organizationID,
		regionID: cluster.status.regionId
	});

	const flavors = Clients.compute(fetch).apiV1OrganizationsOrganizationIDRegionsRegionIDFlavorsGet({
		organizationID: organizationID,
		regionID: cluster.status.regionId
	});

	const securityGroups = Clients.region(fetch).apiV2SecuritygroupsGet({
		organizationID: [organizationID],
		projectID: [cluster.metadata.projectId],
		networkID: [cluster.status.networkId]
	});

	return {
		cluster: cluster,
		names: names,
		images: await assertNonEmptyList(images),
		flavors: await assertNonEmptyList(flavors),
		securityGroups: await securityGroups
	};
};
