export const ssr = false;

import type { PageLoad } from './$types';

import * as Clients from '#lib/clients/index.ts';

export const load: PageLoad = async ({ fetch, parent }) => {
	const { organizationID } = await parent();

	const quotas = Clients.identity(fetch).apiV1OrganizationsOrganizationIDQuotasGet({
		organizationID: organizationID
	});

	return {
		quotas: await quotas
	};
};
