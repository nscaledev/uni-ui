export const ssr = false;

import type { LayoutLoad } from './$types';
import * as Clients from '$lib/clients';

export const load: LayoutLoad = async ({ fetch, depends, parent }) => {
	depends('layout:networks');

	const { organizationID, projectID } = await parent();

	const networks = Clients.region(fetch).apiV2NetworksGet({
		organizationID: [organizationID],
		projectID: projectID ? [projectID] : undefined
	});

	return { networks: await networks };
};
