export const ssr = false;

import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

import * as Clients from '$lib/clients';
import { assertNonEmptyList } from '$lib/loadutil';

export const load: PageLoad = async ({ fetch, parent, url }) => {
	const { organizationID } = await parent();

	const projectID = url.searchParams.get('projectID');
	if (!projectID) {
		error(400, 'project ID not in query');
	}

	const regionID = url.searchParams.get('regionID');
	if (!regionID) {
		error(400, 'region ID not in query');
	}

	const networkID = url.searchParams.get('networkID');
	if (!networkID) {
		error(400, 'network ID not in query');
	}

	const images = Clients.compute(fetch).apiV1OrganizationsOrganizationIDRegionsRegionIDImagesGet({
		organizationID: organizationID,
		regionID: regionID
	});

	const flavors = Clients.compute(fetch).apiV1OrganizationsOrganizationIDRegionsRegionIDFlavorsGet({
		organizationID: organizationID,
		regionID: regionID
	});

	const securityGroups = Clients.region(fetch).apiV2SecuritygroupsGet({
		organizationID: [organizationID],
		projectID: [projectID],
		networkID: [networkID]
	});

	return {
		projectID: projectID,
		regionID: regionID,
		networkID: networkID,
		images: await assertNonEmptyList(images),
		flavors: await assertNonEmptyList(flavors),
		securityGroups: await securityGroups
	};
};
