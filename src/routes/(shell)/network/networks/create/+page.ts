export const ssr = false;

import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ url }) => {
	const projectID = url.searchParams.get('projectID');
	if (!projectID) {
		error(400, 'projectIDID not in query');
	}

	const regionID = url.searchParams.get('regionID');
	if (!regionID) {
		error(400, 'region ID not in query');
	}

	return {
		projectID: projectID,
		regionID: regionID
	};
};
