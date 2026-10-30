<script lang="ts">
	import * as Compute from '#lib/openapi/compute/index.ts';
	import Select from '#lib/forms/Select.svelte';
	import TextInput from '#lib/forms/TextInput.svelte';
	import InputChips from '#lib/forms/InputChips.svelte';
	import * as Validators from '#lib/validation/index.ts';

	interface Props {
		// rule is the object we are filling in.
		rule: Compute.FirewallRule;
		// valid if the all field validators resolve to true.
		valid?: boolean;
	}

	let { rule = $bindable(), valid = $bindable(false) }: Props = $props();

	let port: string = $state(rule.port != 0 ? rule.port.toString() : '');
	let portValid: boolean = $state(false);

	let portMax: string = $state(rule.portMax && rule.portMax != 0 ? rule.portMax.toString() : '');
	let portMaxValid: boolean = $state(false);

	let prefixes: Array<string> = $state(rule.prefixes);

	$effect.pre(() => {
		valid = portValid && portMaxValid && prefixes.length > 0;
	});

	$effect.pre(() => {
		const x = parseInt(port, 10);
		if (!isNaN(x)) {
			rule.port = x;
		}

		if (!portMax) {
			delete rule.portMax;

			return;
		}

		const y = parseInt(portMax, 10);
		if (!isNaN(y)) {
			rule.portMax = y;
		}
	});

	$effect.pre(() => {
		rule.prefixes = prefixes;
	});
</script>

<Select
	label="Network Direction"
	hint="Ingress allows traffic to the host, egress traffic from the host."
	bind:value={rule.direction}
>
	{#each Object.values(Compute.FirewallRuleDirectionEnum) as direction}
		<option value={direction}>{direction}</option>
	{/each}
</Select>

<Select label="Network Protocol" hint="OSI layer 4 transport protocol" bind:value={rule.protocol}>
	{#each Object.values(Compute.FirewallRuleProtocolEnum) as protocol}
		<option value={protocol}>{protocol}</option>
	{/each}
</Select>

<TextInput
	label="Port"
	hint="Port number, or start of range of ports (specified as 100-200 inclusive), to allow access to."
	bind:value={port}
	bind:valid={portValid}
	validators={[Validators.stringInt]}
/>

<TextInput
	label="Port Range End"
	hint="If specified this is the end of the port range, including this port number."
	bind:value={portMax}
	bind:valid={portMaxValid}
	validators={[Validators.stringIntOrUndefined]}
/>

<InputChips
	name="ingress-cidr"
	label="Address Ranges"
	hint="Address ranges to allow access to the selected port.  0.0.0.0/0 allows traffic from any host."
	bind:value={prefixes}
/>
