export const ssr = false;

import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageLoad = async ({ parent, params, url }) => {
	const { sshCertificateAuthorities } = await parent();

	const sshCertificateAuthority = sshCertificateAuthorities.find(
		(x) => x.metadata.id == params['id']
	);
	if (!sshCertificateAuthority) {
		redirect(307, url.pathname.split('/').slice(0, -2).join('/'));
	}

	return {
		sshCertificateAuthority: sshCertificateAuthority
	};
};
