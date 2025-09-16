export const ssr = false;

import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';

import * as Clients from '$lib/clients';

export const load: PageLoad = async ({ fetch, parent, params, url }) => {
	const { organizationID, clusters } = await parent();

	const cluster = clusters.find((x) => params['id'] == x.metadata.id);
	if (!cluster) {
		redirect(307, url.pathname.split('/').slice(0, -2).join('/'));
	}

	// Find all clusters in this project that aren't the one we care about and
	// extract the names so we can prevent reuse.
	const otherProjectClusters = clusters.filter(
		(x) => x.metadata.projectId == cluster.metadata.projectId && x.metadata.id != params['id']
	);

	const names = otherProjectClusters.map((x) => x.metadata.name);

	const clustermanagers = Clients.kubernetes(
		fetch
	).apiV1OrganizationsOrganizationIDClustermanagersGet({
		organizationID: organizationID
	});

	const images = Clients.kubernetes(fetch).apiV1OrganizationsOrganizationIDRegionsRegionIDImagesGet(
		{
			organizationID: organizationID,
			regionID: cluster.spec.regionId
		}
	);

	const flavors = Clients.kubernetes(
		fetch
	).apiV1OrganizationsOrganizationIDRegionsRegionIDFlavorsGet({
		organizationID: organizationID,
		regionID: cluster.spec.regionId
	});

	return {
		cluster: cluster,
		names: names,
		clustermanagers: await clustermanagers,
		images: await images,
		flavors: await flavors
	};
};
