export const ssr = false;

import type { LayoutLoad } from './$types';
import * as Clients from '$lib/clients';

export const load: LayoutLoad = async ({ fetch, depends, parent }) => {
	depends('layout:clustermanagers');

	const { organizationID, projectID } = await parent();

	const all = await Clients.kubernetes(fetch).apiV1OrganizationsOrganizationIDClustermanagersGet({
		organizationID
	});

	const clustermanagers = projectID ? all.filter((cm) => cm.metadata.projectId === projectID) : all;

	return { clustermanagers };
};
