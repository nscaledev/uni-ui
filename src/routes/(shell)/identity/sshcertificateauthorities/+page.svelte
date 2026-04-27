<script lang="ts">
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import { invalidate } from '$app/navigation';
	import { startAutoRefresh } from '$lib/loadutil';

	let { data }: { data: PageData } = $props();

	import * as Clients from '$lib/clients';

	import type { ShellPageSettings } from '$lib/layouts/types.ts';
	import ShellPageHeader from '$lib/layouts/ShellPageHeader.svelte';
	import ShellList from '$lib/layouts/ShellList.svelte';
	import ShellListItem from '$lib/layouts/ShellListItem.svelte';
	import ShellListItemHeader from '$lib/layouts/ShellListItemHeader.svelte';
	import ShellListItemBadges from '$lib/layouts/ShellListItemBadges.svelte';
	import ShellListItemMetadata from '$lib/layouts/ShellListItemMetadata.svelte';
	import ShellMetadataItem from '$lib/layouts/ShellMetadataItem.svelte';
	import SubtleButton from '$lib/forms/SubtleButton.svelte';
	import ModalIcon from '$lib/layouts/ModalIcon.svelte';

	const settings: ShellPageSettings = {
		feature: 'Identity',
		name: 'SSH Certificate CAs',
		description: 'Manage SSH certificate authorities available to projects.',
		icon: 'mdi:key-chain-variant'
	};

	onMount(() => startAutoRefresh('layout:sshcertificateauthorities'));

	function confirm(id: string): void {
		Clients.region()
			.apiV2SshcertificateauthoritiesSshCertificateAuthorityIDDelete({
				sshCertificateAuthorityID: id
			})
			.then(() => invalidate('layout:sshcertificateauthorities'))
			.catch((e: Error) => Clients.error(e));
	}
</script>

<ShellPageHeader {settings}>
	{#snippet tools()}
		<SubtleButton icon="mdi:add" label="Create" href="/identity/sshcertificateauthorities/create" />
	{/snippet}
</ShellPageHeader>

<ShellList>
	{#each data.sshCertificateAuthorities || [] as resource}
		<ShellListItem>
			{#snippet main()}
			<ShellListItemHeader
					metadata={resource.metadata}
					projects={data.projects}
					href="/identity/sshcertificateauthorities/view/{resource.metadata.id}"
				/>
			{/snippet}

			{#snippet badges()}
				<ShellListItemBadges metadata={resource.metadata} />
			{/snippet}

			<ShellListItemMetadata metadata={resource.metadata} />

			<ShellListItemMetadata>
				<ShellMetadataItem
					icon="mdi:key-variant"
					label="Public Key"
					value={resource.spec.publicKey}
				/>
			</ShellListItemMetadata>

			{#snippet trail()}
				<ModalIcon
					icon="mdi:trash-can-outline"
					label="Delete"
					title="Are you sure?"
					confirm={() => confirm(resource.metadata.id)}
				>
					Removing SSH certificate authority "{resource.metadata.name}" may prevent instance login.
				</ModalIcon>
			{/snippet}
		</ShellListItem>
	{/each}
</ShellList>
