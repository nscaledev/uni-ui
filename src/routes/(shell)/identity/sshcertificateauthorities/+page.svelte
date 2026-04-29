<script lang="ts">
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import { invalidate } from '$app/navigation';
	import { startAutoRefresh } from '$lib/loadutil';
	let { data }: { data: PageData } = $props();
	import * as Clients from '$lib/clients';
	import type { ShellPageSettings } from '$lib/layouts/types.ts';
	import ListPage from '$lib/layouts/ListPage.svelte';
	import ShellList from '$lib/layouts/ShellList.svelte';
	import ShellListItem from '$lib/layouts/ShellListItem.svelte';
	import ShellListItemHeader from '$lib/layouts/ShellListItemHeader.svelte';
	import ShellListItemBadges from '$lib/layouts/ShellListItemBadges.svelte';
	import ShellListItemMetadata from '$lib/layouts/ShellListItemMetadata.svelte';
	import ShellMetadataItem from '$lib/layouts/ShellMetadataItem.svelte';
	import Placeholder from '$lib/layouts/Placeholder.svelte';
	import SubtleButton from '$lib/forms/SubtleButton.svelte';
	import ModalIcon from '$lib/layouts/ModalIcon.svelte';
	const settings: ShellPageSettings = {
		feature: 'Identity',
		name: 'SSH Certificate CAs',
		description: 'Certificate authorities for SSH key signing.',
		icon: 'key'
	};
	onMount(() => startAutoRefresh('layout:sshcertificateauthorities'));
	function deleteCA(id: string) {
		Clients.region()
			.apiV2SshcertificateauthoritiesSshCertificateAuthorityIDDelete({
				sshCertificateAuthorityID: id
			})
			.then(() => invalidate('layout:sshcertificateauthorities'))
			.catch((e: Error) => Clients.error(e));
	}
</script>

<ListPage {settings} resources={data.sshCertificateAuthorities || []}>
	{#snippet tools()}<SubtleButton
			icon="plus"
			label="Create"
			href="/identity/sshcertificateauthorities/create"
		/>{/snippet}
	{#snippet list(cas)}<ShellList
			>{#each cas as resource}<ShellListItem id={resource.metadata.id}>
					{#snippet main()}<ShellListItemHeader metadata={resource.metadata} />{/snippet}
					{#snippet badges()}<ShellListItemBadges metadata={resource.metadata} />{/snippet}
					{#snippet menu()}<ModalIcon
							icon="trash"
							label="Delete"
							class="menu__item menu__item--danger"
							title="Delete CA?"
							confirm={() => deleteCA(resource.metadata.id)}
							>Removing "{resource.metadata.name}" may prevent instance login.</ModalIcon
						>{/snippet}
					<ShellListItemMetadata metadata={resource.metadata} />
					<ShellMetadataItem
						icon="key"
						label="Public Key"
						value={resource.spec.publicKey.slice(0, 40) + '…'}
					/>
				</ShellListItem>{/each}</ShellList
		>{/snippet}
	{#snippet empty()}<Placeholder>No SSH certificate authorities yet.</Placeholder>{/snippet}
</ListPage>
