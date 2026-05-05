export const ssr = false;

import type { LayoutLoad } from './$types';

import * as Clients from '$lib/clients';

export const load: LayoutLoad = async ({ fetch, depends, parent }) => {
	depends('layout:projects');

	const { organizationID } = await parent();

	const [projects, groups] = await Promise.all([
		Clients.identity(fetch).apiV1OrganizationsOrganizationIDProjectsGet({ organizationID }),
		Clients.identity(fetch).apiV1OrganizationsOrganizationIDGroupsGet({ organizationID })
	]);

	return { projects, groups };
};
