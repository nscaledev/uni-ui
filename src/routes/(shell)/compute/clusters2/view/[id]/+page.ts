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

	const images = Clients.compute(fetch).apiV1OrganizationsOrganizationIDRegionsRegionIDImagesGet({
		organizationID: organizationID,
		regionID: cluster.status.regionId
	});

	const flavors = Clients.compute(fetch).apiV1OrganizationsOrganizationIDRegionsRegionIDFlavorsGet({
		organizationID: organizationID,
		regionID: cluster.status.regionId
	});

	return {
		cluster: cluster,
		images: await images,
		flavors: await flavors
	};
};
