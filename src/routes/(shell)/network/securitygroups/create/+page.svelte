<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator';

	import * as Clients from '$lib/clients';
	import * as Region from '$lib/openapi/region';

	import type { ShellPageSettings } from '$lib/layouts/types.ts';
	import ShellPageHeader from '$lib/layouts/ShellPageHeader.svelte';
	import ShellMetadataSection from '$lib/layouts/ShellMetadataSection.svelte';
	import ResourceList from '$lib/layouts/ResourceList.svelte';
	import Button from '$lib/forms/Button.svelte';
	import SecurityGroupRuleV2 from '$lib/SecurityGroupRuleV2.svelte';

	const settings: ShellPageSettings = {
		feature: 'Security Groups',
		name: 'Create Security Group',
		description:
			'Create a new security group in the network.  This can be attached multiple times to any workload pool or server instance.',
		icon: 'mdi:security-network'
	};

	let resource: Region.SecurityGroupV2Create = $state({
		metadata: {
			name: uniqueNamesGenerator({
				dictionaries: [adjectives, animals],
				separator: '-',
				length: 2
			})
		},
		spec: {
			networkId: data.network.metadata.id,
			rules: []
		}
	});

	let metadataValid = $state(false);

	let names: Array<string> = [];

	let rules: Array<Region.SecurityGroupRuleV2> = $state([]);

	let ruleActive: boolean = $state(false);

	let ruleValid: boolean = $state(false);

	let valid = $derived(metadataValid && !ruleActive);

	function ruleAdd(): number {
		rules.push({
			direction: Region.NetworkDirection.Ingress,
			protocol: Region.NetworkProtocol.Tcp
		});

		return rules.length - 1;
	}

	function ruleRemove(index: number) {
		rules.splice(index, 1);
	}

	function submit() {
		resource.spec.rules = rules;

		const parameters: Region.ApiV2SecuritygroupsPostRequest = {
			securityGroupV2Create: resource
		};

		Clients.region()
			.apiV2SecuritygroupsPost(parameters)
			.then(() => window.location.assign('/network/securitygroups'))
			.catch((e: Error) => Clients.error(e));
	}

	function printPortRange(rule: Region.SecurityGroupRuleV2): string {
		if (
			rule.protocol != Region.NetworkProtocol.Tcp &&
			rule.protocol != Region.NetworkProtocol.Udp
		) {
			return 'none';
		}

		if (!rule.port) return 'any';

		if (!rule.portMax) return rule.port.toString();

		return rule.port.toString() + '-' + rule.portMax.toString();
	}

	function printPrefix(rule: Region.SecurityGroupRuleV2): string {
		if (!rule.prefix) return 'any';

		return rule.prefix;
	}
</script>

<ShellPageHeader {settings} />

<ShellMetadataSection metadata={resource.metadata} {names} bind:valid={metadataValid} />

<ResourceList
	title="Rules"
	titleClass="h3"
	columns={4}
	items={rules}
	bind:active={ruleActive}
	valid={ruleValid}
	add={ruleAdd}
	remove={ruleRemove}
>
	<!-- eslint-disable @typescript-eslint/no-unused-vars -->
	{#snippet normal(rule: Region.SecurityGroupRuleV2, index: number)}
		<div class="flex gap-2 items-center">
			<iconify-icon icon="tabler:arrows-down-up" class="text-2xl"></iconify-icon>
			{rule.direction}
		</div>
		<div class="flex gap-2 items-center">
			<iconify-icon icon="tabler:protocol" class="text-2xl"></iconify-icon>
			{rule.protocol}
		</div>
		<div class="flex gap-2 items-center">
			<iconify-icon icon="fluent:usb-port-24-regular" class="text-2xl"></iconify-icon>
			{printPortRange(rule)}
		</div>
		<div class="flex gap-2 items-center">
			<iconify-icon icon="mdi:check-network-outline" class="text-2xl"></iconify-icon>

			{printPrefix(rule)}
		</div>
	{/snippet}

	<!-- eslint-disable @typescript-eslint/no-unused-vars -->
	{#snippet expanded(rule: Region.SecurityGroupRuleV2, index: number)}
		<div class="flex flex-col gap-4">
			<SecurityGroupRuleV2 bind:rule={rules[index]} bind:valid={ruleValid} />
		</div>
	{/snippet}
</ResourceList>

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
