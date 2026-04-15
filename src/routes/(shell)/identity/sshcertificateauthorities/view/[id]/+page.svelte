<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	import type { ShellPageSettings } from '$lib/layouts/types.ts';
	import ShellPageHeader from '$lib/layouts/ShellPageHeader.svelte';
	import ShellViewHeader from '$lib/layouts/ShellViewHeader.svelte';
	import ShellMetadataItem from '$lib/layouts/ShellMetadataItem.svelte';
	import ShellSection from '$lib/layouts/ShellSection.svelte';
	import Clipboard from '$lib/forms/Clipboard.svelte';

	const settings: ShellPageSettings = {
		feature: 'Identity',
		name: 'View SSH Certificate CA',
		description: 'View an SSH certificate authority.',
		icon: 'mdi:key-chain-variant'
	};

	let projectName = $derived.by(() => {
		const project = data.projects.find(
			(x) => x.metadata.id == data.sshCertificateAuthority.metadata.projectId
		);

		return project?.metadata.name || data.sshCertificateAuthority.metadata.projectId;
	});
</script>

<ShellPageHeader {settings} />

<ShellViewHeader metadata={data.sshCertificateAuthority.metadata}>
	{#snippet extraMetadata()}
		<ShellMetadataItem icon="mdi:folder-open-outline" label="Project" value={projectName} />
	{/snippet}
</ShellViewHeader>

<ShellSection title="Configuration">
	<label for="public-key">Public key.</label>
	<Clipboard id="public-key" value={data.sshCertificateAuthority.spec.publicKey} />
</ShellSection>
