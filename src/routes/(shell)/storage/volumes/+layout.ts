export const ssr = false;

import type { LayoutLoad } from './$types';
import * as Clients from '$lib/clients';

export const load: LayoutLoad = async ({ fetch, depends, parent }) => {
	depends('layout:volumes');

	const { organizationID, projectID } = await parent();
	const query = {
		organizationID: [organizationID],
		projectID: projectID ? [projectID] : undefined
	};
	const [volumes, volumeClasses, networks, regions] = await Promise.all([
		Clients.region(fetch).apiV2VolumesGet(query),
		Clients.region(fetch).apiV2VolumeclassesGet(),
		Clients.region(fetch).apiV2NetworksGet(query),
		Clients.region(fetch).apiV1OrganizationsOrganizationIDRegionsGet({ organizationID })
	]);

	return { volumes, volumeClasses, networks, regions };
};
