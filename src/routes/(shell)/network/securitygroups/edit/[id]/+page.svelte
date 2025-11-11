<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	import * as Clients from '$lib/clients';
	import * as Region from '$lib/openapi/region';

	import type { ShellPageSettings } from '$lib/layouts/types.ts';
	import ShellPageHeader from '$lib/layouts/ShellPageHeader.svelte';
	import ShellMetadataSection from '$lib/layouts/ShellMetadataSection.svelte';
	import ResourceList from '$lib/layouts/ResourceList.svelte';
	import Button from '$lib/forms/Button.svelte';
	import SecurityGroupRule from '$lib/SecurityGroupRule.svelte';

	const settings: ShellPageSettings = {
		feature: 'Security Groups',
		name: 'Update Security Group',
		description: 'Updates an existing security group.',
		icon: 'mdi:security-network'
	};

	let resource = $derived.by(() => {
		let securitygroup = $state(data.securityGroup);
		return securitygroup;
	});

	let metadataValid = $state(false);

	let names: Array<string> = [];

	let rules: Array<Region.SecurityGroupRule> = $derived.by(() => {
		let rules = $state(resource.spec.rules);
		return rules;
	});

	let ruleActive: boolean = $state(false);

	let ruleValid: boolean = $state(false);

	let valid = $derived(metadataValid && !ruleActive);

	function ruleAdd(): number {
		rules.push({
			direction: Region.NetworkDirection.Ingress,
			protocol: Region.NetworkProtocol.Tcp,
			port: {
				number: 22
			},
			cidr: '0.0.0.0/0'
		});

		return rules.length - 1;
	}

	function ruleRemove(index: number) {
		rules.splice(index, 1);
	}

	function submit() {
		const parameters: Region.ApiV2SecuritygroupsSecurityGroupIDPutRequest = {
			securityGroupID: resource.metadata.id,
			securityGroupV2Update: resource
		};

		Clients.region()
			.apiV2SecuritygroupsSecurityGroupIDPut(parameters)
			.then(() => window.location.assign('/network/securitygroups'))
			.catch((e: Error) => Clients.error(e));
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
	{#snippet normal(rule: Region.SecurityGroupRule, index: number)}
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
			{rule.port.number
				? rule.port.number.toString()
				: rule.port.range
					? rule.port.range.start.toString() + '-' + rule.port.range.end.toString()
					: ''}
		</div>
		<div class="flex gap-2 items-center">
			<iconify-icon icon="mdi:check-network-outline" class="text-2xl"></iconify-icon>

			{rule.cidr}
		</div>
	{/snippet}

	<!-- eslint-disable @typescript-eslint/no-unused-vars -->
	{#snippet expanded(rule: Region.SecurityGroupRule, index: number)}
		<div class="flex flex-col gap-4">
			<SecurityGroupRule bind:rule={rules[index]} bind:valid={ruleValid} />
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
		label="Update"
		class="preset-filled-primary-500"
		clicked={submit}
		disabled={!valid}
	/>
</div>
