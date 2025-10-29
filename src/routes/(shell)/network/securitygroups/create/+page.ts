export const ssr = false;

import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ url, parent }) => {
	const { networks } = await parent();

	const networkID = url.searchParams.get('networkID');
	if (!networkID) {
		error(400, 'network ID not in query');
	}

	const network = networks.find((x) => x.metadata.id == networkID);
	if (!network) {
		error(404, 'network not found');
	}

	return {
		network: network
	};
};
