export const ssr = false;

import type { LayoutLoad } from './$types';

import * as Clients from '$lib/clients';

export const load: LayoutLoad = async ({ fetch, depends, parent }) => {
	depends('layout:kubernetes');

	const { organizationID } = await parent();

	const projects = Clients.identity(fetch).apiV1OrganizationsOrganizationIDProjectsGet({
		organizationID: organizationID
	});

	return {
		projects: await projects
	};
};
