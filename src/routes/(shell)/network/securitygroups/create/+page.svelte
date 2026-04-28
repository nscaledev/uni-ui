<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
	import * as Clients from '$lib/clients';
	import * as Region from '$lib/openapi/region';
	import FormPage from '$lib/layouts/FormPage.svelte';
	import ShellMetadataSection from '$lib/layouts/ShellMetadataSection.svelte';
	import ResourceList from '$lib/layouts/ResourceList.svelte';
	import SecurityGroupRuleV2 from '$lib/SecurityGroupRuleV2.svelte';
	import Icon from '$lib/primitives/Icon.svelte';
	let names: Array<string> = [];
	// eslint-disable-next-line svelte/valid-compile
	const networkId = data.network.metadata.id;
	let resource: Region.SecurityGroupV2Create = $state({
		metadata: { name: '' },
		spec: { networkId, rules: [] }
	});
	let metadataValid = $state(false);
	let rules: Array<Region.SecurityGroupRuleV2> = $state([]);
	let ruleActive = $state(false);
	let ruleValid = $state(false);
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
	function printPortRange(rule: Region.SecurityGroupRuleV2): string {
		if (
			rule.protocol !== Region.NetworkProtocol.Tcp &&
			rule.protocol !== Region.NetworkProtocol.Udp
		)
			return 'none';
		if (!rule.port) return 'any';
		if (!rule.portMax) return rule.port.toString();
		return rule.port + '–' + rule.portMax;
	}
	function submit() {
		resource.spec.rules = rules;
		Clients.region()
			.apiV2SecuritygroupsPost({ securityGroupV2Create: resource })
			.then(() => window.location.assign('/network/securitygroups'))
			.catch((e: Error) => Clients.error(e));
	}
</script>

<FormPage
	breadcrumb={[{ label: 'Security Groups', href: '/network/securitygroups' }, { label: 'Create' }]}
	cancelHref="/network/securitygroups"
	submitLabel="Create Security Group"
	onSubmit={submit}
	{valid}
>
	{#snippet form()}
		<ShellMetadataSection metadata={resource.metadata} {names} bind:valid={metadataValid} />
		<ResourceList
			title="Rules"
			columns={4}
			items={rules}
			bind:active={ruleActive}
			valid={ruleValid}
			add={ruleAdd}
			remove={ruleRemove}
		>
			<!-- eslint-disable @typescript-eslint/no-unused-vars -->
			{#snippet normal(rule: Region.SecurityGroupRuleV2, _ruleIndex: number)}
				<div class="rule-cell"><Icon name="arrowsUpDown" size={16} />{rule.direction}</div>
				<div class="rule-cell"><Icon name="layers" size={16} />{rule.protocol}</div>
				<div class="rule-cell"><Icon name="usb" size={16} />{printPortRange(rule)}</div>
				<div class="rule-cell"><Icon name="checkNetwork" size={16} />{rule.prefix ?? 'any'}</div>
			{/snippet}
			{#snippet expanded(_ruleItem: Region.SecurityGroupRuleV2, index: number)}
				<SecurityGroupRuleV2 bind:rule={rules[index]} bind:valid={ruleValid} />
			{/snippet}
			<!-- eslint-enable @typescript-eslint/no-unused-vars -->
		</ResourceList>
	{/snippet}
</FormPage>

<style>
	.rule-cell {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 13px;
	}
</style>
