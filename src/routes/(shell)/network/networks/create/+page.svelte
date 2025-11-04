<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator';

	import * as Clients from '$lib/clients';
	import * as Region from '$lib/openapi/region';

	import type { ShellPageSettings } from '$lib/layouts/types.ts';
	import ShellPageHeader from '$lib/layouts/ShellPageHeader.svelte';
	import ShellMetadataSection from '$lib/layouts/ShellMetadataSection.svelte';
	import ShellSection from '$lib/layouts/ShellSection.svelte';
	import TextInput from '$lib/forms/TextInput.svelte';
	import InputChips from '$lib/forms/InputChips.svelte';
	import Button from '$lib/forms/Button.svelte';

	const settings: ShellPageSettings = {
		feature: 'Network',
		name: 'Create Network',
		description: 'Create and deploy a new network.',
		icon: 'mdi:network-outline'
	};

	let resource: Region.NetworkV2Write = $state({
		metadata: {
			name: uniqueNamesGenerator({
				dictionaries: [adjectives, animals],
				separator: '-',
				length: 2
			})
		},
		spec: {
			organizationId: data.organizationID,
			projectId: data.projectID,
			regionId: data.regionID,
			prefix: '192.168.0.0/24',
			dnsNameservers: ['8.8.8.8', '8.8.4.4']
		}
	});

	let metadataValid = $state(false);

	let valid = $derived(metadataValid);

	let names: Array<string> = [];

	function submit() {
		const parameters = {
			networkV2Write: resource
		};

		Clients.region()
			.apiV2NetworksPost(parameters)
			.then(() => window.location.assign('/network/networks'))
			.catch((e: Error) => Clients.error(e));
	}
</script>

<ShellPageHeader {settings} />

<ShellMetadataSection metadata={resource.metadata} {names} bind:valid={metadataValid} />

<ShellSection title="Configuration">
	<TextInput
		label="Choose a network prefix."
		hint="Must be at least a /24, the top /25 is reserved for storage integration."
		bind:value={resource.spec.prefix}
	/>

	<InputChips
		label="DNS nameservers"
		hint="You must specify at least one DNS nameserver."
		name="dns-nameservers"
		bind:value={resource.spec.dnsNameservers}
	/>
</ShellSection>

<div class="flex justify-between">
	<Button
		icon="mdi:cancel-bold"
		label="Cancel"
		class="preset-outlined-surface-600-400"
		href="/network/networks"
	/>
	<Button
		icon="mdi:tick"
		label="Create"
		class="preset-filled-primary-500"
		clicked={submit}
		disabled={!valid}
	/>
</div>
