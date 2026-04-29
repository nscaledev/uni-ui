export const ssr = false;

import type { LayoutLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';

import * as Clients from '$lib/clients';
import type { InternalToken } from '$lib/oauth2';
import * as OIDC from '$lib/oidc';

function getSessionData<Type>(key: string): Type | undefined {
	const data = window.sessionStorage.getItem(key);
	if (!data) return;

	return JSON.parse(data) as Type;
}

export const load: LayoutLoad = async ({ fetch, depends }) => {
	depends('app:organization_id');
	depends('app:project_id');

	const token = getSessionData<InternalToken>('token');
	const profile = getSessionData<OIDC.IDToken>('profile');

	if (!token) {
		window.sessionStorage.setItem('oidc_location', window.location.pathname);
		redirect(307, '/oauth2/login');
	}

	if (!profile) {
		error(500, 'OIDC ID token not set');
	}

	const organizations = await Clients.identity(fetch).apiV1OrganizationsGet();
	if (organizations.length == 0) {
		error(500, 'User is not a member of any organizations');
	}

	let organizationID = window.localStorage.getItem('organization_id');
	if (!organizationID || !organizations.find((o) => o.metadata.id == organizationID)) {
		organizationID = organizations[0].metadata.id;
	}

	const [acl, projects] = await Promise.all([
		Clients.identity(fetch).apiV1OrganizationsOrganizationIDAclGet({ organizationID }),
		Clients.identity(fetch).apiV1OrganizationsOrganizationIDProjectsGet({ organizationID })
	]);

	// null = all projects; undefined means not yet set
	let projectID: string | null = window.localStorage.getItem('project_id');
	if (projectID && !projects.find((p) => p.metadata.id === projectID)) {
		// Stored project no longer exists in this org — reset.
		projectID = null;
		window.localStorage.removeItem('project_id');
	}

	return {
		profile,
		organizations,
		organizationID,
		acl,
		projects,
		projectID
	};
};
