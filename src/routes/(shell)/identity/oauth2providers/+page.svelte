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
	import Placeholder from '$lib/layouts/Placeholder.svelte';
	import SubtleButton from '$lib/forms/SubtleButton.svelte';
	import ModalIcon from '$lib/layouts/ModalIcon.svelte';
	const settings: ShellPageSettings = {
		feature: 'Identity',
		name: 'OAuth2 Providers',
		description: 'External identity providers for authentication.',
		icon: 'shield'
	};
	onMount(() => startAutoRefresh('layout:oauth2providers'));
	function deleteProvider(id: string) {
		Clients.identity()
			.apiV1OrganizationsOrganizationIDOauth2providersProviderIDDelete({
				organizationID: data.organizationID,
				providerID: id
			})
			.then(() => invalidate('layout:oauth2providers'))
			.catch((e: Error) => Clients.error(e));
	}
</script>

<ListPage {settings} resources={data.oauth2providers || []}>
	{#snippet tools()}<SubtleButton
			icon="plus"
			label="Create"
			href="/identity/oauth2providers/create"
		/>{/snippet}
	{#snippet list(providers)}<ShellList
			>{#each providers as resource}<ShellListItem id={resource.metadata.id}>
					{#snippet main()}<ShellListItemHeader metadata={resource.metadata} />{/snippet}
					{#snippet badges()}<ShellListItemBadges metadata={resource.metadata} />{/snippet}
					{#snippet menu()}<ModalIcon
							icon="trash"
							label="Delete"
							class="menu__item menu__item--danger"
							title="Delete provider?"
							confirm={() => deleteProvider(resource.metadata.id)}
							>Removing "{resource.metadata.name}" may prevent user authentication.</ModalIcon
						>{/snippet}
					<ShellListItemMetadata metadata={resource.metadata} />
				</ShellListItem>{/each}</ShellList
		>{/snippet}
	{#snippet empty()}<Placeholder>No OAuth2 providers configured.</Placeholder>{/snippet}
</ListPage>
