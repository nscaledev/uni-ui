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

	const flavors = Clients.kubernetes(
		fetch
	).apiV1OrganizationsOrganizationIDRegionsRegionIDFlavorsGet({
		organizationID: organizationID,
		regionID: cluster.spec.regionId
	});

	return {
		cluster: cluster,
		flavors: await flavors
	};
};
