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

	const names = clusters
		.filter(
			(x) => x.metadata.projectId == cluster.metadata.projectId && x.metadata.id != params['id']
		)
		.map((x) => x.metadata.name);

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
		images: await assertNonEmptyList(images),
		flavors: await assertNonEmptyList(flavors)
	};
};
